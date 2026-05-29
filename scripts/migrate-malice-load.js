#!/usr/bin/env node

/**
 * MIG-2/MIG-3 load — apply generated load.sql to Neon via psql (write step).
 *
 * ADR-0016 §Decision.5: idempotent SQL applied inside a SINGLE transaction.
 * `--dry-run` is the DEFAULT (prints the SQL + a report, writes nothing). To
 * actually write:
 *   - staging target: pass `--yes` AND `--expect-host=<marker>`
 *   - production target: pass `--confirm-prod=<slug>` (must match --target) AND
 *     `--expect-host=<marker>`
 *
 * `--expect-host` asserts the connection host/branch for EVERY write (staging and
 * prod) so a prod URL mislabelled `--target=staging` cannot slip through.
 *
 * The TARGET DATABASE is whatever `--database-url` / env resolves to — the
 * `--target` label only drives the guard. `--expect-host` cross-checks the
 * actual connection host OR database/branch name so a mislabelled URL is
 * refused (URL↔target safety).
 *
 * Shared by MIG-2 (events) and MIG-3 (availability/compositions): pass one or
 * more --sql=PATH files; they are applied in order in the same transaction.
 *
 * Connection: --database-url=URL or env HATCAST_MIGRATE_DATABASE_URL / DATABASE_URL.
 * Requires `psql` on PATH for the write path (not needed for --dry-run).
 *
 * Usage:
 *   npm run migrate:malice:load -- --sql=export/malice/<ts>/load.sql            # dry-run
 *   npm run migrate:malice:load -- --sql=.../load.sql --target=staging --yes \
 *     --database-url="$NEON_STAGING_URL" --expect-host=staging
 *   npm run migrate:malice:load -- --sql=.../load.sql --target=prod \
 *     --confirm-prod=prod --database-url="$NEON_PROD_URL" --expect-host=prod
 */

import { spawnSync } from 'child_process'
import { readFileSync } from 'fs'
import { pathToFileURL } from 'url'

export function parseArgs(argv = process.argv.slice(2)) {
  const result = {
    sql: [],
    databaseUrl:
      process.env.HATCAST_MIGRATE_DATABASE_URL || process.env.DATABASE_URL || null,
    target: 'staging',
    yes: false,
    confirmProd: null,
    prod: false,
    expectHost: null,
  }
  for (const arg of argv) {
    if (arg.startsWith('--sql=')) result.sql.push(arg.slice(6).trim())
    else if (arg.startsWith('--database-url=')) result.databaseUrl = arg.slice(15).trim()
    else if (arg.startsWith('--target=')) result.target = arg.slice(9).trim()
    else if (arg.startsWith('--confirm-prod=')) result.confirmProd = arg.slice(15).trim()
    else if (arg.startsWith('--expect-host=')) result.expectHost = arg.slice(14).trim()
    else if (arg === '--yes') result.yes = true
    else if (arg === '--prod') result.prod = true
    else if (arg === '--dry-run') {
      /* explicit default, no-op */
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }
  }
  return result
}

function printHelp() {
  console.log(`Usage:
  npm run migrate:malice:load -- --sql=PATH [--sql=PATH ...] [options]

Options:
  --sql=PATH            SQL file(s) to apply in order, same transaction (required)
  --database-url=URL    Postgres URL (or env HATCAST_MIGRATE_DATABASE_URL / DATABASE_URL)
  --target=NAME         Environment label (default: staging). 'prod'/'production' is guarded.
  --yes                 Confirm a NON-prod write (staging)
  --confirm-prod=SLUG   Confirm a PROD write; SLUG must equal --target
  --expect-host=SUBSTR  Require the connection host OR database/branch name to contain
                        SUBSTR (URL↔target check). Use "auto" to derive from Neon host
                        (ep-<branch>-…). MANDATORY for any write (staging and prod).
  --dry-run             Print SQL + report, write nothing (DEFAULT)

Default is dry-run: nothing is written without --yes (staging) or --confirm-prod (prod).`)
}

export function isProdTarget(target, prodFlag) {
  return Boolean(prodFlag) || /^(prod|production)/i.test(target || '')
}

/**
 * Extract { host, database } from a Postgres connection URL (best effort).
 * @param {string|null|undefined} databaseUrl
 * @returns {{ host: string|null, database: string|null } | null}
 */
export function parseDbInfo(databaseUrl) {
  if (!databaseUrl) return null
  try {
    const u = new URL(databaseUrl)
    return {
      host: u.hostname || null,
      database: u.pathname ? u.pathname.replace(/^\//, '') || null : null,
    }
  } catch {
    return null
  }
}

/**
 * Resolve --expect-host for Neon URLs. When value is `auto`, derive a substring
 * marker from the endpoint hostname (`ep-<branch>-…`) so planLoad can match
 * against host/database without hard-coding `staging` vs branch-specific names.
 *
 * @param {string|null|undefined} expectHost
 * @param {string|null|undefined} databaseUrl
 * @returns {string}
 */
export function resolveExpectHost(expectHost, databaseUrl) {
  if (expectHost && expectHost !== 'auto') return expectHost
  const info = parseDbInfo(databaseUrl)
  if (!info?.host) {
    throw new Error(
      'Cannot derive --expect-host=auto: pass --expect-host=<marker> or a valid --database-url.',
    )
  }
  let host = info.host.replace(/-pooler\./i, '.')
  const match = host.match(/^ep-([^.]+)/i)
  if (match) {
    const branch = match[1].replace(/-\d+$/, '')
    if (branch) return branch
  }
  if (info.database) return info.database
  throw new Error(
    'Cannot derive --expect-host=auto from connection URL. Pass --expect-host=<marker> explicitly.',
  )
}

/**
 * Decide whether the load may write, after applying all guards (pure).
 *
 * @param {ReturnType<typeof parseArgs>} opts
 * @param {{ host: string|null }|null} dbInfo
 * @returns {{ prod: boolean, willWrite: boolean, errors: string[], notes: string[] }}
 */
export function planLoad(opts, dbInfo) {
  const prod = isProdTarget(opts.target, opts.prod)
  const errors = []
  const notes = []

  // Did the operator ask to write at all?
  const intendsWrite = prod ? opts.confirmProd != null : opts.yes === true
  if (!intendsWrite) {
    return { prod, willWrite: false, errors, notes }
  }

  // Prod typed confirmation must match the target label.
  if (prod && opts.confirmProd !== opts.target) {
    errors.push(
      `--confirm-prod="${opts.confirmProd}" does not match --target="${opts.target}".`,
    )
  }

  // Connection URL is required to write.
  if (!opts.databaseUrl) {
    errors.push(
      'No database URL. Pass --database-url=URL or set HATCAST_MIGRATE_DATABASE_URL / DATABASE_URL.',
    )
  }

  // ALL writes MUST assert the host explicitly (URL↔target safety): a prod URL
  // mislabelled --target=staging must not slip through with only --yes.
  if (!opts.expectHost) {
    errors.push(
      `${prod ? 'Production' : 'Staging'} write requires --expect-host=<marker> to assert the connection host (URL↔target check).`,
    )
  }

  // URL↔target cross-check (any target, when --expect-host is provided).
  // Neon often carries the environment name in the BRANCH/DATABASE rather than
  // the host, so match against host AND database name (the connection identity).
  if (opts.expectHost) {
    const identity = dbInfo ? [dbInfo.host, dbInfo.database].filter(Boolean).join('/') : ''
    if (!opts.databaseUrl) {
      // already flagged above
    } else if (!identity) {
      errors.push(
        `Could not parse host/database from --database-url to verify --expect-host="${opts.expectHost}".`,
      )
    } else if (!identity.toLowerCase().includes(opts.expectHost.toLowerCase())) {
      errors.push(
        `Connection "${identity}" does not contain --expect-host="${opts.expectHost}". ` +
          'Refusing to write (URL likely points at the wrong environment).',
      )
    } else {
      notes.push(`Host check OK: "${identity}" contains "${opts.expectHost}".`)
    }
  }

  return { prod, willWrite: errors.length === 0, errors, notes }
}

function main() {
  const opts = parseArgs()
  if (opts.sql.length === 0) {
    printHelp()
    process.exit(1)
  }

  const dbInfo = parseDbInfo(opts.databaseUrl)
  const plan = planLoad(opts, dbInfo)
  let combined
  try {
    combined = opts.sql.map((p) => `-- >>> ${p}\n${readFileSync(p, 'utf8')}`).join('\n')
  } catch (err) {
    console.error(`❌ Cannot read SQL file: ${err.message}`)
    process.exit(1)
  }

  // Pre-write recap (always printed to stderr).
  console.error(
    `Target=${opts.target}${plan.prod ? ' (PROD)' : ''} | ` +
      `host=${dbInfo?.host ?? '—'} db=${dbInfo?.database ?? '—'} | files=${opts.sql.length}`,
  )
  for (const note of plan.notes) console.error(`   • ${note}`)

  if (plan.errors.length > 0) {
    for (const err of plan.errors) console.error(`❌ ${err}`)
    process.exit(1)
  }

  if (!plan.willWrite) {
    console.error(
      `🧪 DRY-RUN — nothing will be written.\n` +
        `   Files: ${opts.sql.join(', ')}\n` +
        (plan.prod
          ? `   To apply: --confirm-prod=${opts.target} --expect-host=<marker> --database-url=<PROD_URL>\n`
          : `   To apply: --yes --expect-host=<marker> --database-url=<URL>\n`),
    )
    process.stdout.write(`${combined}\n`)
    return
  }

  console.error(
    `🚀 Applying ${opts.sql.length} file(s) to ${dbInfo?.host ?? 'target'} in a single transaction…`,
  )

  const psqlArgs = [opts.databaseUrl, '--single-transaction', '-v', 'ON_ERROR_STOP=1', '-f', '-']
  const res = spawnSync('psql', psqlArgs, {
    input: combined,
    stdio: ['pipe', 'inherit', 'inherit'],
    encoding: 'utf8',
  })

  if (res.error) {
    console.error(`❌ Failed to run psql: ${res.error.message}`)
    process.exit(1)
  }
  if (res.status !== 0) {
    console.error(`❌ psql exited with code ${res.status} — transaction rolled back.`)
    process.exit(res.status || 1)
  }
  console.error('✅ Load committed.')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
