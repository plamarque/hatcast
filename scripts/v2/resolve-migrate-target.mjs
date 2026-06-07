#!/usr/bin/env node
/**
 * Résolution des cibles migrate-from-v1 / migrate:v2:run (local, development, staging, production).
 * Source unique pour le shell (format=shell) et migrate-lib/config.mjs.
 */

import { fileURLToPath } from 'url'

import { normalizePostgresUrl } from '../migrate-malice-load.mjs'

export const MIGRATE_TARGETS = ['local', 'development', 'staging', 'production']

/** @typedef {'local' | 'development' | 'staging' | 'production'} MigrateTarget */

/**
 * @param {string} raw
 * @returns {MigrateTarget}
 */
export function normalizeMigrateTarget(raw) {
  const t = String(raw || 'staging')
    .trim()
    .toLowerCase()
  if (!MIGRATE_TARGETS.includes(t)) {
    throw new Error(
      `Unknown migrate target « ${raw} ». Valid: ${MIGRATE_TARGETS.join(', ')}`,
    )
  }
  return /** @type {MigrateTarget} */ (t)
}

/**
 * @param {Record<string, string | undefined>} env
 * @param {string[]} keys
 */
function firstEnv(env, keys) {
  for (const key of keys) {
    const v = env[key]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/**
 * @param {MigrateTarget} target
 * @param {Record<string, string | undefined>} [env]
 */
export function resolveMigrateTarget(target, env = process.env) {
  const t = normalizeMigrateTarget(target)

  const databaseUrlKeys = {
    local: ['NEON_LOCAL_URL', 'HATCAST_DATASOURCE_URL', 'HATCAST_MIGRATE_DATABASE_URL'],
    development: ['NEON_DEVELOPMENT_URL', 'HATCAST_MIGRATE_DATABASE_URL'],
    staging: ['NEON_STAGING_URL', 'HATCAST_MIGRATE_DATABASE_URL'],
    production: ['NEON_PRODUCTION_URL', 'NEON_PROD_URL', 'HATCAST_MIGRATE_DATABASE_URL'],
  }

  const apiBaseKeys = {
    local: ['HATCAST_MIGRATE_API_BASE_LOCAL', 'HATCAST_MIGRATE_API_BASE'],
    development: [
      'HATCAST_MIGRATE_API_BASE_DEVELOPMENT',
      'HATCAST_MIGRATE_API_BASE',
    ],
    staging: ['HATCAST_MIGRATE_API_BASE_STAGING', 'HATCAST_MIGRATE_API_BASE'],
    production: [
      'HATCAST_MIGRATE_API_BASE_PRODUCTION',
      'HATCAST_MIGRATE_API_BASE',
    ],
  }

  const defaultApiBase = {
    local: 'http://127.0.0.1:8080',
    development: '',
    staging: '',
    production: '',
  }

  const databaseUrl = normalizePostgresUrl(firstEnv(env, databaseUrlKeys[t]))
  const apiBaseUrl = firstEnv(env, apiBaseKeys[t]) || defaultApiBase[t]

  const cloudRunServices = {
    development:
      env.HATCAST_MIGRATE_CLOUD_RUN_SERVICE_DEVELOPMENT || 'hatcast-v2-dev',
    staging: env.HATCAST_MIGRATE_CLOUD_RUN_SERVICE_STAGING || 'hatcast-v2-staging',
    production:
      env.HATCAST_MIGRATE_CLOUD_RUN_SERVICE_PRODUCTION || 'hatcast-v2',
  }

  const deployBranches = {
    development: env.HATCAST_V2_BRANCH_DEV || 'v2',
    staging: env.HATCAST_V2_BRANCH_STAGING || 'staging-v2',
    production: env.HATCAST_V2_PRODUCTION_RELEASE_REF || 'tag:vX.Y.Z',
  }

  /** Label passé à migrate:malice:load (--target) */
  const loadTarget = t === 'production' ? 'prod' : t

  return {
    target: t,
    loadTarget,
    neonBranchLabel: t,
    databaseUrl,
    databaseUrlEnvKeys: databaseUrlKeys[t],
    apiBaseUrl,
    apiBaseEnvKeys: apiBaseKeys[t],
    cloudRunService: cloudRunServices[t] ?? '',
    deployGitBranch: deployBranches[t] ?? '',
    gcpRegion: firstEnv(env, ['HATCAST_MIGRATE_GCP_REGION', 'GCP_REGION']) || 'europe-west9',
    /** none | prompt-local | gcloud | github */
    restartMode:
      t === 'local'
        ? 'prompt-local'
        : t === 'production'
          ? 'none'
          : 'gcloud',
    requiresProdConfirm: t === 'production',
    prodConfirmSlug: 'production',
    /** Active HATCAST_MIGRATION_API_* sur Cloud Run via gcloud (migrate-from-v1.sh). */
    autoEnableMigrationApi: t === 'development',
  }
}

/**
 * @param {MigrateTarget} target
 * @param {ReturnType<typeof resolveMigrateTarget>} resolved
 */
export function validateResolvedTarget(resolved) {
  const missing = []
  if (!resolved.databaseUrl) {
    missing.push(
      `database URL (${resolved.databaseUrlEnvKeys.join(' or ')})`,
    )
  }
  if (!resolved.apiBaseUrl) {
    missing.push(`API base (${resolved.apiBaseEnvKeys.join(' or ')})`)
  }
  if (missing.length) {
    throw new Error(
      `Target « ${resolved.target} »: missing ${missing.join('; ')} in .env.local (see .env.example).`,
    )
  }
}

function parseCliArgs(argv) {
  let target = 'staging'
  let format = 'shell'
  for (const arg of argv) {
    if (arg.startsWith('--target=')) target = arg.slice(9)
    else if (arg.startsWith('--format=')) format = arg.slice(9)
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/v2/resolve-migrate-target.mjs --target=TARGET [--format=shell|json]

Targets: ${MIGRATE_TARGETS.join(', ')}

Env vars (see .env.example):
  local:        NEON_LOCAL_URL or HATCAST_DATASOURCE_URL ; HATCAST_MIGRATE_API_BASE_LOCAL (default http://127.0.0.1:8080)
  development:  NEON_DEVELOPMENT_URL ; HATCAST_MIGRATE_API_BASE_DEVELOPMENT
  staging:      NEON_STAGING_URL ; HATCAST_MIGRATE_API_BASE_STAGING
  production:   NEON_PRODUCTION_URL ; HATCAST_MIGRATE_API_BASE_PRODUCTION
`)
      process.exit(0)
    }
  }
  return { target, format }
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\"'\"'`)}'`
}

function printShell(resolved) {
  const lines = [
    `MIGRATE_TARGET=${shellQuote(resolved.target)}`,
    `MIGRATE_LOAD_TARGET=${shellQuote(resolved.loadTarget)}`,
    `MIGRATE_DATABASE_URL=${shellQuote(resolved.databaseUrl)}`,
    `MIGRATE_API_BASE=${shellQuote(resolved.apiBaseUrl)}`,
    `MIGRATE_NEON_BRANCH_LABEL=${shellQuote(resolved.neonBranchLabel)}`,
    `MIGRATE_CLOUD_RUN_SERVICE=${shellQuote(resolved.cloudRunService)}`,
    `MIGRATE_DEPLOY_GIT_BRANCH=${shellQuote(resolved.deployGitBranch)}`,
    `MIGRATE_GCP_REGION=${shellQuote(resolved.gcpRegion)}`,
    `MIGRATE_RESTART_MODE=${shellQuote(resolved.restartMode)}`,
    `MIGRATE_REQUIRES_PROD_CONFIRM=${resolved.requiresProdConfirm ? '1' : '0'}`,
    `MIGRATE_AUTO_ENABLE_MIGRATION_API=${resolved.autoEnableMigrationApi ? '1' : '0'}`,
  ]
  console.log(lines.join('\n'))
}

function main() {
  const { target, format } = parseCliArgs(process.argv.slice(2))
  const resolved = resolveMigrateTarget(target)
  if (format === 'json') {
    console.log(JSON.stringify(resolved, null, 2))
    return
  }
  if (format === 'shell') {
    printShell(resolved)
    return
  }
  throw new Error(`Unknown --format=${format}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
