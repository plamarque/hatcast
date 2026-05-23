#!/usr/bin/env node

/**
 * Export V1 Firestore season members to V2 troupe member CSV (Story 2.3 contract).
 *
 * V1 model: seasons/{seasonId} + subcollection players + roles.admins / roles.users (emails).
 * One V1 season maps to one V2 troupe for migration.
 *
 * Usage:
 *   node scripts/v1-export-troupe-members-csv.js --season=SEASON_ID [--output=./members.csv] [--database=development]
 *
 * Requires Firebase Admin credentials in .env.local (same as scripts/replay/loadSeasonData.js):
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *   or VITE_FIREBASE_PROJECT_ID + gcloud application-default login
 */

import dotenv from 'dotenv'
import { writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { getDb } from './replay/loadSeasonData.js'
import { buildV2MemberRowsFromV1Season, formatMemberCsv } from './v1/troupeMembersCsv.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

function parseArgs() {
  const args = process.argv.slice(2)
  /** @type {{ season: string | null, output: string | null, database: string, includeRoleOnlyEmails: boolean }} */
  const result = {
    season: null,
    output: null,
    database: 'development',
    includeRoleOnlyEmails: true,
  }

  for (const arg of args) {
    if (arg.startsWith('--season=')) result.season = arg.slice(9).trim()
    else if (arg.startsWith('--output=')) result.output = arg.slice(9).trim()
    else if (arg.startsWith('--database=')) result.database = arg.slice(11).trim()
    else if (arg === '--no-role-only-emails') result.includeRoleOnlyEmails = false
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  return result
}

function printHelp() {
  console.log(`Usage:
  node scripts/v1-export-troupe-members-csv.js --season=SEASON_ID [options]

Options:
  --season=ID           Firestore season document id (required)
  --output=PATH         Write CSV to file (default: stdout)
  --database=NAME       Firestore database id (default: development)
  --no-role-only-emails Skip emails found only in roles.users/admins (no player doc)
  --help                Show this help

Output columns: email, displayName, baselineRole, status
  baselineRole: MEMBER | TROUPE_ADMIN (from seasons.roles.admins)
  status: active (V1 has no inactive member flag)

Players without email are skipped (cannot import to V2 without USER_NOT_FOUND).
`)
}

async function loadSeasonExportData(seasonId, database) {
  const db = getDb(database)
  const seasonRef = db.collection('seasons').doc(seasonId)
  const [seasonSnap, playersSnap] = await Promise.all([
    seasonRef.get(),
    seasonRef.collection('players').get(),
  ])

  if (!seasonSnap.exists) {
    throw new Error(`Season not found: seasons/${seasonId}`)
  }

  const players = playersSnap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const oa = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
      const ob = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
      if (oa !== ob) return oa - ob
      return (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' })
    })

  return {
    seasonData: seasonSnap.data(),
    players,
  }
}

async function main() {
  const { season, output, database, includeRoleOnlyEmails } = parseArgs()
  if (!season) {
    printHelp()
    process.exit(1)
  }

  const { seasonData, players } = await loadSeasonExportData(season, database)
  const { rows, skipped, warnings } = buildV2MemberRowsFromV1Season({
    seasonId: season,
    seasonData,
    players,
    options: { includeRoleOnlyEmails },
  })

  const csv = formatMemberCsv(rows)
  const seasonName = seasonData?.name || season

  if (output) {
    writeFileSync(output, csv, 'utf8')
    console.error(`Wrote ${rows.length} row(s) to ${output} (season "${seasonName}")`)
  } else {
    process.stdout.write(csv)
  }

  if (skipped.length > 0) {
    console.error(`\nSkipped ${skipped.length} player(s) without importable email:`)
    for (const item of skipped) {
      console.error(`  [${item.reason}] ${item.detail}`)
    }
  }

  if (warnings.length > 0) {
    console.error('\nWarnings:')
    for (const w of warnings) {
      console.error(`  - ${w}`)
    }
  }

  console.error(
    `\nImport hint: import users first (npm run export:v1-users), then members via Membres → Importer CSV.`,
  )
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
