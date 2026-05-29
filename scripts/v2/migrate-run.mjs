#!/usr/bin/env node

/**
 * HatCast V2 pre-prod migration orchestrator (MIG-5).
 *
 * Chains Procedure B end-to-end: bootstrap → B1–B5 → smoke.
 * Requires migration API key on target API (ADR-0017).
 *
 * Usage:
 *   npm run migrate:v2:run -- --config=export/malice/migrate.config.json --yes
 *   npm run migrate:v2:run -- --config=... --dry-run
 *   npm run migrate:v2:run -- --config=... --from-step=b4 --yes --i-reset-neon
 */

import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { parseConfig } from './migrate-lib/config.mjs'
import { createLogger } from './migrate-lib/logger.mjs'
import { runPipeline } from './migrate-lib/pipeline.mjs'
import { resolveExpectHost } from '../migrate-malice-load.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
dotenv.config({ path: join(REPO_ROOT, '.env.local') })
dotenv.config({ path: join(REPO_ROOT, '.env') })

function printHelp() {
  console.log(`Usage:
  npm run migrate:v2:run -- [options]

Options:
  --config=PATH           JSON config (default export/malice/migrate.config.json)
  --target=staging|prod   Target label for load guard
  --api-base-url=URL      V2 Cloud Run base URL
  --migration-api-key=KEY Override HATCAST_MIGRATION_API_KEY
  --v1-season=ID          Firestore V1 season id
  --troupe-name=NAME      Bootstrap troupe name
  --season-title=TITLE    Bootstrap season title
  --troupe-id=UUID        Skip troupe creation
  --season-v2=UUID        Skip season creation
  --database-url=URL      Neon JDBC/postgres URL
  --expect-host=MARKER    Load guard host marker (or auto)
  --from-step=STEP        preflight|bootstrap|b1|b2|roster|b4|b5|smoke|report
  --reuse-artifact=DIR    Reuse existing export/malice/<ts> directory
  --export-dir=PATH       Run output root (default ./export/malice-runs)
  --run-id=ID             Run folder name
  --dry-run               No Neon writes (default unless --yes)
  --yes                   Apply load.sql to Neon (staging) or prod with --confirm-prod
  --confirm-prod=SLUG     Required for prod writes
  --skip-bootstrap        Skip troupe/season API creation
  --record-cycle          Append line to replay-log.jsonl after smoke
  --i-reset-neon          Acknowledge Neon branch was reset (proc. C)
  --allow-import-errors=N Tolerate N CSV import errors (default 0)
  --help                  This help
`)
}

async function main() {
  const argv = process.argv.slice(2)
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  const config = parseConfig(argv)
  if (config.expectHost === 'auto' && config.databaseUrl) {
    config.expectHost = resolveExpectHost('auto', config.databaseUrl)
  }

  const logger = createLogger(config.runLogPath)
  logger.info('run', `Starting migration run ${config.runId} (from=${config.fromStep}, dryRun=${config.dryRun})`)

  try {
    await runPipeline(config, logger)
    logger.info('run', 'Pipeline completed successfully')
  } catch (err) {
    logger.error('run', err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

main()
