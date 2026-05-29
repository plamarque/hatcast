/**
 * Config merge: JSON file + env interpolation + CLI overrides.
 */

import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const STEP_ORDER = [
  'preflight',
  'bootstrap',
  'b1',
  'b2',
  'roster',
  'b4',
  'b5',
  'smoke',
  'report',
]

function interpolateEnv(value) {
  if (typeof value !== 'string') return value
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? '')
}

function loadJson(path) {
  const raw = readFileSync(path, 'utf8')
  const parsed = JSON.parse(raw)
  return JSON.parse(JSON.stringify(parsed), (_, v) => interpolateEnv(v))
}

function parseArgValue(argv, prefix) {
  const hit = argv.find((a) => a.startsWith(prefix))
  return hit ? hit.slice(prefix.length) : null
}

export function parseConfig(argv = process.argv.slice(2)) {
  const configPath = parseArgValue(argv, '--config=') ?? 'export/malice/migrate.config.json'
  const absConfig = resolve(process.cwd(), configPath)
  const base = existsSync(absConfig) ? loadJson(absConfig) : {}

  const fromStep = parseArgValue(argv, '--from-step=') ?? 'preflight'
  if (!STEP_ORDER.includes(fromStep)) {
    throw new Error(`Unknown --from-step=${fromStep}. Valid: ${STEP_ORDER.join(', ')}`)
  }

  const runId =
    parseArgValue(argv, '--run-id=') ??
    new Date().toISOString().replace(/[:.]/g, '-')

  const exportDir = parseArgValue(argv, '--export-dir=') ?? base.exportDir ?? './export/malice-runs'
  const runDir = resolve(process.cwd(), exportDir, runId)

  return {
    target: parseArgValue(argv, '--target=') ?? base.target ?? 'staging',
    apiBaseUrl: parseArgValue(argv, '--api-base-url=') ?? base.apiBaseUrl ?? process.env.HATCAST_MIGRATE_API_BASE ?? '',
    migrationApiKey:
      parseArgValue(argv, '--migration-api-key=') ??
      base.migrationApiKey ??
      process.env.HATCAST_MIGRATION_API_KEY ??
      '',
    v1SeasonId: parseArgValue(argv, '--v1-season=') ?? base.v1SeasonId ?? '',
    v1Database: parseArgValue(argv, '--v1-database=') ?? base.v1Database ?? '(default)',
    troupeName: parseArgValue(argv, '--troupe-name=') ?? base.troupeName ?? '',
    seasonTitle: parseArgValue(argv, '--season-title=') ?? base.seasonTitle ?? '',
    seasonStartDate: base.seasonStartDate ?? null,
    seasonEndDate: base.seasonEndDate ?? null,
    troupeId: parseArgValue(argv, '--troupe-id=') ?? base.troupeId ?? null,
    seasonV2: parseArgValue(argv, '--season-v2=') ?? base.seasonV2 ?? null,
    databaseUrl:
      parseArgValue(argv, '--database-url=') ??
      base.databaseUrl ??
      process.env.NEON_STAGING_URL ??
      process.env.HATCAST_MIGRATE_DATABASE_URL ??
      '',
    expectHost: parseArgValue(argv, '--expect-host=') ?? base.expectHost ?? 'auto',
    exportDir,
    runDir,
    runId,
    runLogPath: `${runDir}/run.log`,
    statePath: `${runDir}/state.json`,
    artifactDir:
      parseArgValue(argv, '--reuse-artifact=') ??
      base.reuseArtifact ??
      null,
    fromStep,
    dryRun: argv.includes('--dry-run') || !argv.includes('--yes'),
    yes: argv.includes('--yes'),
    skipBootstrap: argv.includes('--skip-bootstrap'),
    recordCycle: argv.includes('--record-cycle'),
    iResetNeon: argv.includes('--i-reset-neon'),
    allowImportErrors: Number(parseArgValue(argv, '--allow-import-errors=') ?? base.allowImportErrors ?? 0),
    confirmProd: parseArgValue(argv, '--confirm-prod='),
    thresholds: {
      events: base.thresholds?.events ?? 55,
      availability: base.thresholds?.availability ?? 1226,
      availabilityTolerance: base.thresholds?.availabilityTolerance ?? 2,
      compositions: base.thresholds?.compositions ?? 32,
      rejectsMig2: base.thresholds?.rejectsMig2 ?? 0,
      rejectsMig3: base.thresholds?.rejectsMig3 ?? 2,
      seedUsers: base.thresholds?.seedUsers ?? 0,
    },
    replayLogPath: base.replayLogPath ?? 'export/malice/replay-log.jsonl',
    stepOrder: STEP_ORDER,
  }
}

export function shouldRunStep(config, step) {
  return config.stepOrder.indexOf(step) >= config.stepOrder.indexOf(config.fromStep)
}

export function validateConfig(config) {
  const errors = []
  const nodeMajor = Number(process.versions.node.split('.')[0])
  if (nodeMajor < 20) errors.push('Node.js >= 20 is required')
  if (!config.v1SeasonId) errors.push('v1SeasonId is required')
  if (!config.apiBaseUrl) errors.push('apiBaseUrl is required')
  if (!config.migrationApiKey) errors.push('migrationApiKey is required (env HATCAST_MIGRATION_API_KEY)')
  if (!config.databaseUrl && !config.dryRun) errors.push('databaseUrl is required for Neon writes')
  if (config.target === 'prod' && config.yes && !config.confirmProd) {
    errors.push('--confirm-prod=<slug> required for prod target with --yes')
  }
  if (errors.length) {
    throw new Error(`Invalid config:\n- ${errors.join('\n- ')}`)
  }
}
