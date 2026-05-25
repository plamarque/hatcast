/**
 * Generates Flyway V17 seed SQL for La Malice dev season:
 * - ~32 troupe members from members.csv (obfuscated emails)
 * - Event template_type + role_slots for all 30 seed events
 * - Partial realistic event_availability matrix
 *
 * Usage:
 *   node scripts/v2/generate-malice-seed-sql.js
 *   node scripts/v2/generate-malice-seed-sql.js --input=members.csv --output=services/api/src/main/resources/db/migration/V17__seed_malice_members_events_availability.sql
 *
 * Regenerate after editing members.csv (gitignored at repo root — PII).
 * Only the generated SQL (obfuscated emails) is committed.
 */

import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')

export const SEED_TROUPE_ID = 'a0000001-0000-4000-8000-000000000001'
export const SEED_SEASON_ID = 'b0000001-0000-4000-8000-000000000001'
export const SEED_EMAIL_DOMAIN = 'seed.la-malice.test'

const ROLE_KEYS = [
  'player',
  'volunteer',
  'mc',
  'dj',
  'referee',
  'assistant_referee',
  'lighting',
  'coach',
  'stage_manager',
]

const ROLE_PRESETS = {
  match: { player: 5, mc: 1, referee: 1, assistant_referee: 2, volunteer: 5 },
  catch: { player: 9, mc: 1, dj: 1 },
  cabaret: { player: 5, mc: 1, dj: 1 },
  longform: { player: 4, mc: 1, dj: 1 },
  freeform: { player: 5, mc: 1, dj: 1 },
  deplacement: { player: 5 },
  survey: {},
  custom: {},
}

/**
 * Past events for Historique (story 3.6b) — maintained in Flyway V26, not regenerated here.
 * @see services/api/src/main/resources/db/migration/V26__seed_malice_past_events_historique.sql
 */
export const SEED_PAST_EVENTS = [
  { id: 'c0000031-0000-4000-8000-000000000031', templateType: 'catch', slug: 'hist-aperock-avril' },
  { id: 'c0000032-0000-4000-8000-000000000032', templateType: 'match', slug: 'hist-match-vs-roubaix' },
  { id: 'c0000033-0000-4000-8000-000000000033', templateType: 'cabaret', slug: 'hist-cabaret-de-mars' },
  { id: 'c0000034-0000-4000-8000-000000000034', templateType: 'deplacement', slug: 'hist-deplacement-valenciennes' },
  { id: 'c0000035-0000-4000-8000-000000000035', templateType: 'longform', slug: 'hist-long-form-polar' },
  { id: 'c0000036-0000-4000-8000-000000000036', templateType: 'cabaret', slug: 'hist-cabaret-saint-valentin' },
  { id: 'c0000037-0000-4000-8000-000000000037', templateType: 'freeform', slug: 'hist-jam-de-janvier' },
  { id: 'c0000038-0000-4000-8000-000000000038', templateType: 'match', slug: 'hist-match-amicale-arras' },
  { id: 'c0000039-0000-4000-8000-000000000039', templateType: 'cabaret', slug: 'hist-veille-generale-mai' },
  { id: 'c000003a-0000-4000-8000-00000000003a', templateType: 'cabaret', slug: 'hist-repetition-archivee', archived: true },
]

/** Sync with V6 event IDs c0000001 … c0000030 */
export const SEED_EVENTS = [
  { id: 'c0000001-0000-4000-8000-000000000001', templateType: 'cabaret' },
  { id: 'c0000002-0000-4000-8000-000000000002', templateType: 'match' },
  { id: 'c0000003-0000-4000-8000-000000000003', templateType: 'deplacement' },
  { id: 'c0000004-0000-4000-8000-000000000004', templateType: 'longform' },
  { id: 'c0000005-0000-4000-8000-000000000005', templateType: 'cabaret' },
  { id: 'c0000006-0000-4000-8000-000000000006', templateType: 'match' },
  { id: 'c0000007-0000-4000-8000-000000000007', templateType: 'cabaret' },
  { id: 'c0000008-0000-4000-8000-000000000008', templateType: 'deplacement' },
  { id: 'c0000009-0000-4000-8000-000000000009', templateType: 'cabaret' },
  { id: 'c0000010-0000-4000-8000-000000000010', templateType: 'freeform' },
  { id: 'c0000011-0000-4000-8000-000000000011', templateType: 'match' },
  { id: 'c0000012-0000-4000-8000-000000000012', templateType: 'cabaret' },
  { id: 'c0000013-0000-4000-8000-000000000013', templateType: 'deplacement' },
  {
    id: 'c0000014-0000-4000-8000-000000000014',
    templateType: 'custom',
    customSlots: { player: 2, mc: 1, dj: 1 },
  },
  { id: 'c0000015-0000-4000-8000-000000000015', templateType: 'cabaret' },
  { id: 'c0000016-0000-4000-8000-000000000016', templateType: 'match' },
  { id: 'c0000017-0000-4000-8000-000000000017', templateType: 'deplacement' },
  { id: 'c0000018-0000-4000-8000-000000000018', templateType: 'cabaret' },
  { id: 'c0000019-0000-4000-8000-000000000019', templateType: 'longform' },
  { id: 'c0000020-0000-4000-8000-000000000020', templateType: 'catch' },
  {
    id: 'c0000021-0000-4000-8000-000000000021',
    templateType: 'custom',
    customSlots: { player: 6, mc: 1 },
  },
  { id: 'c0000022-0000-4000-8000-000000000022', templateType: 'match' },
  {
    id: 'c0000023-0000-4000-8000-000000000023',
    templateType: 'custom',
    customSlots: { player: 4, stage_manager: 1, mc: 1 },
  },
  { id: 'c0000024-0000-4000-8000-000000000024', templateType: 'match' },
  { id: 'c0000025-0000-4000-8000-000000000025', templateType: 'deplacement' },
  { id: 'c0000026-0000-4000-8000-000000000026', templateType: 'cabaret' },
  { id: 'c0000027-0000-4000-8000-000000000027', templateType: 'cabaret' },
  { id: 'c0000028-0000-4000-8000-000000000028', templateType: 'cabaret' },
  { id: 'c0000029-0000-4000-8000-000000000029', templateType: 'deplacement' },
  { id: 'c0000030-0000-4000-8000-000000000030', templateType: 'cabaret' },
]

/**
 * Story 6.3 — composition drafts for Équipe tab QA (V19, after V18 schema).
 * participantSeq indexes into deterministic season_participants f0000001-…-0000000000NN.
 */
/** Minimal cabaret template for MVP pilot recette (5 slots). */
export const MVP_PILOT_ROLE_SLOTS = { player: 3, mc: 1, dj: 1 }

/**
 * Six linked members — enough for draw/manual/gap-fill without scrolling 32 names.
 * participantSeq indexes season_participants f0000001-…-0000000000NN.
 */
export const MVP_PILOT_CAST = [
  { seq: 1, displayName: 'Angie', userSeq: 1 },
  { seq: 5, displayName: 'Bruno', userSeq: 5 },
  { seq: 6, displayName: 'Camille', userSeq: 6 },
  { seq: 18, displayName: 'Max', userSeq: 18 },
  { seq: 28, displayName: 'Sophie', userSeq: 28 },
  { seq: 22, displayName: 'Patrice', userSeq: 22 },
]

const MVP_PILOT_USER_ID = 'd0000001-0000-4000-8000-000000000022'

/**
 * Repurposed seed events (V6 ids) — titles prefixed [MVP] for agenda search.
 * Dates: June 2026 (upcoming from local dev in May 2026).
 */
export const MVP_PILOT_EVENTS = [
  {
    id: 'c0000009-0000-4000-8000-000000000009',
    title: '[MVP] 00 · Bandeau navigation',
    startsAt: '2026-06-03T19:30:00Z',
    scenario: 'navigation-only',
  },
  {
    id: 'c0000014-0000-4000-8000-000000000014',
    title: '[MVP] 01 · Tirage pondéré',
    startsAt: '2026-06-05T20:00:00Z',
    scenario: 'draw',
  },
  {
    id: 'c0000010-0000-4000-8000-000000000010',
    title: '[MVP] 02 · Assignation manuelle',
    startsAt: '2026-06-07T19:30:00Z',
    scenario: 'manual',
  },
  {
    id: 'c0000012-0000-4000-8000-000000000012',
    title: '[MVP] 03 · Validations en attente',
    startsAt: '2026-06-09T20:30:00Z',
    scenario: 'awaiting-confirmations',
  },
  {
    id: 'c0000018-0000-4000-8000-000000000018',
    title: '[MVP] 04 · Déclin et compléter',
    startsAt: '2026-06-11T19:30:00Z',
    scenario: 'gaps-to-fill',
  },
  {
    id: 'c0000020-0000-4000-8000-000000000020',
    title: '[MVP] 05 · Équipe complète',
    startsAt: '2026-06-13T19:00:00Z',
    scenario: 'complete',
  },
]

export const SEED_COMPOSITION_DRAFTS = [
  {
    eventId: 'c0000001-0000-4000-8000-000000000001',
    label: 'Cabaret de rentrée — brouillon non publié (test Publier)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 1, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 2, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 3, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 6, participationStatus: 'PENDING' },
      { roleKey: 'dj', slotIndex: 0, participantSeq: 5, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000002-0000-4000-8000-000000000002',
    label: 'Match vs Bruxelles — brouillon non publié (line-up partielle)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 18, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 22, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 25, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 3, participantSeq: 4, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 4, participantSeq: 7, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 9, participationStatus: 'PENDING' },
      { roleKey: 'referee', slotIndex: 0, participantSeq: 12, participationStatus: 'PENDING' },
      { roleKey: 'assistant_referee', slotIndex: 0, participantSeq: 16, participationStatus: 'PENDING' },
      { roleKey: 'assistant_referee', slotIndex: 1, participantSeq: 28, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000005-0000-4000-8000-000000000005',
    label: 'Cabaret Halloween — brouillon déjà publié (visible membres)',
    publishedAt: '2026-10-15T12:00:00Z',
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 14, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 17, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 2, participantSeq: 27, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 21, participationStatus: 'PENDING' },
      { roleKey: 'dj', slotIndex: 0, participantSeq: 19, participationStatus: 'PENDING' },
    ],
  },
  {
    eventId: 'c0000011-0000-4000-8000-000000000011',
    label: 'Match vs Rouen — brouillon non publié (second scénario Publier)',
    publishedAt: null,
    validatedAt: null,
    slots: [
      { roleKey: 'player', slotIndex: 0, participantSeq: 10, participationStatus: 'PENDING' },
      { roleKey: 'player', slotIndex: 1, participantSeq: 11, participationStatus: 'PENDING' },
      { roleKey: 'mc', slotIndex: 0, participantSeq: 30, participationStatus: 'PENDING' },
      { roleKey: 'referee', slotIndex: 0, participantSeq: 26, participationStatus: 'PENDING' },
    ],
  },
]

export function participantIdFromSeq(seq) {
  return deterministicUuid('f0000001', seq)
}

export function compositionSlotIdFromSeq(seq) {
  return deterministicUuid('90000001', seq)
}

function mvpPilotSlotId(index) {
  return deterministicUuid('90000002', index)
}

/**
 * Flyway V22 — MVP pilot recette: 6 spectacles, dispos complètes, états de composition ciblés.
 */
export function buildMalicieMvpPilotSeedSql() {
  const eventIds = MVP_PILOT_EVENTS.map((e) => e.id)
  const roleKeysJson = JSON.stringify(MVP_PILOT_ROLE_SLOTS)
  const availRoleKeys = JSON.stringify(['player', 'mc', 'dj'])
  const lines = [
    '-- Generated by scripts/v2/generate-malice-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:malice-mvp-pilot-seed',
    '-- MVP pilot: one admin (Patrice) validates composition flows with proxy dispos/confirmations.',
    '',
    `-- ${MVP_PILOT_EVENTS.length} events, cast of ${MVP_PILOT_CAST.length}, 5 slots per spectacle`,
    '',
    '-- Patrice = season organizer (canManageComposition on all season events)',
    `INSERT INTO season_organizers (season_id, user_id, granted_by_user_id, granted_at)`,
    `SELECT ${sqlString(SEED_SEASON_ID)}, ${sqlString(MVP_PILOT_USER_ID)}, ${sqlString(MVP_PILOT_USER_ID)}, CURRENT_TIMESTAMP`,
    `WHERE NOT EXISTS (`,
    `  SELECT 1 FROM season_organizers WHERE season_id = ${sqlString(SEED_SEASON_ID)} AND user_id = ${sqlString(MVP_PILOT_USER_ID)}`,
    `);`,
    '',
    '-- Spectacles MVP (titles, dates, minimal role_slots)',
  ]

  for (const ev of MVP_PILOT_EVENTS) {
    lines.push(`-- ${ev.scenario}`)
    lines.push(
      `UPDATE events SET title = ${sqlString(ev.title)}, starts_at = ${sqlString(ev.startsAt)}, template_type = 'cabaret', role_slots = ${sqlString(roleKeysJson)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${sqlString(ev.id)};`,
    )
  }

  lines.push('', '-- Reset availability + composition on MVP events only')
  lines.push(
    `DELETE FROM event_composition_declines WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_composition_slots WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_compositions WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )
  lines.push(
    `DELETE FROM event_availability WHERE event_id IN (${eventIds.map(sqlString).join(', ')});`,
  )

  lines.push('', '-- Full availability for MVP cast (Dispo + candidature player/mc/dj)')
  for (const ev of MVP_PILOT_EVENTS) {
    for (const member of MVP_PILOT_CAST) {
      const userId = deterministicUuid('d0000001', member.userSeq)
      lines.push(
        `INSERT INTO event_availability (event_id, user_id, status, role_keys, created_at, updated_at) VALUES (${sqlString(ev.id)}, ${sqlString(userId)}, 'AVAILABLE', ${sqlString(availRoleKeys)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      )
    }
  }

  const validatedAt = '2026-06-01T12:00:00Z'
  const publishedAt = '2026-06-01T12:00:00Z'
  let slotIndex = 1

  const awaitingEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'awaiting-confirmations')
  const gapsEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'gaps-to-fill')
  const completeEvent = MVP_PILOT_EVENTS.find((e) => e.scenario === 'complete')

  lines.push('', '-- [MVP] 03 — validated, all slots filled, participation PENDING')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(awaitingEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const awaitingSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'PENDING' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'PENDING' },
  ]
  for (const slot of awaitingSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(awaitingEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }

  lines.push('', '-- [MVP] 04 — validated, gap on player slot 2 (Sophie declined)')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(gapsEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const gapsSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'PENDING' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of gapsSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(gapsEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }
  lines.push(
    `INSERT INTO event_composition_declines (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, declined_by_user_id, declined_at, note, created_at) VALUES (${sqlString(deterministicUuid('a0000002', 1))}, ${sqlString(gapsEvent.id)}, 'player', 2, ${sqlString(participantIdFromSeq(28))}, NULL, ${sqlString(deterministicUuid('d0000001', 28))}, ${sqlString(validatedAt)}, NULL, CURRENT_TIMESTAMP);`,
  )

  lines.push('', '-- [MVP] 05 — validated, all CONFIRMED (reference complete state)')
  lines.push(
    `INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (${sqlString(completeEvent.id)}, ${sqlString(validatedAt)}, ${sqlString(publishedAt)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
  )
  const completeSlots = [
    { roleKey: 'player', slotIndex: 0, participantSeq: 1, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 1, participantSeq: 18, status: 'CONFIRMED' },
    { roleKey: 'player', slotIndex: 2, participantSeq: 28, status: 'CONFIRMED' },
    { roleKey: 'mc', slotIndex: 0, participantSeq: 6, status: 'CONFIRMED' },
    { roleKey: 'dj', slotIndex: 0, participantSeq: 5, status: 'CONFIRMED' },
  ]
  for (const slot of completeSlots) {
    lines.push(
      `INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, season_participant_id, event_participant_id, participation_status, waived, created_at, updated_at) VALUES (${sqlString(mvpPilotSlotId(slotIndex))}, ${sqlString(completeEvent.id)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantIdFromSeq(slot.participantSeq))}, NULL, '${slot.status}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
    slotIndex += 1
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

export function buildMalicieCompositionSeedSql() {
  let slotSeq = 1
  const slotCount = SEED_COMPOSITION_DRAFTS.reduce((n, d) => n + d.slots.length, 0)
  const lines = [
    '-- Generated by scripts/v2/generate-malice-seed-sql.js — do not edit by hand.',
    '-- Regenerate: npm run generate:malice-composition-seed',
    '-- Story 6.3: draft compositions for Équipe tab QA (requires V18 event_compositions tables).',
    '',
    `-- ${SEED_COMPOSITION_DRAFTS.length} compositions, ${slotCount} assigned slots`,
    '',
    '-- event_compositions',
  ]

  for (const draft of SEED_COMPOSITION_DRAFTS) {
    lines.push(`-- ${draft.label}`)
    lines.push(
      'INSERT INTO event_compositions (event_id, validated_at, published_at, created_at, updated_at) VALUES (' +
        `${sqlString(draft.eventId)}, ${draft.validatedAt ? sqlString(draft.validatedAt) : 'NULL'}, ${draft.publishedAt ? sqlString(draft.publishedAt) : 'NULL'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- event_composition_slots')
  for (const draft of SEED_COMPOSITION_DRAFTS) {
    for (const slot of draft.slots) {
      const slotId = compositionSlotIdFromSeq(slotSeq)
      const participantId = participantIdFromSeq(slot.participantSeq)
      slotSeq += 1
      lines.push(
        'INSERT INTO event_composition_slots (id, event_id, role_key, slot_index, participant_id, participation_status, waived, created_at, updated_at) VALUES (' +
          `${sqlString(slotId)}, ${sqlString(draft.eventId)}, ${sqlString(slot.roleKey)}, ${slot.slotIndex}, ${sqlString(participantId)}, '${slot.participationStatus}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
      )
    }
  }

  lines.push('')
  return `${lines.join('\n')}\n`
}

export function sqlString(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

export function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '')
}

export function slugFromDisplayName(displayName) {
  const trimmed = (displayName || '').trim()
  const lower = stripAccents(trimmed).toLowerCase()
  if (lower.includes('auryl')) return 'auryl'
  const slug = lower
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'member'
}

export function assignObfuscatedEmails(members) {
  const used = new Set()
  return members.map((member) => {
    let base = slugFromDisplayName(member.displayName)
    let candidate = base
    let suffix = 2
    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`
      suffix += 1
    }
    used.add(candidate)
    return {
      ...member,
      obfuscatedEmail: `${candidate}@${SEED_EMAIL_DOMAIN}`,
    }
  })
}

export function parseMembersCsv(csvText) {
  const lines = csvText.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((h) => h.trim())
  const emailIdx = header.indexOf('email')
  const nameIdx = header.indexOf('displayName')
  const roleIdx = header.indexOf('baselineRole')
  if (emailIdx < 0 || nameIdx < 0) {
    throw new Error('members.csv must contain email and displayName columns')
  }
  const rows = []
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim()
    if (!line) continue
    const cols = line.split(',')
    const displayName = cols[nameIdx]?.trim()
    if (!displayName) continue
    const baselineRole = (cols[roleIdx]?.trim() || 'MEMBER').toUpperCase()
    rows.push({
      displayName,
      baselineRole: baselineRole === 'TROUPE_ADMIN' ? 'TROUPE_ADMIN' : 'MEMBER',
    })
  }
  return rows
}

export function emptySlots() {
  return Object.fromEntries(ROLE_KEYS.map((k) => [k, 0]))
}

export function slotsFor(templateType, customSlots = null) {
  const base = emptySlots()
  const partial = customSlots ?? ROLE_PRESETS[templateType] ?? {}
  for (const [key, count] of Object.entries(partial)) {
    if (ROLE_KEYS.includes(key)) base[key] = count
  }
  return base
}

export function rolesWithSlots(slots) {
  return ROLE_KEYS.filter((k) => (slots[k] ?? 0) > 0)
}

export function deterministicUuid(prefix, index) {
  const nn = String(index).padStart(2, '0')
  return `${prefix}-0000-4000-8000-0000000000${nn}`
}

export function shouldHaveAvailability(userIndex, eventIndex) {
  const h = (userIndex * 17 + eventIndex * 13) % 100
  return h < 65
}

export function isUnavailable(userIndex, eventIndex) {
  const h = (userIndex * 31 + eventIndex * 7) % 100
  return h < 25
}

const MATCH_ROLE_VARIANTS = [
  ['player', 'volunteer'],
  ['referee'],
  ['assistant_referee'],
  ['mc'],
  [],
  ['volunteer'],
]

const STAGE_ROLE_VARIANTS = [
  ['player'],
  ['player', 'mc'],
  ['dj'],
  ['player', 'dj'],
  ['mc'],
  [],
]

export function pickRoleKeys(userIndex, eventIndex, templateType, slots) {
  const positive = rolesWithSlots(slots)
  if (positive.length === 0) return []

  const pick = (variants) => variants[(userIndex + eventIndex) % variants.length]

  if (templateType === 'match') {
    return pick(MATCH_ROLE_VARIANTS)
  }
  if (templateType === 'deplacement') {
    return pick([['player'], []])
  }
  if (templateType === 'custom') {
    if (positive.length === 1) return [positive[0]]
    const idx = (userIndex * 3 + eventIndex) % positive.length
    const count = 1 + ((userIndex + eventIndex) % Math.min(2, positive.length))
    const keys = []
    for (let i = 0; i < count; i += 1) {
      keys.push(positive[(idx + i) % positive.length])
    }
    return [...new Set(keys)]
  }
  return pick(STAGE_ROLE_VARIANTS)
}

export function buildAvailabilityRows(members, events) {
  const rows = []
  for (let ui = 0; ui < members.length; ui += 1) {
    for (let ei = 0; ei < events.length; ei += 1) {
      if (!shouldHaveAvailability(ui, ei)) continue
      const event = events[ei]
      const slots = slotsFor(event.templateType, event.customSlots ?? null)
      if (isUnavailable(ui, ei)) {
        rows.push({
          eventId: event.id,
          userId: members[ui].userId,
          status: 'UNAVAILABLE',
          roleKeys: [],
        })
      } else {
        rows.push({
          eventId: event.id,
          userId: members[ui].userId,
          status: 'AVAILABLE',
          roleKeys: pickRoleKeys(ui, ei, event.templateType, slots),
        })
      }
    }
  }
  return rows
}

export function buildMembersWithIds(obfuscatedMembers) {
  return obfuscatedMembers.map((member, index) => {
    const seq = index + 1
    return {
      ...member,
      userId: deterministicUuid('d0000001', seq),
      membershipId: deterministicUuid('e0000001', seq),
      participantId: deterministicUuid('f0000001', seq),
      googleSub: `seed-malicie-${String(seq).padStart(2, '0')}`,
    }
  })
}

export function buildMalicieSeedSql(membersCsvText) {
  const parsed = parseMembersCsv(membersCsvText)
  const obfuscated = assignObfuscatedEmails(parsed)
  const members = buildMembersWithIds(obfuscated)
  const events = SEED_EVENTS.map((e) => ({
    ...e,
    roleSlots: slotsFor(e.templateType, e.customSlots ?? null),
  }))
  const availability = buildAvailabilityRows(members, events)

  const lines = [
    '-- Generated by scripts/v2/generate-malice-seed-sql.js — do not edit by hand.',
    '-- Regenerate: node scripts/v2/generate-malice-seed-sql.js',
    '-- Emails are obfuscated (@seed.la-malice.test); members.csv at repo root is gitignored.',
    '',
    `-- ${members.length} users, ${events.length} event type updates, ${availability.length} availability rows`,
    '',
  ]

  lines.push('-- Users')
  for (const m of members) {
    lines.push(
      `INSERT INTO users (id, google_sub, idp_uid, email, display_name, activated_at, created_at, updated_at) VALUES (` +
        `${sqlString(m.userId)}, ${sqlString(m.googleSub)}, NULL, ${sqlString(m.obfuscatedEmail)}, ${sqlString(m.displayName)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Troupe memberships (La Malice)')
  for (const m of members) {
    lines.push(
      `INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, preferred_role_keys, created_at, updated_at) VALUES (` +
        `${sqlString(m.membershipId)}, ${sqlString(SEED_TROUPE_ID)}, ${sqlString(m.userId)}, 'ACTIVE', '${m.baselineRole}', ${sqlString(m.displayName)}, '[]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Season participants')
  for (const m of members) {
    lines.push(
      `INSERT INTO season_participants (id, season_id, display_name, normalized_email, user_id, troupe_membership_id, status, created_at, updated_at) VALUES (` +
        `${sqlString(m.participantId)}, ${sqlString(SEED_SEASON_ID)}, ${sqlString(m.displayName)}, ${sqlString(m.obfuscatedEmail)}, ${sqlString(m.userId)}, ${sqlString(m.membershipId)}, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push('', '-- Event types and role slots')
  for (const event of events) {
    const slotsJson = JSON.stringify(event.roleSlots)
    lines.push(
      `UPDATE events SET template_type = ${sqlString(event.templateType)}, role_slots = ${sqlString(slotsJson)}, updated_at = CURRENT_TIMESTAMP WHERE id = ${sqlString(event.id)};`,
    )
  }

  lines.push('', '-- Event availability (partial matrix)')
  for (const row of availability) {
    const roleKeysJson = JSON.stringify(row.roleKeys)
    lines.push(
      `INSERT INTO event_availability (event_id, user_id, status, role_keys, created_at, updated_at) VALUES (` +
        `${sqlString(row.eventId)}, ${sqlString(row.userId)}, '${row.status}', ${sqlString(roleKeysJson)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
    )
  }

  lines.push(
    '',
    'UPDATE seasons',
    'SET',
    "    participant_count = (SELECT COUNT(*) FROM season_participants sp WHERE sp.season_id = seasons.id AND sp.status = 'ACTIVE'),",
    '    updated_at = CURRENT_TIMESTAMP',
    `WHERE id = ${sqlString(SEED_SEASON_ID)};`,
    '',
  )

  return `${lines.join('\n')}\n`
}

function parseArgs() {
  const args = process.argv.slice(2)
  let input = join(REPO_ROOT, 'members.csv')
  let output = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/migration/V17__seed_malice_members_events_availability.sql',
  )
  let compositionOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/migration/V19__seed_malice_composition_drafts.sql',
  )
  let compositionOnly = false
  let mvpPilotOnly = false
  let mvpPilotOutput = join(
    REPO_ROOT,
    'services/api/src/main/resources/db/migration/V22__seed_mvp_pilot_recette.sql',
  )
  for (const arg of args) {
    if (arg.startsWith('--input=')) input = arg.slice(8)
    else if (arg.startsWith('--output=')) output = arg.slice(9)
    else if (arg.startsWith('--composition-output=')) compositionOutput = arg.slice(21)
    else if (arg.startsWith('--mvp-pilot-output=')) mvpPilotOutput = arg.slice(19)
    else if (arg === '--composition-only') compositionOnly = true
    else if (arg === '--mvp-pilot-only') mvpPilotOnly = true
  }
  return { input, output, compositionOutput, compositionOnly, mvpPilotOnly, mvpPilotOutput }
}

function main() {
  const { input, output, compositionOutput, compositionOnly, mvpPilotOnly, mvpPilotOutput } =
    parseArgs()
  if (mvpPilotOnly) {
    const sql = buildMalicieMvpPilotSeedSql()
    writeFileSync(mvpPilotOutput, sql, 'utf8')
    console.error(`Wrote ${mvpPilotOutput}`)
    return
  }
  if (compositionOnly) {
    const sql = buildMalicieCompositionSeedSql()
    writeFileSync(compositionOutput, sql, 'utf8')
    console.error(`Wrote ${compositionOutput}`)
    return
  }
  const csvText = readFileSync(input, 'utf8')
  const sql = buildMalicieSeedSql(csvText)
  writeFileSync(output, sql, 'utf8')
  console.error(`Wrote ${output}`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
