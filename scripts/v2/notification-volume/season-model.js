import { normalizeEmail } from '../../v1/troupeMembersCsv.js'
import {
  addDays,
  calendarDaysBetween,
  localDateKey,
  parseV1EventStartsAt,
  toDate,
} from './date-utils.js'
import {
  computeRawLifecycle,
  mapCompositionLifecycle,
  mapParticipationStatus,
  normalizeRoleSlots,
  requiredPositions,
} from './lifecycle.js'

/**
 * @typedef {object} SeasonParticipant
 * @property {string} id v1PlayerId
 * @property {string|null} email
 * @property {string|null} name
 * @property {boolean} isOrganizer
 */

/**
 * @typedef {object} SimulatedEvent
 * @property {string} v1EventId
 * @property {string} title
 * @property {boolean} archived
 * @property {Date|null} startsAt
 * @property {Date} createdAtEstimate
 * @property {Date|null} availabilityOpenedAt
 * @property {Record<string, number>} roleSlots
 * @property {string|null} validatedAt
 * @property {string|null} publishedAt
 * @property {string} lifecycle
 * @property {Array<{ roleKey: string, slotIndex: number, participantId: string|null, participationStatus: string, waived: boolean }>} slots
 * @property {Set<string>} engagedParticipantIds
 * @property {Set<string>} rosterParticipantIds
 * @property {Set<string>} answeredParticipantIds
 * @property {Set<string>} unknownParticipantIds
 */

/**
 * @param {object} raw dump from migrate-malice-extract
 * @param {object} [options]
 * @param {string} [options.defaultEventTime='19:00']
 * @param {number} [options.createdLeadDays=45]
 */
export function buildSeasonModel(raw, options = {}) {
  const defaultEventTime = options.defaultEventTime ?? '19:00'
  const createdLeadDays = options.createdLeadDays ?? 45

  const players = buildParticipants(raw)
  const organizerEmails = buildOrganizerEmailSet(raw?.season?.roles)
  for (const p of players) {
    p.isOrganizer = p.email != null && organizerEmails.has(normalizeEmail(p.email))
  }

  const availabilityByEvent = indexAvailability(raw?.availability || [])
  const castByEvent = indexCasts(raw?.casts || [])
  const sortedEvents = [...(raw?.events || [])].sort((a, b) => {
    const ta = parseV1EventStartsAt(a.date, defaultEventTime)?.getTime() ?? Number.POSITIVE_INFINITY
    const tb = parseV1EventStartsAt(b.date, defaultEventTime)?.getTime() ?? Number.POSITIVE_INFINITY
    if (ta !== tb) return ta - tb
    return String(a.title || '').localeCompare(String(b.title || ''), 'fr')
  })

  const seasonStart =
    sortedEvents.length > 0
      ? addDays(parseV1EventStartsAt(sortedEvents[0].date, defaultEventTime) ?? new Date(), -createdLeadDays)
      : new Date()

  const rosterIds = new Set(players.map((p) => p.id))
  /** @type {SimulatedEvent[]} */
  const events = []
  let previousCreated = seasonStart

  for (const evt of sortedEvents) {
    const startsAt = parseV1EventStartsAt(evt.date, defaultEventTime)
    const createdCandidate =
      startsAt != null ? addDays(startsAt, -createdLeadDays) : addDays(previousCreated, 7)
    const createdAtEstimate = new Date(Math.max(createdCandidate.getTime(), addDays(previousCreated, 1).getTime()))
    previousCreated = createdAtEstimate

    const cast = castByEvent.get(String(evt.id)) || null
    const lifecycleTs = cast
      ? mapCompositionLifecycle(cast.status, cast.confirmedAt, cast.updatedAt, cast.confirmed)
      : { validatedAt: null, publishedAt: null }

    const roleSlots = normalizeRoleSlots(evt.roles || {})
    const slots = buildSlots(cast, roleSlots)
    const composition = lifecycleTs.validatedAt ? lifecycleTs : null
    const lifecycle = computeRawLifecycle(composition, slots, roleSlots)

    const availabilityRows = availabilityByEvent.get(String(evt.id)) || []
    const answeredParticipantIds = new Set(
      availabilityRows.map((r) => r.v1PlayerId).filter((id) => rosterIds.has(id)),
    )
    const unknownParticipantIds = new Set(
      [...rosterIds].filter((id) => !answeredParticipantIds.has(id)),
    )
    const engaged = new Set(answeredParticipantIds)
    for (const slot of slots) {
      if (slot.participantId) engaged.add(slot.participantId)
    }
    if (cast?.declined) {
      for (const roleDeclines of Object.values(cast.declined)) {
        if (!Array.isArray(roleDeclines)) continue
        for (const pid of roleDeclines) engaged.add(String(pid))
      }
    }

    const hasEngagement = engaged.size > 0 || cast != null
    const availabilityOpenedAt = hasEngagement && !evt.archived ? createdAtEstimate : null

    events.push({
      v1EventId: String(evt.id),
      title: String(evt.title || evt.id),
      archived: evt.archived === true,
      startsAt,
      createdAtEstimate,
      availabilityOpenedAt,
      roleSlots,
      validatedAt: lifecycleTs.validatedAt,
      publishedAt: lifecycleTs.publishedAt,
      lifecycle,
      slots,
      engagedParticipantIds: engaged,
      rosterParticipantIds: rosterIds,
      answeredParticipantIds,
      unknownParticipantIds,
    })
  }

  return {
    schema: 'hatcast/notification-volume/season-model@1',
    v1SeasonId: raw?.v1SeasonId ?? null,
    seasonName: raw?.season?.name ?? null,
    extractedAt: raw?.extractedAt ?? null,
    participants: players,
    events,
    seasonStart,
    seasonEnd:
      events.length > 0
        ? events.reduce(
            (max, e) => (e.startsAt && e.startsAt > max ? e.startsAt : max),
            events[0].startsAt ?? seasonStart,
          )
        : seasonStart,
  }
}

/**
 * @param {object} raw
 * @returns {SeasonParticipant[]}
 */
function buildParticipants(raw) {
  return (raw?.players || []).map((p) => ({
    id: String(p.id),
    email: typeof p.email === 'string' ? p.email : null,
    name: typeof p.name === 'string' ? p.name : null,
    isOrganizer: false,
  }))
}

/**
 * @param {{ admins?: string[], users?: string[] }|undefined} roles
 */
function buildOrganizerEmailSet(roles) {
  const emails = [...(roles?.admins || []), ...(roles?.users || [])]
  return new Set(emails.map((e) => normalizeEmail(String(e || ''))).filter(Boolean))
}

/**
 * @param {Array<object>} records
 */
function indexAvailability(records) {
  /** @type {Map<string, Array<{ v1PlayerId: string, available: boolean }>>} */
  const map = new Map()
  for (const rec of records) {
    const eventId = String(rec.v1EventId || '')
    if (!map.has(eventId)) map.set(eventId, [])
    map.get(eventId).push({
      v1PlayerId: String(rec.v1PlayerId),
      available: rec.available === true,
    })
  }
  return map
}

/**
 * @param {Array<object>|Record<string, object>} casts
 */
function indexCasts(casts) {
  /** @type {Map<string, object>} */
  const map = new Map()
  if (Array.isArray(casts)) {
    for (const c of casts) map.set(String(c.v1EventId || c.id), c)
    return map
  }
  for (const [eventId, data] of Object.entries(casts || {})) {
    map.set(String(eventId), data)
  }
  return map
}

/**
 * @param {object|null} cast
 * @param {Record<string, number>} roleSlots
 */
function buildSlots(cast, roleSlots) {
  if (!cast) return []
  /** @type {Array<{ roleKey: string, slotIndex: number, participantId: string|null, participationStatus: string, waived: boolean }>} */
  const slots = []
  const roles = cast.roles || {}
  const playerStatuses = cast.playerStatuses || {}
  for (const [roleKey, count] of Object.entries(roleSlots)) {
    const assigned = Array.isArray(roles[roleKey]) ? roles[roleKey] : []
    for (let slotIndex = 0; slotIndex < count; slotIndex++) {
      const participantId = assigned[slotIndex] != null ? String(assigned[slotIndex]) : null
      slots.push({
        roleKey,
        slotIndex,
        participantId,
        participationStatus: mapParticipationStatus(participantId ? playerStatuses[participantId] : null),
        waived: false,
      })
    }
  }
  return slots
}

/**
 * @param {SimulatedEvent} event
 * @returns {string[]}
 */
export function confirmedAssigneeIds(event) {
  return event.slots
    .filter((s) => s.participantId && s.participationStatus === 'CONFIRMED')
    .map((s) => s.participantId)
}

/**
 * @param {SimulatedEvent} event
 * @returns {string[]}
 */
export function pendingAssigneeIds(event) {
  return event.slots
    .filter((s) => s.participantId && s.participationStatus === 'PENDING')
    .map((s) => s.participantId)
}

/**
 * @param {SimulatedEvent} event
 * @returns {string[]}
 */
export function teamCompleteMemberIds(event) {
  const byPos = new Map(event.slots.map((s) => [`${s.roleKey}:${s.slotIndex}`, s]))
  const ids = new Set()
  for (const [role, index] of requiredPositions(event.roleSlots)) {
    const row = byPos.get(`${role}:${index}`)
    if (!row?.participantId) continue
    if (row.participationStatus === 'DECLINED') continue
    if (row.participationStatus === 'CONFIRMED' || row.waived) ids.add(row.participantId)
  }
  return [...ids]
}

/**
 * @param {ReturnType<typeof buildSeasonModel>} model
 */
export function organizerParticipants(model) {
  return model.participants.filter((p) => p.isOrganizer)
}

/**
 * @param {ReturnType<typeof buildSeasonModel>} model
 */
export function memberParticipants(model) {
  return model.participants.filter((p) => !p.isOrganizer)
}

/**
 * Published spectacle still collecting availability (no validated composition).
 * @param {SimulatedEvent} event
 */
export function isPublishedCollectingAvailability(event) {
  return !event.archived && event.availabilityOpenedAt != null && event.validatedAt == null
}

/**
 * @param {SimulatedEvent} event
 * @param {Date} referenceMorning
 * @param {number} [horizonDays=21]
 */
export function isInAvailabilityPendingHorizon(event, referenceMorning, horizonDays = 21) {
  if (!event.startsAt) return false
  const daysUntil = calendarDaysBetween(referenceMorning, event.startsAt)
  return daysUntil >= 1 && daysUntil <= horizonDays
}

/**
 * Collecting phase active on this civil day (between open and validate).
 * @param {SimulatedEvent} event
 * @param {Date} referenceMorning
 */
export function isCollectingAvailabilityOnDay(event, referenceMorning) {
  if (event.archived || !event.availabilityOpenedAt) return false
  if (referenceMorning < startOfDay(event.availabilityOpenedAt)) return false
  if (event.validatedAt && referenceMorning >= startOfDay(toDate(event.validatedAt))) return false
  return true
}

/**
 * @param {Date|string} value
 */
function startOfDay(value) {
  const d = value instanceof Date ? value : toDate(value)
  return toDate(`${localDateKey(d)}T00:00:00.000Z`)
}
