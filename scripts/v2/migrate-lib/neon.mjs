/**
 * Neon SQL via pg (no psql required for reads / optional for load via migrate-malice-load).
 */

import pg from 'pg'

import { normalizePostgresUrl } from '../../migrate-malice-load.mjs'

const { Client } = pg

export async function withClient(databaseUrl, fn) {
  const connectionString = normalizePostgresUrl(databaseUrl)
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.end()
  }
}

export async function queryScalar(databaseUrl, sql, params = []) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(sql, params)
    return res.rows[0] ? Object.values(res.rows[0])[0] : null
  })
}

export async function exportParticipantsJson(databaseUrl, seasonV2Id) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT id AS "seasonParticipantId", user_id AS "userId", normalized_email AS "normalizedEmail"
       FROM season_participants
       WHERE season_id = $1::uuid AND status = 'ACTIVE'
       ORDER BY normalized_email`,
      [seasonV2Id],
    )
    return res.rows
  })
}

export async function smokeCounts(databaseUrl, seasonV2Id) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid) AS events,
         (SELECT COUNT(*)::int FROM season_participants WHERE season_id = $1::uuid AND status = 'ACTIVE') AS participants,
         (SELECT COUNT(*)::int FROM event_availability ea JOIN events e ON e.id = ea.event_id WHERE e.season_id = $1::uuid) AS availability,
         (SELECT COUNT(*)::int FROM event_compositions ec JOIN events e ON e.id = ec.event_id WHERE e.season_id = $1::uuid) AS compositions,
         (SELECT COUNT(*)::int FROM users WHERE email LIKE '%@seed.improbots.test') AS seed_users`,
      [seasonV2Id],
    )
    return res.rows[0]
  })
}
