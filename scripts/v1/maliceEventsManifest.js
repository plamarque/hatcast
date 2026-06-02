/**
 * Pure V1 → V2 transform + mapping manifest for MIG-2 (events + identity bridge).
 *
 * No Firebase / Postgres dependency — every function is deterministic and unit
 * testable from fixtures. The CLIs (scripts/migrate-malice-*.js) wire the I/O.
 *
 * Contracts:
 *  - ADR-0016 §Decision.3/4 — manifest.json is the only authoritative V1→V2
 *    identity bridge (players by normalized email, events by v1 id).
 *  - V5__events.sql / V7__event_types_and_role_slots.sql — events shape.
 *  - V24__events_slug.sql / ADR-0013 — slug convention (unique per season).
 */

import { createHash } from 'crypto'

import { normalizeEmail } from './troupeMembersCsv.js'

export { normalizeEmail }

/** Default local time appended to V1 date-only events (AC2). Europe/Paris. */
export const DEFAULT_EVENT_TIME = '19:00'

/** Deterministic UUID namespace for V1 event ids → V2 event UUIDs. */
const EVENT_UUID_NAMESPACE = 'hatcast:mig-2:malice:event'

/** Deterministic UUID namespace for troupe_categories glossaire (MIG-4). */
const TROUPE_CATEGORY_UUID_NAMESPACE = 'hatcast:mig-4:troupe-category'

const ACCENTS_FROM =
  'àáâãäåèéêëìíîïòóôõöùúûüýÿñçÀÁÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÝŸÑÇ'
const ACCENTS_TO = 'aaaaaaeeeeiiiiooooouuuuyyncAAAAAAEEEEIIIIOOOOOUUUUYYNC'

/**
 * SQL string literal escaping (mirrors scripts/v2/generate-improbots-seed-sql.js).
 * @param {unknown} value
 */
export function sqlString(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

/**
 * Deterministic UUID v5 (SHA-1, RFC 4122) from a stable name.
 * Replay-safe: same V1 event id always yields the same V2 event UUID.
 *
 * @param {string} name
 * @param {string} [namespace]
 * @returns {string}
 */
export function deterministicEventUuid(name, namespace = EVENT_UUID_NAMESPACE) {
  const hash = createHash('sha1').update(`${namespace}:${name}`).digest()
  const bytes = hash.subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50 // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant
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
 * Slug base from a title, mirroring V24__events_slug.sql normalization:
 * strip accents → lowercase → non-alphanum to '-' → collapse → trim '-' → 128.
 *
 * @param {string | null | undefined} title
 * @returns {string}
 */
export function slugBaseFromTitle(title) {
  const raw = (title || '').trim()
  let out = ''
  for (const ch of raw) {
    const i = ACCENTS_FROM.indexOf(ch)
    out += i >= 0 ? ACCENTS_TO[i] : ch
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 128)
}

/**
 * Slug fallback when the title yields an empty base (mirrors V24).
 * @param {string} v2EventId
 */
function fallbackSlug(v2EventId) {
  return `event-${v2EventId.replace(/-/g, '').slice(0, 12)}`
}

/**
 * Append a numeric suffix to a slug base keeping it within 128 chars (V24 rule).
 * @param {string} base
 * @param {number} rank
 */
function slugWithRank(base, rank) {
  if (rank <= 1) return base
  const suffix = `-${rank}`
  const head = base.slice(0, Math.max(1, 128 - suffix.length)).replace(/-+$/g, '')
  return `${head}${suffix}`
}

/** V1 date string is `YYYY-MM-DD`. */
const V1_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Transform raw V1 events into V2 event rows + unique slugs (AC2, AC3).
 *
 * Events with a missing/invalid `date` are rejected (cannot build starts_at).
 * Deterministic ordering (date asc, then v1 id) makes slug suffixes stable
 * across replays.
 *
 * @param {Array<object>} v1Events raw Firestore event docs ({ id, date, title, ... })
 * @param {object} params
 * @param {string} params.seasonV2Id target V2 season UUID
 * @param {string} [params.defaultTime='19:00'] local HH:mm appended to date-only events
 * @returns {{ events: Array<object>, rejects: Array<{ reason: string, detail: string }> }}
 */
export function transformEvents(v1Events, { seasonV2Id, defaultTime = DEFAULT_EVENT_TIME }) {
  if (!seasonV2Id) throw new Error('transformEvents: seasonV2Id is required')
  if (!/^\d{2}:\d{2}$/.test(defaultTime)) {
    throw new Error(`transformEvents: invalid defaultTime "${defaultTime}" (expected HH:mm)`)
  }

  const rejects = []
  const accepted = []

  for (const ev of v1Events || []) {
    const date = typeof ev.date === 'string' ? ev.date.trim() : ''
    if (!V1_DATE_RE.test(date)) {
      rejects.push({
        reason: 'EVENT_INVALID_DATE',
        detail: `event ${ev.id}: date=${JSON.stringify(ev.date)} (expected YYYY-MM-DD)`,
      })
      continue
    }
    accepted.push(ev)
  }

  accepted.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return String(a.id).localeCompare(String(b.id))
  })

  const seenSlugBase = new Map()
  const events = accepted.map((ev) => {
    const v2EventId = deterministicEventUuid(String(ev.id))
    const base = slugBaseFromTitle(ev.title) || fallbackSlug(v2EventId)
    const rank = (seenSlugBase.get(base) ?? 0) + 1
    seenSlugBase.set(base, rank)
    const slug = slugWithRank(base, rank)

    const roles = ev.roles && typeof ev.roles === 'object' ? ev.roles : {}
    const templateType =
      typeof ev.templateType === 'string' && ev.templateType ? ev.templateType : 'custom'
    const category = templateType === 'deplacement' ? 'deplacements' : null

    return {
      v1EventId: String(ev.id),
      v2EventId,
      seasonV2Id,
      title: typeof ev.title === 'string' ? ev.title : '',
      date: ev.date,
      startsAt: `${ev.date} ${defaultTime}:00`,
      location: typeof ev.location === 'string' ? ev.location : null,
      description: typeof ev.description === 'string' ? ev.description : null,
      templateType,
      category,
      roleSlots: roles,
      archived: ev.archived === true,
      slug,
    }
  })

  return { events, rejects }
}

/**
 * Build the idempotent events load SQL (AC2, AC3, AC7).
 * `INSERT … ON CONFLICT (id) DO UPDATE` — safe to replay.
 *
 * @param {Array<object>} events output of transformEvents().events
 * @param {object} [params]
 * @param {string} [params.generatedBy]
 * @returns {string}
 */
export function buildEventsLoadSql(events, { generatedBy = 'scripts/migrate-malice-transform.mjs' } = {}) {
  const lines = [
    `-- Generated by ${generatedBy} — do not edit by hand.`,
    '-- MIG-2 (ADR-0016) + MIG-4: V1 La Malice events → V2 events (category deplacements + glossaire). Idempotent, replay-safe.',
    `-- ${events.length} event(s).`,
    '',
  ]

  for (const ev of events) {
    const roleSlotsJson = JSON.stringify(ev.roleSlots)
    lines.push(
      `-- V1 ${ev.v1EventId} → ${ev.slug}`,
      'INSERT INTO events (id, season_id, title, description, location, starts_at, template_type, role_slots, slug, category, archived, created_at, updated_at) VALUES (' +
        `${sqlString(ev.v2EventId)}, ${sqlString(ev.seasonV2Id)}, ${sqlString(ev.title)}, ${sqlString(ev.description)}, ` +
        `${sqlString(ev.location)}, ${sqlString(ev.startsAt)}, ${sqlString(ev.templateType)}, ${sqlString(roleSlotsJson)}, ` +
        `${sqlString(ev.slug)}, ${sqlString(ev.category)}, ${ev.archived ? 'TRUE' : 'FALSE'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      'ON CONFLICT (id) DO UPDATE SET ' +
        'season_id = EXCLUDED.season_id, title = EXCLUDED.title, description = EXCLUDED.description, ' +
        'location = EXCLUDED.location, starts_at = EXCLUDED.starts_at, template_type = EXCLUDED.template_type, ' +
        'role_slots = EXCLUDED.role_slots, slug = EXCLUDED.slug, category = EXCLUDED.category, ' +
        'archived = EXCLUDED.archived, updated_at = CURRENT_TIMESTAMP;',
    )
  }

  if (events.length > 0) {
    const seasonV2Id = events[0].seasonV2Id
    lines.push(...buildSeasonEventCountReconcileSqlLines(seasonV2Id))
    if (events.some((ev) => ev.category === 'deplacements')) {
      lines.push(...buildTroupeDeplacementsCategorySqlLines(seasonV2Id))
    }
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

/**
 * Story 3.21 / MIG-3: V1 spectacles had no draft gate — open availability on all migrated rows.
 * Run after event_availability load (load-ac.sql). Idempotent, replay-safe.
 *
 * @param {string} seasonV2Id
 * @param {object} [options]
 * @param {string} [options.generatedBy]
 * @returns {string}
 */
export function buildMigratedEventsOpenAvailabilityBackfillSql(
  seasonV2Id,
  { generatedBy = 'scripts/v1/maliceAvailabilityCompositions.js' } = {},
) {
  if (!seasonV2Id) return ''
  return [
    `-- Generated by ${generatedBy} — do not edit by hand.`,
    '-- V1 → V2: publish migrated spectacles (availability_opened_at; Story 3.21).',
    `UPDATE events`,
    `SET availability_opened_at = created_at,`,
    `    updated_at = CURRENT_TIMESTAMP`,
    `WHERE season_id = ${sqlString(seasonV2Id)}`,
    `  AND availability_opened_at IS NULL;`,
    '',
  ].join('\n')
}

/**
 * Idempotent glossaire `deplacements` for the troupe owning the target season (MIG-4 AC4).
 * Replay-safe deterministic UUID from seasonV2Id.
 *
 * @param {string} seasonV2Id target V2 season UUID
 * @returns {string[]}
 */
export function buildTroupeDeplacementsCategorySqlLines(seasonV2Id) {
  const categoryId = deterministicEventUuid(seasonV2Id, TROUPE_CATEGORY_UUID_NAMESPACE)
  return [
    '-- MIG-4: glossaire troupe « Déplacements » (ADR-0013)',
    'INSERT INTO troupe_categories (id, troupe_id, slug, label)',
    `SELECT ${sqlString(categoryId)}, s.troupe_id, 'deplacements', 'Déplacements'`,
    'FROM seasons s',
    `WHERE s.id = ${sqlString(seasonV2Id)}`,
    "  AND EXISTS (SELECT 1 FROM events e WHERE e.season_id = s.id AND e.category = 'deplacements')",
    '  AND NOT EXISTS (',
    '    SELECT 1 FROM troupe_categories tc',
    "    WHERE tc.troupe_id = s.troupe_id AND tc.slug = 'deplacements'",
    '  );',
  ]
}

/**
 * SQL lines reconciling seasons.event_count after bulk event load (BUG-004 / story 17-30).
 *
 * @param {string} seasonId V2 season UUID
 * @returns {string[]}
 */
export function buildSeasonEventCountReconcileSqlLines(seasonId) {
  return [
    '-- Reconcile denormalized seasons.event_count (non-archived events only)',
    'UPDATE seasons',
    'SET',
    '    event_count = (SELECT COUNT(*)::int FROM events e WHERE e.season_id = seasons.id AND e.archived = FALSE),',
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(seasonId)};`,
  ]
}

/**
 * Resolve V1 players against V2 users/season_participants by normalized email (AC4, AC6).
 *
 * @param {Array<object>} v1Players raw V1 player docs ({ id, email, ... })
 * @param {Array<{ seasonParticipantId: string, userId: string|null, normalizedEmail: string }>} participants
 *        V2 season_participants joined with users for the target season.
 * @returns {{ players: Array<{ v1PlayerId: string, email: string, v2UserId: string|null, v2SeasonParticipantId: string }>, rejects: Array<{ reason: string, detail: string }> }}
 */
export function buildPlayersManifest(v1Players, participants) {
  const sorted = [...(participants || [])].sort((a, b) =>
    String(a.seasonParticipantId).localeCompare(String(b.seasonParticipantId)),
  )
  const byEmail = new Map()
  const rejects = []

  for (const p of sorted) {
    const email = normalizeEmail(p.normalizedEmail)
    if (!email) continue
    const existing = byEmail.get(email)
    if (existing) {
      rejects.push({
        reason: 'V2_DUPLICATE_PARTICIPANT_EMAIL',
        detail:
          `season_participant ${p.seasonParticipantId} <${email}>: duplicate of ` +
          `${existing.seasonParticipantId} (keeping first by id)`,
      })
      continue
    }
    byEmail.set(email, p)
  }

  const players = []

  for (const player of v1Players || []) {
    const email = normalizeEmail(player.email)
    if (!email) {
      rejects.push({
        reason: 'PLAYER_NO_EMAIL',
        detail: `v1 player ${player.id}: no email (cannot resolve to V2)`,
      })
      continue
    }
    const match = byEmail.get(email)
    if (!match) {
      rejects.push({
        reason: 'PLAYER_UNRESOLVED',
        detail: `v1 player ${player.id} <${email}>: no matching season_participant in target season`,
      })
      continue
    }
    players.push({
      v1PlayerId: String(player.id),
      email,
      v2UserId: match.userId ?? null,
      v2SeasonParticipantId: match.seasonParticipantId,
    })
  }

  return { players, rejects }
}

/**
 * Build the events section of the manifest (AC5).
 * @param {Array<object>} v2Events output of transformEvents().events
 * @returns {Array<{ v1EventId: string, v2EventId: string, slug: string, date: string }>}
 */
export function buildEventsManifest(v2Events) {
  return (v2Events || []).map((ev) => ({
    v1EventId: ev.v1EventId,
    v2EventId: ev.v2EventId,
    slug: ev.slug,
    date: ev.date,
  }))
}

/**
 * Assemble the full manifest + rejects (AC4, AC5, AC6).
 *
 * @param {object} params
 * @param {string} params.v1SeasonId
 * @param {string} params.seasonV2Id
 * @param {Array<object>} params.v1Players
 * @param {Array<object>} params.participants
 * @param {Array<object>} params.v2Events transformEvents().events
 * @param {Array<object>} [params.eventRejects] transformEvents().rejects
 * @returns {{ manifest: object, rejects: Array<{ reason: string, detail: string }> }}
 */
export function buildManifest({
  v1SeasonId,
  seasonV2Id,
  v1Players,
  participants,
  v2Events,
  eventRejects = [],
}) {
  const { players, rejects: playerRejects } = buildPlayersManifest(v1Players, participants)
  const events = buildEventsManifest(v2Events)

  const deplacements = (v2Events || []).filter((ev) => ev.category === 'deplacements').length

  const manifest = {
    schema: 'hatcast/mig-2/manifest@1',
    generatedAt: new Date().toISOString(),
    v1SeasonId,
    seasonV2Id,
    counts: { players: players.length, events: events.length, deplacements },
    players,
    events,
  }

  return { manifest, rejects: [...eventRejects, ...playerRejects] }
}
