#!/usr/bin/env node
/**
 * E1 §6 — migration counts gate on staging Neon (Malice 2025-2026).
 *
 * Usage:
 *   node scripts/v2/e1-staging-migration-assert.mjs
 *   node scripts/v2/e1-staging-migration-assert.mjs --database-url="$NEON_STAGING_URL"
 *
 * Env (CI staging environment):
 *   HATCAST_DATASOURCE_URL | NEON_STAGING_URL | HATCAST_MIGRATE_DATABASE_URL
 *   HATCAST_DATASOURCE_USERNAME + HATCAST_DATASOURCE_PASSWORD (when JDBC URL has no userinfo)
 *   HATCAST_E2E_TROUPE_SLUG (default la-malice)
 *   HATCAST_E2E_SEASON_SLUG (required)
 *   HATCAST_E2E_EVENTS_EXPECTED (default 55)
 *   HATCAST_E2E_EVENTS_TOLERANCE (default 2)
 *   HATCAST_E2E_DEPLACEMENTS_EXPECTED (default 7)
 *   HATCAST_E2E_DEPLACEMENTS_TOLERANCE (default 0)
 */

import { buildPostgresConnectionUrl } from '../migrate-malice-load.mjs'
import { withClient } from './migrate-lib/neon.mjs'

function parseArgs(argv) {
  /** @type {{ databaseUrl?: string; troupeSlug: string; seasonSlug?: string; eventsExpected: number; eventsTolerance: number; deplacementsExpected: number; deplacementsTolerance: number }} */
  const out = {
    troupeSlug: process.env.HATCAST_E2E_TROUPE_SLUG?.trim() || 'la-malice',
    eventsExpected: Number(process.env.HATCAST_E2E_EVENTS_EXPECTED ?? 55),
    eventsTolerance: Number(process.env.HATCAST_E2E_EVENTS_TOLERANCE ?? 2),
    deplacementsExpected: Number(process.env.HATCAST_E2E_DEPLACEMENTS_EXPECTED ?? 7),
    deplacementsTolerance: Number(process.env.HATCAST_E2E_DEPLACEMENTS_TOLERANCE ?? 0),
  }
  for (const arg of argv) {
    if (arg.startsWith('--database-url=')) out.databaseUrl = arg.slice('--database-url='.length)
    else if (arg.startsWith('--troupe-slug=')) out.troupeSlug = arg.slice('--troupe-slug='.length)
    else if (arg.startsWith('--season-slug=')) out.seasonSlug = arg.slice('--season-slug='.length)
    else if (arg.startsWith('--events-expected=')) out.eventsExpected = Number(arg.slice('--events-expected='.length))
    else if (arg.startsWith('--events-tolerance=')) out.eventsTolerance = Number(arg.slice('--events-tolerance='.length))
    else if (arg.startsWith('--deplacements-expected=')) {
      out.deplacementsExpected = Number(arg.slice('--deplacements-expected='.length))
    } else if (arg.startsWith('--deplacements-tolerance=')) {
      out.deplacementsTolerance = Number(arg.slice('--deplacements-tolerance='.length))
    }
  }
  out.seasonSlug = out.seasonSlug ?? process.env.HATCAST_E2E_SEASON_SLUG?.trim()
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

function assertRange(name, actual, expected, tolerance) {
  const min = expected - tolerance
  const max = expected + tolerance
  if (actual < min || actual > max) {
    throw new Error(`${name}: expected ${expected} ± ${tolerance}, got ${actual}`)
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

async function migrationCounts(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE) AS events,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE AND (
           category = 'deplacements' OR (category IS NULL AND template_type = 'deplacement')
         )) AS deplacements`,
      [seasonId],
    )
    return res.rows[0]
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
  const counts = await migrationCounts(opts.databaseUrl, season.id)

  console.log(`E1-MIG gate — ${season.title} (${opts.troupeSlug}/${opts.seasonSlug})`)
  console.log(`  events (non-archived): ${counts.events}`)
  console.log(`  deplacements: ${counts.deplacements}`)

  assertRange('E1-MIG-001 events', counts.events, opts.eventsExpected, opts.eventsTolerance)
  assertRange(
    'E1-MIG-002 deplacements',
    counts.deplacements,
    opts.deplacementsExpected,
    opts.deplacementsTolerance,
  )
  if (Number(counts.deplacements) < 1) {
    throw new Error('E1-MIG-003: expected at least one deplacement event in season (any date)')
  }

  console.log('E1 migration assert: PASSED')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
