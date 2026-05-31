#!/usr/bin/env node
/**
 * One-off repair: reconcile seasons.event_count from non-archived events (BUG-004 / story 17-30).
 *
 * Usage:
 *   node scripts/v2/reconcile-season-event-counts.mjs --database-url="$DATABASE_URL"
 *   node scripts/v2/reconcile-season-event-counts.mjs --database-url="$DATABASE_URL" --season-id=<uuid>
 *
 * Dry-run (report drift only):
 *   node scripts/v2/reconcile-season-event-counts.mjs --database-url="$DATABASE_URL" --dry-run
 */

import { reconcileAllSeasonEventCounts, reconcileSeasonEventCount, withClient } from './migrate-lib/neon.mjs'

function parseArgs(argv) {
  /** @type {{ databaseUrl?: string, seasonId?: string, dryRun: boolean }} */
  const out = { dryRun: false }
  for (const arg of argv) {
    if (arg === '--dry-run') out.dryRun = true
    else if (arg.startsWith('--database-url=')) out.databaseUrl = arg.slice('--database-url='.length)
    else if (arg.startsWith('--season-id=')) out.seasonId = arg.slice('--season-id='.length)
  }
  return out
}

async function reportDrift(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const params = seasonId ? [seasonId] : []
    const whereSeason = seasonId ? 'WHERE s.id = $1::uuid' : ''
    const res = await client.query(
      `SELECT s.id, s.title, s.event_count AS stored,
              (SELECT COUNT(*)::int FROM events e WHERE e.season_id = s.id AND e.archived = FALSE) AS actual
       FROM seasons s
       ${whereSeason}
       ORDER BY s.title`,
      params,
    )
    return res.rows.filter((r) => Number(r.stored) !== Number(r.actual))
  })
}

async function seasonExists(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query('SELECT 1 FROM seasons WHERE id = $1::uuid', [seasonId])
    return (res.rowCount ?? 0) > 0
  })
}

async function main() {
  const { databaseUrl, seasonId, dryRun } = parseArgs(process.argv.slice(2))
  if (!databaseUrl) {
    console.error('Missing --database-url=')
    process.exit(1)
  }

  if (seasonId && !(await seasonExists(databaseUrl, seasonId))) {
    console.error(`Season not found: ${seasonId}`)
    process.exit(1)
  }

  const drift = await reportDrift(databaseUrl, seasonId)
  if (drift.length === 0) {
    console.log('No event_count drift detected.')
    return
  }

  console.error(`Found ${drift.length} season(s) with drift:`)
  for (const row of drift) {
    console.error(`  ${row.id}  ${row.title}: stored=${row.stored} actual=${row.actual}`)
  }

  if (dryRun) {
    console.log('Dry-run — no updates applied.')
    return
  }

  if (seasonId) {
    const count = await reconcileSeasonEventCount(databaseUrl, seasonId)
    if (count === null) {
      console.error(`Season not found: ${seasonId}`)
      process.exit(1)
    }
    console.log(`Reconciled season ${seasonId} → event_count=${count}`)
  } else {
    const updated = await reconcileAllSeasonEventCounts(databaseUrl)
    console.log(`Reconciled event_count on ${updated} season row(s).`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
