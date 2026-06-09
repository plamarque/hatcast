import { readFileSync } from 'fs'

import {
  addDays,
  calendarDaysBetween,
  isoWeekKey,
  localDateKey,
  parisMorningUtc,
  toDate,
} from './date-utils.js'
import { INTENT_TO_CATEGORY, audienceRoleForCategory } from './intent-catalog.js'
import { computeRawLifecycle } from './lifecycle.js'
import {
  buildSeasonModel,
  confirmedAssigneeIds,
  organizerParticipants,
  pendingAssigneeIds,
  teamCompleteMemberIds,
} from './season-model.js'
import { buildVolumeReport } from './stats.js'

/**
 * @typedef {object} PreferenceConfig
 * @property {boolean} pushGlobalEnabled
 * @property {Record<string, { push: boolean, email: boolean }>} categories
 * @property {Record<string, boolean>} [transactionalEmailBypassesCategoryOptIn]
 */

/**
 * @typedef {object} SimulatorOptions
 * @property {PreferenceConfig} preferences
 * @property {string} [defaultEventTime='19:00']
 * @property {number} [createdLeadDays=45]
 * @property {number} [slaHorizonDays=30]
 * @property {number} [compositionIncompleteWeeklyCadenceDays=7]
 * @property {boolean} [includeScheduledJobs=true]
 * @property {boolean} [includeOrgaDraftCreated=true]
 */

/** Intents not inferable from V1 end-state snapshot (documented limitation). */
export const NON_REPLAYABLE_INTENTS = [
  'MANUAL_AVAILABILITY_ANNOUNCE',
  'MANUAL_AVAILABILITY_NUDGE',
  'RECONFIRMATION_REQUEST',
  'REMOVED_FROM_COMPOSITION',
  'PROXY_AVAILABILITY_RECORDED',
  'PROXY_CONFIRMATION_RECORDED',
  'EVENT_DETAILS_CHANGED',
  'TEAM_REGRESSED',
  'AVAILABILITY_PENDING_REMINDER',
  'COMPOSITION_SHARED',
  'ORGANIZER_SCOPE_GRANTED',
  'TEAM_VALIDATED_FYI',
]

/**
 * @param {string} path
 * @returns {PreferenceConfig}
 */
export function loadPreferences(path) {
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  return {
    pushGlobalEnabled: parsed.pushGlobalEnabled === true,
    categories: parsed.categories || {},
    transactionalEmailBypassesCategoryOptIn: parsed.transactionalEmailBypassesCategoryOptIn || {},
  }
}

/**
 * @param {object} rawJson
 * @param {SimulatorOptions} options
 */
export function simulateNotificationVolume(rawJson, options) {
  const model = buildSeasonModel(rawJson, {
    defaultEventTime: options.defaultEventTime,
    createdLeadDays: options.createdLeadDays,
  })
  const deliveries = replayDeliveries(model, options)
  const report = buildVolumeReport(deliveries)
  return {
    model: {
      seasonName: model.seasonName,
      v1SeasonId: model.v1SeasonId,
      participantCount: model.participants.length,
      organizerCount: organizerParticipants(model).length,
      eventCount: model.events.length,
      seasonStart: model.seasonStart.toISOString(),
      seasonEnd: model.seasonEnd.toISOString(),
    },
    assumptions: buildAssumptions(options),
    limitations: {
      nonReplayableIntents: NON_REPLAYABLE_INTENTS,
      note:
        'Le dump V1 est un état final sans journal d’audit : les transitions intermédiaires (retraits, revalidations, annonces manuelles, proxies) ne sont pas rejouées.',
    },
    deliveries,
    report,
  }
}

/**
 * @param {ReturnType<typeof buildSeasonModel>} model
 * @param {SimulatorOptions} options
 */
function replayDeliveries(model, options) {
  /** @type {import('./stats.js').SimulatedDelivery[]} */
  const deliveries = []
  const prefs = options.preferences
  const organizers = organizerParticipants(model)
  const organizerIds = organizers.map((o) => o.id)

  for (const event of model.events) {
    if (event.createdAtEstimate) {
      for (const orgId of organizerIds) {
        if (options.includeOrgaDraftCreated !== false) {
          emit(deliveries, {
            recipientId: orgId,
            recipientRole: 'organizer',
            eventId: event.v1EventId,
            intent: 'EVENT_DRAFT_CREATED',
            timestamp: event.createdAtEstimate.toISOString(),
            prefs,
          })
        }
      }
    }

    if (event.availabilityOpenedAt) {
      for (const participantId of event.rosterParticipantIds) {
        emit(deliveries, {
          recipientId: participantId,
          recipientRole: 'participant',
          eventId: event.v1EventId,
          intent: 'AVAILABILITY_OPENED',
          timestamp: event.availabilityOpenedAt.toISOString(),
          prefs,
        })
      }
    }

    if (event.validatedAt) {
      const ts = event.validatedAt
      for (const participantId of pendingAssigneeIds(event)) {
        emit(deliveries, {
          recipientId: participantId,
          recipientRole: 'participant',
          eventId: event.v1EventId,
          intent: 'CONFIRMATION_REQUEST',
          timestamp: ts,
          prefs,
        })
      }
    }

    if (event.lifecycle === 'COMPLETE' && event.validatedAt) {
      const ts = event.validatedAt
      const memberIds = new Set(teamCompleteMemberIds(event))
      for (const orgId of organizerIds) memberIds.add(orgId)
      for (const participantId of memberIds) {
        const isOrg = organizerIds.includes(participantId)
        emit(deliveries, {
          recipientId: participantId,
          recipientRole: isOrg ? 'organizer' : 'participant',
          eventId: event.v1EventId,
          intent: isOrg ? 'TEAM_COMPLETE' : 'TEAM_COMPLETE_MEMBER',
          timestamp: ts,
          prefs,
        })
      }
    }

    if (event.archived && event.startsAt) {
      for (const participantId of event.engagedParticipantIds) {
        emit(deliveries, {
          recipientId: participantId,
          recipientRole: 'participant',
          eventId: event.v1EventId,
          intent: 'EVENT_ARCHIVED',
          timestamp: event.startsAt.toISOString(),
          prefs,
        })
      }
    }

    if (event.validatedAt && event.startsAt) {
      for (const participantId of confirmedAssigneeIds(event)) {
        for (const [days, intent] of [
          [7, 'ASSIGNEE_PRESENCE_REMINDER_D7'],
          [1, 'ASSIGNEE_PRESENCE_REMINDER_D1'],
        ]) {
          const reminderDate = addDays(event.startsAt, -days)
          if (reminderDate < model.seasonStart) continue
          emit(deliveries, {
            recipientId: participantId,
            recipientRole: 'participant',
            eventId: event.v1EventId,
            intent,
            timestamp: parisMorningUtc(localDateKey(reminderDate)).toISOString(),
            prefs,
          })
        }
      }
    }
  }

  if (options.includeScheduledJobs !== false) {
    deliveries.push(...replayScheduledJobs(model, options, organizerIds))
  }

  return deliveries
}

/**
 * @param {ReturnType<typeof buildSeasonModel>} model
 * @param {SimulatorOptions} options
 * @param {string[]} organizerIds
 */
function replayScheduledJobs(model, options, organizerIds) {
  /** @type {import('./stats.js').SimulatedDelivery[]} */
  const out = []
  const prefs = options.preferences
  const horizon = options.slaHorizonDays ?? 30
  const weeklyCadence = options.compositionIncompleteWeeklyCadenceDays ?? 7

  const startKey = localDateKey(model.seasonStart)
  const endKey = localDateKey(model.seasonEnd)
  let cursor = toDate(`${startKey}T00:00:00.000Z`)

  /** @type {Map<string, Map<string, string>>} intent -> eventId -> userId -> lastSentIso */
  const lastWeeklySent = new Map()

  while (localDateKey(cursor) <= endKey) {
    const dayKey = localDateKey(cursor)
    const morning = parisMorningUtc(dayKey)

    for (const event of model.events) {
      if (!event.startsAt) continue

      const daysUntil = calendarDaysBetween(morning, event.startsAt)
      const isDraft = event.availabilityOpenedAt == null && !event.archived

      if (isDraft && daysUntil >= 0 && daysUntil <= horizon) {
        for (const orgId of organizerIds) {
          emit(out, {
            recipientId: orgId,
            recipientRole: 'organizer',
            eventId: event.v1EventId,
            intent: 'SLA_OPEN_AVAILABILITY',
            timestamp: morning.toISOString(),
            prefs,
          })
        }
      }

      if (event.validatedAt && isIncompleteValidated(event)) {
        for (const orgId of organizerIds) {
          const weeklyKey = `${event.v1EventId}:${orgId}`
          const lastMap = lastWeeklySent.get('COMPOSITION_INCOMPLETE_WEEKLY') ?? new Map()
          const lastSent = lastMap.get(weeklyKey)
          const daysSince = lastSent ? calendarDaysBetween(toDate(lastSent), morning) : Infinity
          const isMonday = new Date(morning).getUTCDay() === 1
          if (isMonday && daysSince >= weeklyCadence) {
            emit(out, {
              recipientId: orgId,
              recipientRole: 'organizer',
              eventId: event.v1EventId,
              intent: 'COMPOSITION_INCOMPLETE_WEEKLY',
              timestamp: morning.toISOString(),
              prefs,
            })
            lastMap.set(weeklyKey, morning.toISOString())
            lastWeeklySent.set('COMPOSITION_INCOMPLETE_WEEKLY', lastMap)
          }

          if (daysUntil === 7) {
            emit(out, {
              recipientId: orgId,
              recipientRole: 'organizer',
              eventId: event.v1EventId,
              intent: 'COMPOSITION_INCOMPLETE_DAILY_J7',
              timestamp: morning.toISOString(),
              prefs,
            })
          }
        }
      }
    }

    cursor = addDays(cursor, 1)
  }

  return out
}

/**
 * @param {import('./season-model.js').SimulatedEvent} event
 */
function isIncompleteValidated(event) {
  if (!event.validatedAt) return false
  const lifecycle = computeRawLifecycle(
    { validatedAt: event.validatedAt, publishedAt: event.publishedAt },
    event.slots,
    event.roleSlots,
  )
  return lifecycle !== 'COMPLETE'
}

/**
 * @param {import('./stats.js').SimulatedDelivery[]} bucket
 * @param {object} params
 */
function emit(bucket, params) {
  const category = INTENT_TO_CATEGORY[params.intent]
  if (!category) return
  const role = audienceRoleForCategory(category)
  const pref = params.prefs.categories[category] ?? { push: true, email: true }
  const transactionalEmail =
    params.prefs.transactionalEmailBypassesCategoryOptIn?.[params.intent] === true

  for (const channel of ['push', 'email']) {
    const allowed =
      channel === 'push'
        ? params.prefs.pushGlobalEnabled && pref.push
        : pref.email || (channel === 'email' && transactionalEmail)

    bucket.push({
      recipientId: params.recipientId,
      recipientRole: params.recipientRole ?? role,
      eventId: params.eventId ?? null,
      intent: params.intent,
      channel,
      timestamp: params.timestamp,
      delivered: allowed,
      weekKey: isoWeekKey(toDate(params.timestamp)),
    })
  }
}

/**
 * @param {PreferenceConfig} prefs
 */
function orgCategoriesOptedIn(prefs) {
  const orgKeys = Object.keys(prefs.categories || {}).filter((k) => k.startsWith('ORG_'))
  return orgKeys.length > 0 && orgKeys.every((k) => prefs.categories[k]?.email || prefs.categories[k]?.push)
}

/**
 * @param {SimulatorOptions} options
 */
function buildAssumptions(options) {
  return [
    'Dump V1 MIG-2/MIG-3 (raw.json) — état final, pas de journal notification V1.',
    `Création spectacle estimée ≈ J-${options.createdLeadDays ?? 45} avant la date du show (séquentiel).`,
    'Dispos ouvertes (= AVAILABILITY_OPENED) si engagement détecté (dispo, cast ou déclin).',
    'Validate compo → CONFIRMATION_REQUEST aux assignés encore pending (état final).',
    'Rappels présence J-7/J-1 pour assignés confirmed sur compo validée (08:00 Europe/Paris).',
    'Jobs orga SLA / compo incomplète simulés jour par jour sur la plage saison.',
    `Préférences: push global ${options.preferences.pushGlobalEnabled ? 'ON' : 'OFF'} ; catégories ORG_* ${orgCategoriesOptedIn(options.preferences) ? 'opt-in ON (scénario orga activé)' : 'opt-in OFF par défaut'}.`,
    'Non simulé: manuels Share, proxies, retraits, changements détail, revalidations, rappels dispo 8.7.',
  ]
}

export { buildSeasonModel, buildVolumeReport }
