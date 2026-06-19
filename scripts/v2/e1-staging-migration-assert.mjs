#!/usr/bin/env node
/**
 * E1 §6 — migration sanity gate on staging Neon (Malice 2025-2026).
 *
 * Structural checks only (counts evolve as orga archives events or adds shows).
 * Does not assert fixed V1 parity numbers (55 events / 7 deplacements).
 *
 * Usage:
 *   node scripts/v2/e1-staging-migration-assert.mjs
 *   node scripts/v2/e1-staging-migration-assert.mjs --database-url="$NEON_STAGING_URL"
 *   node scripts/v2/e1-staging-migration-assert.mjs --probe   # exit 0 if season exists (T2 skip probe)
 *
 * Env (CI staging environment):
 *   HATCAST_DATASOURCE_URL | NEON_STAGING_URL | HATCAST_MIGRATE_DATABASE_URL
 *   HATCAST_DATASOURCE_USERNAME + HATCAST_DATASOURCE_PASSWORD (when JDBC URL has no userinfo)
 *   HATCAST_E2E_TROUPE_SLUG (default la-malice)
 *   HATCAST_E2E_SEASON_SLUG (required)
 *   HATCAST_E2E_MIG_MIN_EVENTS (default 1)
 *   HATCAST_E2E_MIG_MIN_PARTICIPANTS (default 1)
 *   HATCAST_E2E_MIG_MIN_DEPLACEMENTS (default 1)
 *
 * Opt-in strict parity (migration replay validation only — not CI staging gate):
 *   HATCAST_E2E_EVENTS_EXPECTED + HATCAST_E2E_EVENTS_TOLERANCE
 *   HATCAST_E2E_DEPLACEMENTS_EXPECTED + HATCAST_E2E_DEPLACEMENTS_TOLERANCE
 */

import { buildPostgresConnectionUrl } from '../migrate-malice-load.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { withClient } from './migrate-lib/neon.mjs'

function parseArgs(argv) {
  /** @type {{
   *   databaseUrl?: string
   *   troupeSlug: string
   *   seasonSlug?: string
   *   minEvents: number
   *   minParticipants: number
   *   minDeplacements: number
   *   eventsExpected?: number
   *   eventsTolerance?: number
   *   deplacementsExpected?: number
   *   deplacementsTolerance?: number
   *   probe: boolean
   * }} */
  const out = {
    troupeSlug: process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || 'la-malice',
    minEvents: Number(process.env.HATCAST_E2E_MIG_MIN_EVENTS ?? 1),
    minParticipants: Number(process.env.HATCAST_E2E_MIG_MIN_PARTICIPANTS ?? 1),
    minDeplacements: Number(process.env.HATCAST_E2E_MIG_MIN_DEPLACEMENTS ?? 1),
    probe: false,
  }
  for (const arg of argv) {
    if (arg === '--probe') out.probe = true
    else if (arg.startsWith('--database-url=')) out.databaseUrl = arg.slice('--database-url='.length)
    else if (arg.startsWith('--troupe-slug=')) out.troupeSlug = arg.slice('--troupe-slug='.length)
    else if (arg.startsWith('--season-slug=')) out.seasonSlug = arg.slice('--season-slug='.length)
    else if (arg.startsWith('--min-events=')) out.minEvents = Number(arg.slice('--min-events='.length))
    else if (arg.startsWith('--min-participants=')) {
      out.minParticipants = Number(arg.slice('--min-participants='.length))
    } else if (arg.startsWith('--min-deplacements=')) {
      out.minDeplacements = Number(arg.slice('--min-deplacements='.length))
    } else if (arg.startsWith('--events-expected=')) {
      out.eventsExpected = Number(arg.slice('--events-expected='.length))
    } else if (arg.startsWith('--events-tolerance=')) {
      out.eventsTolerance = Number(arg.slice('--events-tolerance='.length))
    } else if (arg.startsWith('--deplacements-expected=')) {
      out.deplacementsExpected = Number(arg.slice('--deplacements-expected='.length))
    } else if (arg.startsWith('--deplacements-tolerance=')) {
      out.deplacementsTolerance = Number(arg.slice('--deplacements-tolerance='.length))
    }
  }
  out.seasonSlug = out.seasonSlug ?? process.env.HATCAST_E2E_SEASON_SLUG?.trim()

  if (process.env.HATCAST_E2E_EVENTS_EXPECTED?.trim()) {
    out.eventsExpected = Number(process.env.HATCAST_E2E_EVENTS_EXPECTED)
    out.eventsTolerance = Number(process.env.HATCAST_E2E_EVENTS_TOLERANCE ?? 0)
  }
  if (process.env.HATCAST_E2E_DEPLACEMENTS_EXPECTED?.trim()) {
    out.deplacementsExpected = Number(process.env.HATCAST_E2E_DEPLACEMENTS_EXPECTED)
    out.deplacementsTolerance = Number(process.env.HATCAST_E2E_DEPLACEMENTS_TOLERANCE ?? 0)
  }

  const rawDatabaseUrl =
    out.databaseUrl ??
    process.env.HATCAST_DATASOURCE_URL?.trim() ??
    process.env.NEON_STAGING_URL?.trim() ??
    process.env.HATCAST_MIGRATE_DATABASE_URL?.trim()
  out.databaseUrl = rawDatabaseUrl
    ? buildPostgresConnectionUrl(rawDatabaseUrl, {
        username: process.env.HATCAST_DATASOURCE_USERNAME,
        password: process.env.HATCAST_DATASOURCE_PASSWORD ?? '',
      })
    : undefined
  return out
}

function assertMin(name, actual, minimum) {
  if (actual < minimum) {
    throw new Error(`${name}: expected at least ${minimum}, got ${actual}`)
  }
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`)
  }
}

function assertRange(name, actual, expected, tolerance) {
  const min = expected - tolerance
  const max = expected + tolerance
  if (actual < min || actual > max) {
    throw new Error(`${name}: expected ${expected} ± ${tolerance}, got ${actual}`)
  }
}

/**
 * @param {{
 *   seasonEventCount: number
 *   eventsNonArchived: number
 *   eventsArchived: number
 *   deplacements: number
 *   participantsActive: number
 *   eventsWithDisposOpen: number
 * }} snapshot
 * @param {ReturnType<typeof parseArgs>} opts
 */
export function evaluateMigrationGate(snapshot, opts) {
  assertMin('E1-MIG-001 participants (active roster)', snapshot.participantsActive, opts.minParticipants)
  assertMin('E1-MIG-002 events (non-archived)', snapshot.eventsNonArchived, opts.minEvents)
  assertEqual(
    'E1-MIG-003 season.event_count vs non-archived events',
    snapshot.seasonEventCount,
    snapshot.eventsNonArchived,
  )
  assertMin('E1-MIG-004 deplacements', snapshot.deplacements, opts.minDeplacements)
  assertMin(
    'E1-MIG-005 events with dispos opened',
    snapshot.eventsWithDisposOpen,
    1,
  )

  if (opts.eventsExpected != null && !Number.isNaN(opts.eventsExpected)) {
    assertRange(
      'E1-MIG-OPT events parity',
      snapshot.eventsNonArchived,
      opts.eventsExpected,
      opts.eventsTolerance ?? 0,
    )
  }
  if (opts.deplacementsExpected != null && !Number.isNaN(opts.deplacementsExpected)) {
    assertRange(
      'E1-MIG-OPT deplacements parity',
      snapshot.deplacements,
      opts.deplacementsExpected,
      opts.deplacementsTolerance ?? 0,
    )
  }
}

async function resolveSeasonId(databaseUrl, troupeSlug, seasonSlug) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT s.id, s.title
       FROM seasons s
       JOIN troupes t ON t.id = s.troupe_id
       WHERE t.slug = $1 AND s.slug = $2
       LIMIT 1`,
      [troupeSlug, seasonSlug],
    )
    if (res.rowCount === 0) {
      throw new Error(`Season not found: troupe=${troupeSlug} season=${seasonSlug}`)
    }
    return res.rows[0]
  })
}

async function migrationSnapshot(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT
         s.event_count::int AS season_event_count,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE) AS events_non_archived,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = TRUE) AS events_archived,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE AND (
           category = 'deplacements' OR (category IS NULL AND template_type = 'deplacement')
         )) AS deplacements,
         (SELECT COUNT(*)::int FROM season_participants WHERE season_id = $1::uuid AND status = 'ACTIVE') AS participants_active,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE AND availability_opened_at IS NOT NULL) AS events_with_dispos_open
       FROM seasons s
       WHERE s.id = $1::uuid`,
      [seasonId],
    )
    if (res.rowCount === 0) {
      throw new Error(`Season row missing: ${seasonId}`)
    }
    const row = res.rows[0]
    return {
      seasonEventCount: row.season_event_count,
      eventsNonArchived: row.events_non_archived,
      eventsArchived: row.events_archived,
      deplacements: row.deplacements,
      participantsActive: row.participants_active,
      eventsWithDisposOpen: row.events_with_dispos_open,
    }
  })
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (!opts.databaseUrl) {
    console.error(
      'Missing database URL. Set HATCAST_DATASOURCE_URL, NEON_STAGING_URL, or pass --database-url=',
    )
    process.exit(1)
  }
  if (!opts.seasonSlug) {
    console.error('Missing season slug. Set HATCAST_E2E_SEASON_SLUG or pass --season-slug=')
    process.exit(1)
  }

  const season = await resolveSeasonId(opts.databaseUrl, opts.troupeSlug, opts.seasonSlug)

  if (opts.probe) {
    console.log(
      `E1-MIG probe: ready — ${season.title} (${opts.troupeSlug}/${opts.seasonSlug})`,
    )
    return
  }

  const snapshot = await migrationSnapshot(opts.databaseUrl, season.id)

  console.log(`E1-MIG gate — ${season.title} (${opts.troupeSlug}/${opts.seasonSlug})`)
  console.log(`  participants (active): ${snapshot.participantsActive}`)
  console.log(`  events (non-archived): ${snapshot.eventsNonArchived}`)
  console.log(`  events (archived): ${snapshot.eventsArchived}`)
  console.log(`  seasons.event_count: ${snapshot.seasonEventCount}`)
  console.log(`  deplacements: ${snapshot.deplacements}`)
  console.log(`  events with dispos opened: ${snapshot.eventsWithDisposOpen}`)

  evaluateMigrationGate(snapshot, opts)

  console.log('E1 migration assert: PASSED')
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
}
