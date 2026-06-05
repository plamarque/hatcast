/**
 * Pure mapping + CSV formatting for V1 season → V2 troupe member import.
 * No Firebase dependency — easy to unit test.
 */

export const V2_CSV_HEADER = ['email', 'displayName', 'baselineRole', 'status']
export const V2_USER_CSV_HEADER = ['email', 'displayName', 'gender']

/**
 * @param {string} value
 */
export function escapeCsvField(value) {
  const text = value ?? ''
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * @param {string[]} values
 */
export function formatCsvLine(values) {
  return values.map(escapeCsvField).join(',')
}

/**
 * @param {Array<{ email: string, displayName: string, baselineRole: string, status: string }>} rows
 */
export function formatMemberCsv(rows) {
  const lines = [formatCsvLine(V2_CSV_HEADER)]
  for (const row of rows) {
    lines.push(formatCsvLine([row.email, row.displayName, row.baselineRole, row.status]))
  }
  return `${lines.join('\n')}\n`
}

/**
 * @param {Array<{ email: string, displayName: string, gender?: string }>} rows
 */
export function formatUserCsv(rows) {
  const lines = [formatCsvLine(V2_USER_CSV_HEADER)]
  for (const row of rows) {
    lines.push(formatCsvLine([row.email, row.displayName, row.gender ?? 'non_specified']))
  }
  return `${lines.join('\n')}\n`
}

/**
 * @param {string | null | undefined} email
 */
export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

/**
 * @param {object} player
 */
export function playerDisplayName(player) {
  const fromName = (player.name || '').trim()
  if (fromName) return fromName
  const fromParts = `${player.firstName || ''} ${player.lastName || ''}`.trim()
  if (fromParts) return fromParts
  return ''
}

/**
 * @param {string} email
 */
function displayNameFromEmail(email) {
  const local = email.split('@')[0] || email
  return local.replace(/[._-]+/g, ' ').trim() || email
}

/**
 * Build V2 import rows from V1 season data.
 *
 * @param {object} params
 * @param {string} params.seasonId
 * @param {object | null | undefined} params.seasonData
 * @param {Array<object>} params.players
 * @param {object} [params.options]
 * @param {boolean} [params.options.includeRoleOnlyEmails=true] emails in roles.users/admins without a player doc
 * @returns {{ rows: Array<{ email: string, displayName: string, baselineRole: 'MEMBER'|'TROUPE_ADMIN', status: 'active'|'inactive' }>, skipped: Array<{ reason: string, detail: string }>, warnings: string[] }}
 */
export function buildV2MemberRowsFromV1Season({
  seasonId,
  seasonData,
  players,
  options = {},
}) {
  const includeRoleOnlyEmails = options.includeRoleOnlyEmails !== false
  const seasonAdmins = (seasonData?.roles?.admins || []).map(normalizeEmail).filter(Boolean)
  const seasonUsers = (seasonData?.roles?.users || []).map(normalizeEmail).filter(Boolean)
  const adminSet = new Set(seasonAdmins)
  const skipped = []
  const warnings = []
  /** @type {Map<string, { email: string, displayName: string, baselineRole: string, status: string, order: number }>} */
  const byEmail = new Map()

  const sortedPlayers = [...players].sort((a, b) => {
    const oa = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
    const ob = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
    if (oa !== ob) return oa - ob
    return (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' })
  })

  for (const player of sortedPlayers) {
    const email = normalizeEmail(player.email)
    if (!email) {
      skipped.push({
        reason: 'NO_EMAIL',
        detail: `player ${player.id}: "${playerDisplayName(player) || player.id}" (no V2 import key)`,
      })
      continue
    }
    if (!email.includes('@')) {
      skipped.push({ reason: 'INVALID_EMAIL', detail: `player ${player.id}: "${player.email}"` })
      continue
    }

    const displayName = playerDisplayName(player) || displayNameFromEmail(email)
    const baselineRole = adminSet.has(email) ? 'TROUPE_ADMIN' : 'MEMBER'
    const order = typeof player.order === 'number' ? player.order : Number.MAX_SAFE_INTEGER

    const existing = byEmail.get(email)
    if (existing) {
      warnings.push(
        `Duplicate email "${email}" (players ${existing.playerId} and ${player.id}); keeping first by order.`,
      )
      continue
    }

    byEmail.set(email, {
      email,
      displayName,
      baselineRole,
      status: 'active',
      order,
      playerId: player.id,
    })
  }

  if (includeRoleOnlyEmails) {
    const roleEmails = new Set([...seasonAdmins, ...seasonUsers])
    for (const email of roleEmails) {
      if (byEmail.has(email)) continue
      byEmail.set(email, {
        email,
        displayName: displayNameFromEmail(email),
        baselineRole: adminSet.has(email) ? 'TROUPE_ADMIN' : 'MEMBER',
        status: 'active',
        order: Number.MAX_SAFE_INTEGER,
        playerId: null,
      })
      warnings.push(
        `Email "${email}" from season.roles but no player document — exported with inferred displayName.`,
      )
    }
  }

  const rows = [...byEmail.values()]
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr', { sensitivity: 'base' }))
    .map(({ email, displayName, baselineRole, status }) => ({
      email,
      displayName,
      baselineRole,
      status,
    }))

  if (rows.length === 0) {
    warnings.push(`Season ${seasonId}: no exportable rows (need at least one player with email).`)
  }

  const adminCount = rows.filter((r) => r.baselineRole === 'TROUPE_ADMIN').length
  if (adminCount === 0 && seasonAdmins.length > 0) {
    warnings.push('season.roles.admins is non-empty but no exported row is TROUPE_ADMIN — check email casing/data.')
  }

  return { rows, skipped, warnings }
}

/**
 * Map V1 player gender to V2 wire value.
 *
 * @param {string | null | undefined} raw
 */
export function mapV1GenderToV2(raw) {
  const value = (raw || '').trim().toLowerCase()
  if (value === 'male') return 'male'
  if (value === 'female') return 'female'
  return 'non_specified'
}

/**
 * @param {object} player
 */
function playerUpdatedAtMs(player) {
  const ts = player.updatedAt
  if (!ts) return 0
  if (typeof ts.toMillis === 'function') return ts.toMillis()
  if (typeof ts.toDate === 'function') return ts.toDate().getTime()
  if (typeof ts === 'number') return ts
  return 0
}

/**
 * Resolve gender for one email from all linked V1 player rows.
 *
 * @param {Array<object>} playersForEmail
 */
export function resolveGenderForEmail(playersForEmail) {
  let best = 'non_specified'
  let bestScore = -1
  for (const player of playersForEmail) {
    const mapped = mapV1GenderToV2(player.gender)
    if (mapped === 'non_specified') continue
    const score = playerUpdatedAtMs(player) || 1
    if (score >= bestScore) {
      best = mapped
      bestScore = score
    }
  }
  return best
}

/**
 * Build V2 user import rows from V1 season data.
 *
 * @param {object} params
 * @param {string} params.seasonId
 * @param {object | null | undefined} params.seasonData
 * @param {Array<object>} params.players
 * @param {object} [params.options]
 * @param {boolean} [params.options.includeRoleOnlyEmails=true]
 * @returns {{ rows: Array<{ email: string, displayName: string, gender: string }>, skipped: Array<{ reason: string, detail: string }>, warnings: string[] }}
 */
export function buildV2UserRowsFromV1Season({
  seasonId,
  seasonData,
  players,
  options = {},
}) {
  const { rows: memberRows, skipped, warnings } = buildV2MemberRowsFromV1Season({
    seasonId,
    seasonData,
    players,
    options,
  })
  /** @type {Map<string, Array<object>>} */
  const playersByEmail = new Map()
  for (const player of players) {
    const email = normalizeEmail(player.email)
    if (!email || !email.includes('@')) continue
    const bucket = playersByEmail.get(email) ?? []
    bucket.push(player)
    playersByEmail.set(email, bucket)
  }
  const rows = memberRows.map(({ email, displayName }) => ({
    email,
    displayName,
    gender: resolveGenderForEmail(playersByEmail.get(email) ?? []),
  }))
  return { rows, skipped, warnings }
}
