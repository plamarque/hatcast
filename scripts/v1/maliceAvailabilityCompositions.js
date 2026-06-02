/**
 * Pure V1 → V2 transform for MIG-3 (availability + compositions).
 *
 * Consumes manifest.json from MIG-2 and raw availability/casts from extract.
 * No Firebase / Postgres — deterministic, unit-testable.
 *
 * Contracts: ADR-0016 §Decision.4 — availability, slots, declines, composition lifecycle.
 */

import { createHash } from 'crypto'

import {
  buildMigratedEventsOpenAvailabilityBackfillSql,
  sqlString,
} from './maliceEventsManifest.js'

export { sqlString }

const SLOT_UUID_NAMESPACE = 'hatcast:mig-3:malice:slot'
const DECLINE_UUID_NAMESPACE = 'hatcast:mig-3:malice:decline'
const AVAILABILITY_UUID_NAMESPACE = 'hatcast:mig-3:malice:availability'

const PARTICIPATION_STATUS_MAP = {
  confirmed: 'CONFIRMED',
  declined: 'DECLINED',
  pending: 'PENDING',
}

/**
 * Deterministic UUID v5 from a stable name (replay-safe).
 * @param {string} name
 * @param {string} namespace
 */
export function deterministicUuid(name, namespace) {
  const hash = createHash('sha1').update(`${namespace}:${name}`).digest()
  const bytes = hash.subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Buffer.from(bytes).toString('hex')
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-')
}

/**
 * @param {string} v2EventId
 * @param {string} roleKey
 * @param {number} slotIndex
 */
export function deterministicSlotUuid(v2EventId, roleKey, slotIndex) {
  return deterministicUuid(`${v2EventId}:${roleKey}:${slotIndex}`, SLOT_UUID_NAMESPACE)
}

/**
 * Decline identity is keyed on (event, role, player) — NOT the array position,
 * so reordering of `declined[role]` between extracts stays replay-safe.
 *
 * @param {string} v2EventId
 * @param {string} roleKey
 * @param {string} v1PlayerId
 */
export function deterministicDeclineUuid(v2EventId, roleKey, v1PlayerId) {
  return deterministicUuid(`${v2EventId}:${roleKey}:${v1PlayerId}`, DECLINE_UUID_NAMESPACE)
}

/**
 * @param {string} v2EventId
 * @param {string} v2UserId
 */
export function deterministicAvailabilityUuid(v2EventId, v2UserId) {
  return deterministicUuid(`${v2EventId}:${v2UserId}`, AVAILABILITY_UUID_NAMESPACE)
}

/**
 * @param {unknown} value Firestore Timestamp, ISO string, or null
 * @returns {string|null} ISO-8601 timestamptz literal source (no quotes)
 */
export function toIsoTimestamp(value) {
  if (value == null) return null
  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d.toISOString()
  }
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000).toISOString()
  }
  return null
}

/**
 * @param {object} manifest MIG-2 manifest.json
 */
export function buildManifestLookups(manifest) {
  const playersByV1 = new Map()
  for (const p of manifest?.players || []) {
    playersByV1.set(String(p.v1PlayerId), p)
  }
  const eventsByV1 = new Map()
  for (const e of manifest?.events || []) {
    eventsByV1.set(String(e.v1EventId), e)
  }
  return { playersByV1, eventsByV1 }
}

/**
 * Resolve a V1 player id via manifest; push reject when missing.
 *
 * @param {string} v1PlayerId
 * @param {Map<string, object>} playersByV1
 * @param {Array<{ reason: string, detail: string }>} rejects
 * @param {string} context
 * @returns {{ v2UserId: string, v2SeasonParticipantId: string } | null}
 */
function resolvePlayer(v1PlayerId, playersByV1, rejects, context) {
  const pid = String(v1PlayerId || '').trim()
  if (!pid) {
    rejects.push({ reason: 'SLOT_EMPTY_PLAYER', detail: `${context}: empty player id` })
    return null
  }
  const match = playersByV1.get(pid)
  if (!match) {
    rejects.push({
      reason: 'PLAYER_UNRESOLVED',
      detail: `${context}: v1 player ${pid} not in manifest`,
    })
    return null
  }
  if (!match.v2UserId) {
    rejects.push({
      reason: 'PLAYER_NO_V2_USER',
      detail: `${context}: v1 player ${pid} has no v2UserId in manifest`,
    })
    return null
  }
  return {
    v2UserId: match.v2UserId,
    v2SeasonParticipantId: match.v2SeasonParticipantId,
  }
}

/**
 * Map V1 cast.status + cast.confirmed + confirmedAt → composition lifecycle timestamps (AC 6).
 *
 * V1 stats use `cast.confirmed` (organizer locked the cast), not `cast.status`. An `incomplete`
 * cast can still be confirmed when the event runs understaffed — it must carry `validated_at`.
 *
 * @param {string|null|undefined} status
 * @param {unknown} confirmedAt
 * @param {unknown} [updatedAt]
 * @param {boolean} [organizerConfirmed] V1 `cast.confirmed`
 * @returns {{ validatedAt: string|null, publishedAt: string|null }}
 */
export function mapCompositionLifecycle(status, confirmedAt, updatedAt, organizerConfirmed) {
  const at =
    toIsoTimestamp(confirmedAt) || toIsoTimestamp(updatedAt) || new Date().toISOString()
  if (organizerConfirmed === true) {
    return { validatedAt: at, publishedAt: at }
  }
  switch (status) {
    case 'confirmed':
      return { validatedAt: at, publishedAt: at }
    case 'pending_confirmation':
      return { validatedAt: at, publishedAt: null }
    case 'incomplete':
    default:
      return { validatedAt: null, publishedAt: null }
  }
}

/**
 * Map V1 playerStatuses value → V2 participation_status (AC 4).
 * @param {string|null|undefined} v1Status
 */
export function mapParticipationStatus(v1Status) {
  const mapped = PARTICIPATION_STATUS_MAP[String(v1Status || '').trim()]
  return mapped || 'PENDING'
}

/**
 * Transform flat V1 availability records → V2 rows (AC 2, 7).
 *
 * @param {Array<object>} records from loadAvailabilityRecords / raw.json
 * @param {object} manifest MIG-2 manifest.json
 * @returns {{ rows: Array<object>, rejects: Array<{ reason: string, detail: string }> }}
 */
export function transformAvailability(records, manifest) {
  const { playersByV1, eventsByV1 } = buildManifestLookups(manifest)
  const rows = []
  const rejects = []

  for (const rec of records || []) {
    const v1EventId = String(rec.v1EventId || '')
    const v1PlayerId = String(rec.v1PlayerId || '')
    const ctx = `availability player=${v1PlayerId} event=${v1EventId}`

    const event = eventsByV1.get(v1EventId)
    if (!event) {
      rejects.push({
        reason: 'EVENT_UNRESOLVED',
        detail: `${ctx}: v1 event ${v1EventId} not in manifest`,
      })
      continue
    }

    const player = resolvePlayer(v1PlayerId, playersByV1, rejects, ctx)
    if (!player) continue

    rows.push({
      id: deterministicAvailabilityUuid(event.v2EventId, player.v2UserId),
      eventId: event.v2EventId,
      userId: player.v2UserId,
      status: rec.available === true ? 'AVAILABLE' : 'UNAVAILABLE',
      roleKeys: Array.isArray(rec.roles) ? rec.roles : [],
      comment: rec.comment != null && rec.comment !== '' ? String(rec.comment) : null,
    })
  }

  return { rows, rejects }
}

/**
 * Normalize raw casts (array or { [v1EventId]: cast }) to array form.
 * @param {Array<object>|Record<string, object>} casts
 */
export function normalizeCastsInput(casts) {
  if (Array.isArray(casts)) {
    return casts.map((c) => ({
      ...c,
      v1EventId: String(c.v1EventId || c.id || ''),
      confirmed: c.confirmed === true,
    }))
  }
  return Object.entries(casts || {}).map(([v1EventId, data]) => ({
    v1EventId,
    roles: data?.roles || {},
    declined: data?.declined || {},
    playerStatuses: data?.playerStatuses || {},
    status: data?.status ?? null,
    confirmedAt: data?.confirmedAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    confirmed: data?.confirmed === true,
  }))
}

/**
 * Transform V1 casts → compositions, slots, declines (AC 3–7).
 *
 * @param {Array<object>|Record<string, object>} casts
 * @param {object} manifest
 * @returns {{ compositions: Array<object>, slots: Array<object>, declines: Array<object>, rejects: Array<{ reason: string, detail: string }> }}
 */
export function transformCompositions(casts, manifest) {
  const { playersByV1, eventsByV1 } = buildManifestLookups(manifest)
  const compositions = []
  const slots = []
  const declines = []
  const rejects = []

  for (const cast of normalizeCastsInput(casts)) {
    const v1EventId = String(cast.v1EventId || '')
    const ctxBase = `cast event=${v1EventId}`

    const event = eventsByV1.get(v1EventId)
    if (!event) {
      rejects.push({
        reason: 'EVENT_UNRESOLVED',
        detail: `${ctxBase}: v1 event ${v1EventId} not in manifest`,
      })
      continue
    }

    const v2EventId = event.v2EventId
    const lifecycle = mapCompositionLifecycle(
      cast.status,
      cast.confirmedAt,
      cast.updatedAt,
      cast.confirmed,
    )
    const declinedAtFallback =
      lifecycle.validatedAt ||
      toIsoTimestamp(cast.confirmedAt) ||
      toIsoTimestamp(cast.updatedAt) ||
      '1970-01-01T00:00:00.000Z'
    compositions.push({
      eventId: v2EventId,
      validatedAt: lifecycle.validatedAt,
      publishedAt: lifecycle.publishedAt,
    })

    const roles = cast.roles && typeof cast.roles === 'object' ? cast.roles : {}
    const playerStatuses =
      cast.playerStatuses && typeof cast.playerStatuses === 'object' ? cast.playerStatuses : {}

    for (const [roleKey, playerIds] of Object.entries(roles)) {
      const ids = Array.isArray(playerIds) ? playerIds : []
      ids.forEach((v1PlayerId, slotIndex) => {
        const ctx = `${ctxBase} role=${roleKey} slot=${slotIndex}`
        const player = resolvePlayer(v1PlayerId, playersByV1, rejects, ctx)
        if (!player) return
        if (!player.v2SeasonParticipantId) {
          rejects.push({
            reason: 'PLAYER_NO_V2_PARTICIPANT',
            detail: `${ctx}: v1 player ${v1PlayerId} has no v2SeasonParticipantId in manifest`,
          })
          return
        }

        slots.push({
          id: deterministicSlotUuid(v2EventId, roleKey, slotIndex),
          eventId: v2EventId,
          roleKey,
          slotIndex,
          seasonParticipantId: player.v2SeasonParticipantId,
          participationStatus: mapParticipationStatus(playerStatuses[String(v1PlayerId)]),
        })
      })
    }

    const declinedRoles =
      cast.declined && typeof cast.declined === 'object' ? cast.declined : {}
    for (const [roleKey, playerIds] of Object.entries(declinedRoles)) {
      const ids = Array.isArray(playerIds) ? playerIds : []
      ids.forEach((v1PlayerId, slotIndex) => {
        const ctx = `${ctxBase} declined role=${roleKey} slot=${slotIndex}`
        const player = resolvePlayer(v1PlayerId, playersByV1, rejects, ctx)
        if (!player) return
        if (!player.v2SeasonParticipantId) {
          rejects.push({
            reason: 'PLAYER_NO_V2_PARTICIPANT',
            detail: `${ctx}: v1 player ${v1PlayerId} has no v2SeasonParticipantId in manifest`,
          })
          return
        }

        declines.push({
          id: deterministicDeclineUuid(v2EventId, roleKey, String(v1PlayerId)),
          eventId: v2EventId,
          roleKey,
          slotIndex,
          seasonParticipantId: player.v2SeasonParticipantId,
          declinedByUserId: player.v2UserId,
          declinedAt: declinedAtFallback,
        })
      })
    }
  }

  return { compositions, slots, declines, rejects }
}

/**
 * Build idempotent availability + composition load SQL (AC 8).
 *
 * @param {object} params
 * @param {Array<object>} params.availabilityRows
 * @param {Array<object>} params.compositions
 * @param {Array<object>} params.slots
 * @param {Array<object>} params.declines
 * @param {string} [params.seasonV2Id] when set, append availability_opened_at backfill for migrated season
 * @param {string} [params.generatedBy]
 */
export function buildAvailabilityCompositionsLoadSql({
  availabilityRows = [],
  compositions = [],
  slots = [],
  declines = [],
  seasonV2Id = null,
  generatedBy = 'scripts/migrate-malice-transform-ac.mjs',
}) {
  const lines = [
    `-- Generated by ${generatedBy} — do not edit by hand.`,
    '-- MIG-3 (ADR-0016): V1 La Malice availability + compositions → V2. Idempotent, replay-safe.',
    `-- ${availabilityRows.length} availability, ${compositions.length} composition(s), ${slots.length} slot(s), ${declines.length} decline(s).`,
    '',
  ]

  for (const row of availabilityRows) {
    const roleKeysJson = JSON.stringify(row.roleKeys || [])
    lines.push(
      'INSERT INTO event_availability (id, event_id, user_id, status, role_keys, comment, created_at, updated_at) VALUES (' +
        `${sqlString(row.id)}, ${sqlString(row.eventId)}, ${sqlString(row.userId)}, ` +
        `'${row.status}', ${sqlString(roleKeysJson)}, ${sqlString(row.comment)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      'ON CONFLICT (event_id, user_id) DO UPDATE SET ' +
        'status = EXCLUDED.status, role_keys = EXCLUDED.role_keys, comment = EXCLUDED.comment, ' +
        'updated_at = CURRENT_TIMESTAMP;',
    )
  }

  for (const comp of compositions) {
    lines.push(
      'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (' +
        `${sqlString(comp.eventId)}, ${comp.validatedAt ? sqlString(comp.validatedAt) : 'NULL'}, ` +
        `${comp.publishedAt ? sqlString(comp.publishedAt) : 'NULL'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      'ON CONFLICT (event_id) DO UPDATE SET ' +
        'validated_at = EXCLUDED.validated_at, published_at = EXCLUDED.published_at, ' +
        'updated_at = CURRENT_TIMESTAMP;',
    )
  }

  for (const slot of slots) {
    lines.push(
      'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (' +
        `${sqlString(slot.id)}, ${sqlString(slot.eventId)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ` +
        `${sqlString(slot.seasonParticipantId)}, NULL, '${slot.participationStatus}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      'ON CONFLICT (event_id, role_key, slot_index) DO UPDATE SET ' +
        'season_participant_id = EXCLUDED.season_participant_id, participation_status = EXCLUDED.participation_status, ' +
        'updated_at = CURRENT_TIMESTAMP;',
    )
  }

  for (const dec of declines) {
    lines.push(
      'INSERT INTO event_composition_declines (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, declined_by_user_id, declined_at, note, created_at) VALUES (' +
        `${sqlString(dec.id)}, ${sqlString(dec.eventId)}, ${sqlString(dec.roleKey)}, ${dec.slotIndex}, ` +
        `${sqlString(dec.seasonParticipantId)}, NULL, ${sqlString(dec.declinedByUserId)}, ${sqlString(dec.declinedAt)}, NULL, CURRENT_TIMESTAMP)`,
      'ON CONFLICT (id) DO UPDATE SET ' +
        'season_participant_id = EXCLUDED.season_participant_id, declined_by_user_id = EXCLUDED.declined_by_user_id, ' +
        'declined_at = EXCLUDED.declined_at;',
    )
  }

  if (seasonV2Id) {
    lines.push(buildMigratedEventsOpenAvailabilityBackfillSql(seasonV2Id, { generatedBy }))
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

/**
 * Full MIG-3 transform: availability + compositions + SQL + merged rejects.
 *
 * @param {object} params
 * @param {Array<object>} params.availabilityRecords
 * @param {Array<object>|Record<string, object>} params.casts
 * @param {object} params.manifest
 */
export function transformAvailabilityCompositions({ availabilityRecords, casts, manifest }) {
  const { rows, rejects: availabilityRejects } = transformAvailability(availabilityRecords, manifest)
  const {
    compositions,
    slots,
    declines,
    rejects: compositionRejects,
  } = transformCompositions(casts, manifest)

  const sql = buildAvailabilityCompositionsLoadSql({
    availabilityRows: rows,
    compositions,
    slots,
    declines,
    seasonV2Id: manifest?.seasonV2Id ?? null,
  })

  return {
    availabilityRows: rows,
    compositions,
    slots,
    declines,
    sql,
    rejects: [...availabilityRejects, ...compositionRejects],
    counts: {
      availability: rows.length,
      compositions: compositions.length,
      slots: slots.length,
      declines: declines.length,
      rejects: availabilityRejects.length + compositionRejects.length,
    },
  }
}
