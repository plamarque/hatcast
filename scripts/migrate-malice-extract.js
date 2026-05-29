#!/usr/bin/env node

/**
 * MIG-2/MIG-3 extract (strictly read-only) — dump V1 La Malice season data.
 *
 * ADR-0016 §Decision.2: only `.get()` calls, never writes V1. Output is a
 * timestamped, diffable JSON dump under `export/malice/<ts>/raw.json` (kept out
 * of git — contains PII).
 *
 * Includes (MIG-2): season meta, ALL events, players.
 * Includes (MIG-3): flat availability records + casts (1227 + 32 for Malice 2025-2026).
 *
 * Unlike scripts/replay/loadSeasonData.js#loadEvents (dev DB, drops archived),
 * this dumps ALL events from the chosen database so archived events still migrate
 * and the dump faithfully mirrors V1.
 *
 * Usage:
 *   npm run migrate:malice:extract -- --season=o0kD2IJekMdGdiJeIg4O
 *   npm run migrate:malice:extract -- --season=ID --database='(default)' --out-dir=./export/malice
 *
 * Credentials: same as scripts/replay/loadSeasonData.js (.env.local).
 */

import dotenv from 'dotenv'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import {
  getDb,
  loadAvailabilityRecords,
  loadCasts,
  normalizeDatabaseId,
} from './replay/loadSeasonData.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
dotenv.config({ path: join(REPO_ROOT, '.env.local') })

const DEFAULT_SEASON = 'o0kD2IJekMdGdiJeIg4O'

function parseArgs() {
  const args = process.argv.slice(2)
  const result = {
    season: DEFAULT_SEASON,
    database: 'default',
    outDir: join(REPO_ROOT, 'export', 'malice'),
  }
  for (const arg of args) {
    if (arg.startsWith('--season=')) result.season = arg.slice(9).trim()
    else if (arg.startsWith('--database=')) result.database = arg.slice(11).trim()
    else if (arg.startsWith('--out-dir=')) result.outDir = arg.slice(10).trim()
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage:\n  npm run migrate:malice:extract -- --season=ID [--database=(default)] [--out-dir=./export/malice]\n\n' +
          'Read-only. Dumps season meta, events, players, availability, casts to <out-dir>/<timestamp>/raw.json.',
      )
      process.exit(0)
    }
  }
  return result
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

/** Serialize Firestore Timestamp / nested objects for JSON dump. */
function serializeValue(value) {
  if (value == null) return null
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(serializeValue)
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = serializeValue(v)
    return out
  }
  return value
}

function serializeCasts(castsByEventId) {
  return Object.entries(castsByEventId || {}).map(([v1EventId, data]) => ({
    v1EventId,
    roles: serializeValue(data.roles || {}),
    declined: serializeValue(data.declined || {}),
    confirmed: data.confirmed === true,
    confirmedAt: serializeValue(data.confirmedAt),
    updatedAt: serializeValue(data.updatedAt),
    playerStatuses: serializeValue(data.playerStatuses || {}),
    confirmedByAllPlayers: data.confirmedByAllPlayers === true,
    status: data.status ?? null,
    statusDetails: serializeValue(data.statusDetails),
  }))
}

async function extractSeason(seasonId, database) {
  const db = getDb(database)
  const seasonRef = db.collection('seasons').doc(seasonId)
  const [seasonSnap, eventsSnap, playersSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection('events').get(),
    seasonRef.collection('players').get(),
  ])

  if (!seasonSnap.exists) throw new Error(`Season not found: seasons/${seasonId}`)

  const seasonData = seasonSnap.data() || {}
  const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  const [availability, castsByEventId] = await Promise.all([
    loadAvailabilityRecords(seasonId, players, database),
    loadCasts(seasonId, database),
  ])
  const casts = serializeCasts(castsByEventId)

  return {
    schema: 'hatcast/mig-2/raw@2',
    extractedAt: new Date().toISOString(),
    database: normalizeDatabaseId(database),
    v1SeasonId: seasonId,
    season: {
      name: seasonData.name ?? null,
      archived: seasonData.archived === true,
      roles: {
        admins: Array.isArray(seasonData?.roles?.admins) ? seasonData.roles.admins : [],
        users: Array.isArray(seasonData?.roles?.users) ? seasonData.roles.users : [],
      },
    },
    counts: {
      events: events.length,
      archivedEvents: events.filter((e) => e.archived === true).length,
      players: players.length,
      availability: availability.length,
      casts: casts.length,
    },
    events,
    players,
    availability,
    casts,
  }
}

async function main() {
  const { season, database, outDir } = parseArgs()
  const dump = await extractSeason(season, database)

  const dir = join(outDir, timestamp())
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'raw.json')
  writeFileSync(file, `${JSON.stringify(dump, null, 2)}\n`, 'utf8')

  console.error(
    `Wrote ${file}\n  database=${dump.database} season="${dump.season.name}" ` +
      `events=${dump.counts.events} (archived=${dump.counts.archivedEvents}) players=${dump.counts.players} ` +
      `availability=${dump.counts.availability} casts=${dump.counts.casts}`,
  )
  console.error(
    `\nNext (MIG-2): npm run migrate:malice:transform -- --raw=${file} --season-v2=<V2_SEASON_UUID> --participants=<participants.json>`,
  )
  console.error(
    `Next (MIG-3): npm run migrate:malice:transform:ac -- --raw=${file} --manifest=<manifest.json from MIG-2 transform>`,
  )
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
