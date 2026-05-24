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
  for (const arg of args) {
    if (arg.startsWith('--input=')) input = arg.slice(8)
    else if (arg.startsWith('--output=')) output = arg.slice(9)
    else if (arg.startsWith('--composition-output=')) compositionOutput = arg.slice(21)
    else if (arg === '--composition-only') compositionOnly = true
  }
  return { input, output, compositionOutput, compositionOnly }
}

function main() {
  const { input, output, compositionOutput, compositionOnly } = parseArgs()
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
