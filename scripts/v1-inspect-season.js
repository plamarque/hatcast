#!/usr/bin/env node

/**
 * Read-only inspector for V1 Firestore seasons (MIG-3 groundwork).
 *
 * Strictly read-only: only `.get()` calls, never writes. Use it to discover the
 * La Malice season id and profile the real shape of casts / availability before
 * building the MIG-3 extract → transform → load pipeline.
 *
 * Usage:
 *   # List seasons (find La Malice) on V1 production:
 *   node scripts/v1-inspect-season.js --database=default
 *
 *   # Profile one season's structure (counts + anonymized shapes):
 *   node scripts/v1-inspect-season.js --database=default --season=SEASON_ID
 *
 * Credentials: same as scripts/replay/loadSeasonData.js (.env.local). With only
 * VITE_FIREBASE_PROJECT_ID set, it uses gcloud Application Default Credentials.
 * Never prints emails or other PII values — only keys, types and enum-like values.
 */

import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { getDb } from './replay/loadSeasonData.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { season: null, database: 'default', samples: 1 }
  for (const arg of args) {
    if (arg.startsWith('--season=')) result.season = arg.slice(9).trim()
    else if (arg.startsWith('--database=')) result.database = arg.slice(11).trim()
    else if (arg.startsWith('--samples=')) result.samples = Number(arg.slice(10)) || 1
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage:\n  node scripts/v1-inspect-season.js --database=default [--season=ID] [--samples=N]\n\n' +
          'Read-only. Lists seasons when --season is omitted; otherwise profiles one season.',
      )
      process.exit(0)
    }
  }
  return result
}

const PII_KEYS = /(email|mail|phone|tel|name|displayName|firstName|lastName)/i

/** Describe a value as a type tag; redact PII leaf values. */
function describe(value, key = '') {
  if (value === null) return 'null'
  if (Array.isArray(value)) {
    const el = value.length > 0 ? describe(value[0], key) : 'empty'
    return `array<${value.length}> of ${el}`
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') return 'timestamp'
    return 'object'
  }
  if (typeof value === 'string') {
    if (PII_KEYS.test(key)) return 'string<redacted>'
    // Keep short enum-like / boolean-ish strings visible to understand statuses.
    return value.length <= 24 ? `string("${value}")` : 'string<long>'
  }
  return typeof value
}

/** Build a shape map { key: typeTag } for a document, one level deep. */
function shapeOf(data) {
  const shape = {}
  for (const [k, v] of Object.entries(data || {})) {
    shape[k] = describe(v, k)
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof v.toDate !== 'function') {
      const inner = {}
      for (const [ik, iv] of Object.entries(v)) inner[ik] = describe(iv, ik)
      shape[k] = inner
    }
  }
  return shape
}

async function listSeasons(database) {
  const db = getDb(database)
  const snap = await db.collection('seasons').get()
  console.log(`Found ${snap.size} season(s) in database "${database}":\n`)
  const rows = snap.docs.map((doc) => {
    const d = doc.data() || {}
    const admins = Array.isArray(d?.roles?.admins) ? d.roles.admins.length : 0
    const users = Array.isArray(d?.roles?.users) ? d.roles.users.length : 0
    return { id: doc.id, name: d.name || '(no name)', archived: d.archived === true, admins, users }
  })
  rows.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  for (const r of rows) {
    console.log(
      `  ${r.id}  | ${r.name}${r.archived ? ' [archived]' : ''}  | admins=${r.admins} users=${r.users}`,
    )
  }
  console.log('\nNext: node scripts/v1-inspect-season.js --database=' + database + ' --season=<ID>')
}

async function profileSeason(database, seasonId, samples) {
  const db = getDb(database)
  const seasonRef = db.collection('seasons').doc(seasonId)
  const seasonSnap = await seasonRef.get()
  if (!seasonSnap.exists) throw new Error(`Season not found: seasons/${seasonId}`)
  const seasonData = seasonSnap.data() || {}

  const [playersSnap, eventsSnap, castsSnap] = await Promise.all([
    seasonRef.collection('players').get(),
    seasonRef.collection('events').get(),
    seasonRef.collection('casts').get(),
  ])

  const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Availability lives under players/{id}/availability — count without loading PII.
  let availabilityDocs = 0
  await Promise.all(
    players.map(async (p) => {
      const avSnap = await seasonRef.collection('players').doc(p.id).collection('availability').get()
      availabilityDocs += avSnap.size
    }),
  )

  console.log(`Season "${seasonData.name || seasonId}" (id=${seasonId}, db=${database})`)
  console.log(`  archived: ${seasonData.archived === true}`)
  console.log(`  players: ${players.length}`)
  console.log(`  events: ${eventsSnap.size}`)
  console.log(`  casts: ${castsSnap.size}`)
  console.log(`  availability docs (across players): ${availabilityDocs}`)
  console.log(`  season roles: admins=${seasonData?.roles?.admins?.length ?? 0} users=${seasonData?.roles?.users?.length ?? 0}`)

  const withEmail = players.filter((p) => typeof p.email === 'string' && p.email.trim()).length
  console.log(`  players with email: ${withEmail}/${players.length} (${players.length - withEmail} without → migration rejects)`)

  const castStatus = {}
  const playerStatusDist = {}
  castsSnap.docs.forEach((d) => {
    const data = d.data() || {}
    const st = data.status ?? '(none)'
    castStatus[st] = (castStatus[st] || 0) + 1
    for (const v of Object.values(data.playerStatuses || {})) {
      playerStatusDist[v] = (playerStatusDist[v] || 0) + 1
    }
  })
  console.log(`  cast.status distribution: ${JSON.stringify(castStatus)}`)
  console.log(`  playerStatuses distribution: ${JSON.stringify(playerStatusDist)}`)

  const samplePlayer = players[0]
  if (samplePlayer) {
    console.log('\n[shape] player doc:')
    console.log(JSON.stringify(shapeOf(samplePlayer), null, 2))
    const avSnap = await seasonRef
      .collection('players')
      .doc(samplePlayer.id)
      .collection('availability')
      .limit(samples)
      .get()
    avSnap.docs.forEach((d, i) => {
      console.log(`\n[shape] availability doc #${i + 1} (eventId=${d.id}):`)
      console.log(JSON.stringify(shapeOf(d.data()), null, 2))
    })
  }

  eventsSnap.docs.slice(0, samples).forEach((d, i) => {
    console.log(`\n[shape] event doc #${i + 1} (id=${d.id}):`)
    console.log(JSON.stringify(shapeOf(d.data()), null, 2))
  })

  castsSnap.docs.slice(0, samples).forEach((d, i) => {
    console.log(`\n[shape] cast doc #${i + 1} (eventId=${d.id}):`)
    console.log(JSON.stringify(shapeOf(d.data()), null, 2))
  })
}

async function main() {
  const { season, database, samples } = parseArgs()
  if (season) await profileSeason(database, season, samples)
  else await listSeasons(database)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
