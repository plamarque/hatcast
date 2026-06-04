/**
 * End-to-end migration pipeline steps (Procedure B orchestrated).
 */

import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, appendFileSync, existsSync } from 'fs'
import { join } from 'path'

import { createApiClient, isLocalApiBase } from './api-client.mjs'
import {
  assertEqual,
  assertMax,
  assertMin,
  assertParticipantsShape,
  summarizeImport,
} from './checks.mjs'
import { exportParticipantsJson, smokeCounts } from './neon.mjs'
import { runNpmScript } from './spawn.mjs'
import { shouldRunStep, validateConfig } from './config.mjs'
import { deriveExpectedCounts } from './expected-counts.mjs'

function saveState(config, state) {
  mkdirSync(config.runDir, { recursive: true })
  writeFileSync(config.statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

function loadState(config) {
  try {
    return JSON.parse(readFileSync(config.statePath, 'utf8'))
  } catch {
    return {}
  }
}

function findLatestArtifactDir(parentDir) {
  const entries = readdirSync(parentDir)
    .map((name) => join(parentDir, name))
    .filter((p) => {
      try {
        return statSync(p).isDirectory()
      } catch {
        return false
      }
    })
    .sort()
  for (let i = entries.length - 1; i >= 0; i--) {
    const raw = join(entries[i], 'raw.json')
    try {
      readFileSync(raw)
      return entries[i]
    } catch {
      /* continue */
    }
  }
  return null
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function loadArgs(config, sqlFiles, { dryRun = false } = {}) {
  const args = sqlFiles.flatMap((f) => [`--sql=${f}`])
  if (dryRun || config.dryRun) return args
  args.push(`--database-url=${config.databaseUrl}`)
  args.push(`--target=${config.target}`)
  args.push(`--expect-host=${config.expectHost}`)
  if (config.target === 'prod' || /^prod/i.test(config.target)) {
    args.push(`--confirm-prod=${config.confirmProd ?? config.target}`)
  } else {
    args.push('--yes')
  }
  return args
}

export async function runPipeline(config, logger) {
  if (!config.iResetNeon && config.fromStep === 'preflight') {
    logger.warn(
      'preflight',
      'After Neon reset (proc. C), re-run with --i-reset-neon to acknowledge empty branch.',
    )
  }

  /** @type {{ troupeId?: string, seasonV2?: string, artifactDir?: string, membersImported?: number, usersImported?: number, stepsCompleted?: string[] }} */
  let state = {
    ...loadState(config),
    troupeId: config.troupeId ?? loadState(config).troupeId,
    seasonV2: config.seasonV2 ?? loadState(config).seasonV2,
    artifactDir: config.artifactDir ?? loadState(config).artifactDir,
    stepsCompleted: loadState(config).stepsCompleted ?? [],
  }

  const api = createApiClient(config)
  const usersCsv = join(config.runDir, 'users.csv')
  const membersCsv = join(config.runDir, 'members.csv')
  const artifactsParent = join(config.runDir, 'artifacts')

  if (shouldRunStep(config, 'preflight')) {
    await logger.runStep('preflight', async () => {
      validateConfig(config)
      await api.preflight()
      if (config.databaseUrl && !config.dryRun) {
        const seedUsers = await import('./neon.mjs').then((m) =>
          m.queryScalar(config.databaseUrl, "SELECT COUNT(*)::int FROM users WHERE email LIKE '%@seed.improbots.test'"),
        )
        const seedCount = Number(seedUsers)
        if (isLocalApiBase(config.apiBaseUrl)) {
          if (seedCount > 0) {
            logger.info(
              'preflight',
              `Local API: ${seedCount} seed user(s) on DB (Les Improbots) — OK, not a staging-empty check`,
            )
          }
        } else {
          assertEqual('seed_users', seedCount, config.thresholds.seedUsers)
        }
      }
      state.stepsCompleted.push('preflight')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'bootstrap') && !config.skipBootstrap) {
    await logger.runStep('bootstrap', async () => {
      if (!state.troupeId) {
        const troupe = await api.createTroupe(config.troupeName || 'Migration Troupe')
        state.troupeId = troupe.id
        logger.info('bootstrap', `Created troupe ${state.troupeId}`)
      }
      if (!state.seasonV2) {
        /** @type {{ title: string, description?: string, startDate?: string, endDate?: string }} */
        const body = { title: config.seasonTitle || 'Migration Season' }
        if (config.seasonStartDate) body.startDate = config.seasonStartDate
        if (config.seasonEndDate) body.endDate = config.seasonEndDate
        const season = await api.createSeason(state.troupeId, body)
        state.seasonV2 = season.id
        await api.activateSeason(state.seasonV2)
        logger.info('bootstrap', `Created + activated season ${state.seasonV2}`)
      }
      state.stepsCompleted.push('bootstrap')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'b1')) {
    await logger.runStep('b1', async () => {
      mkdirSync(config.runDir, { recursive: true })
      runNpmScript('export:v1-users:prod', [
        `--season=${config.v1SeasonId}`,
        `--output=${usersCsv}`,
      ])
      runNpmScript('export:v1-members:prod', [
        `--season=${config.v1SeasonId}`,
        `--output=${membersCsv}`,
      ])
      state.stepsCompleted.push('b1')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'b2')) {
    await logger.runStep('b2', async () => {
      if (!state.troupeId) throw new Error('troupeId missing — run bootstrap first')
      const usersResult = await api.importUsers(state.troupeId, usersCsv)
      const membersResult = await api.importMembers(state.troupeId, membersCsv)
      const u = summarizeImport(usersResult)
      const m = summarizeImport(membersResult)
      state.usersImported = u.success
      state.membersImported = m.success
      if (u.error > config.allowImportErrors || m.error > config.allowImportErrors) {
        throw new Error(`Import errors users=${u.error} members=${m.error}`)
      }
      logger.info('b2', `users=${u.success} members=${m.success}`)
      state.stepsCompleted.push('b2')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'roster')) {
    await logger.runStep('roster', async () => {
      if (!state.seasonV2) throw new Error('seasonV2 missing')
      await api.listSeasonParticipants(state.seasonV2)
      if (!state.artifactDir) {
        mkdirSync(artifactsParent, { recursive: true })
      }
      const artifactDir = state.artifactDir ?? artifactsParent
      if (!state.artifactDir) {
        // participants export needs artifact dir — create placeholder if extract not run
        mkdirSync(artifactDir, { recursive: true })
      }
      const targetDir = state.artifactDir ?? join(artifactsParent, 'participants-only')
      mkdirSync(targetDir, { recursive: true })
      const rows = await exportParticipantsJson(config.databaseUrl, state.seasonV2)
      assertParticipantsShape(rows)
      writeFileSync(join(targetDir, 'participants.json'), `${JSON.stringify(rows, null, 2)}\n`)
      assertMin(
        'participants',
        rows.length,
        (state.membersImported ?? 1) - 1,
        2,
      )
      if (!state.artifactDir) {
        state.participantsOnlyDir = targetDir
      } else {
        writeFileSync(join(state.artifactDir, 'participants.json'), `${JSON.stringify(rows, null, 2)}\n`)
      }
      state.stepsCompleted.push('roster')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'b4')) {
    await logger.runStep('b4', async () => {
      mkdirSync(artifactsParent, { recursive: true })
      if (!state.artifactDir || !existsSync(join(state.artifactDir, 'raw.json'))) {
        runNpmScript('migrate:malice:extract', [
          `--season=${config.v1SeasonId}`,
          `--database=${config.v1Database}`,
          `--out-dir=${artifactsParent}`,
        ])
        state.artifactDir = findLatestArtifactDir(artifactsParent)
      }
      if (!state.artifactDir) throw new Error('artifactDir not found after extract')
      const raw = join(state.artifactDir, 'raw.json')
      const participantsPath =
        join(state.artifactDir, 'participants.json')
      if (!existsSync(participantsPath)) {
        const rows = await exportParticipantsJson(config.databaseUrl, state.seasonV2)
        writeFileSync(participantsPath, `${JSON.stringify(rows, null, 2)}\n`)
      }
      runNpmScript('migrate:malice:transform', [
        `--raw=${raw}`,
        `--season-v2=${state.seasonV2}`,
        `--participants=${participantsPath}`,
      ])
      const expected = deriveExpectedCounts(state.artifactDir)
      assertMax('rejects.mig2', expected.rejectsMig2, config.thresholds.rejectsMig2)
      runNpmScript('migrate:malice:load', loadArgs(config, [join(state.artifactDir, 'load.sql')], { dryRun: true }))
      if (config.yes && !config.dryRun) {
        runNpmScript('migrate:malice:load', loadArgs(config, [join(state.artifactDir, 'load.sql')]))
      }
      if (config.databaseUrl && state.seasonV2 && !config.dryRun) {
        const { reconcileSeasonEventCount } = await import('./neon.mjs')
        await reconcileSeasonEventCount(config.databaseUrl, state.seasonV2)
        logger.info('b4', 'Reconciled seasons.event_count after event load')
      }
      state.stepsCompleted.push('b4')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'b5')) {
    await logger.runStep('b5', async () => {
      if (!state.artifactDir) throw new Error('artifactDir missing — run b4 first')
      const raw = join(state.artifactDir, 'raw.json')
      const manifest = join(state.artifactDir, 'manifest.json')
      runNpmScript('migrate:malice:transform:ac', [`--raw=${raw}`, `--manifest=${manifest}`])
      const expected = deriveExpectedCounts(state.artifactDir, { requireAc: true })
      assertMax('rejects.mig3', expected.rejectsMig3, config.thresholds.rejectsMig3)
      const loadSql = join(state.artifactDir, 'load.sql')
      const loadAc = join(state.artifactDir, 'load-ac.sql')
      const eventCount = config.databaseUrl
        ? Number(await import('./neon.mjs').then((m) =>
            m.queryScalar(config.databaseUrl, 'SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid', [
              state.seasonV2,
            ]),
          ))
        : 0
      const sqlFiles = eventCount >= expected.events ? [loadAc] : [loadSql, loadAc]
      runNpmScript('migrate:malice:load', loadArgs(config, sqlFiles, { dryRun: true }))
      if (config.yes && !config.dryRun) {
        runNpmScript('migrate:malice:load', loadArgs(config, sqlFiles))
      }
      if (config.databaseUrl && state.seasonV2 && !config.dryRun) {
        const { reconcileSeasonEventCount } = await import('./neon.mjs')
        await reconcileSeasonEventCount(config.databaseUrl, state.seasonV2)
        logger.info('b5', 'Reconciled seasons.event_count after availability/composition load')
      }
      state.expectedCounts = expected
      state.stepsCompleted.push('b5')
      saveState(config, state)
    })
  }

  if (shouldRunStep(config, 'smoke')) {
    if (config.dryRun) {
      logger.info('smoke', 'Skipped in dry-run (no Neon writes)')
    } else {
    await logger.runStep('smoke', async () => {
      if (!state.artifactDir) throw new Error('artifactDir missing — run b4 first')
      const expected =
        state.expectedCounts ?? deriveExpectedCounts(state.artifactDir, { requireAc: true })
      const { reconcileSeasonEventCount } = await import('./neon.mjs')
      await reconcileSeasonEventCount(config.databaseUrl, state.seasonV2)
      const counts = await smokeCounts(config.databaseUrl, state.seasonV2)
      logger.info(
        'smoke',
        `Expected from artifacts: events=${expected.events} availability=${expected.availability} compositions=${expected.compositions}`,
      )
      assertEqual('events', counts.events, expected.events)
      assertEqual('season_event_count', counts.season_event_count, counts.events_non_archived)
      assertEqual('availability', counts.availability, expected.availability)
      assertEqual('compositions', counts.compositions, expected.compositions)
      assertEqual('seed_users', counts.seed_users, config.thresholds.seedUsers)
      const eventsPage = await api.listSeasonEvents(state.seasonV2, 0, 100)
      assertMin('api.events', eventsPage.totalElements ?? eventsPage.content?.length ?? 0, expected.events)
      state.smoke = { ...counts, expected }
      state.stepsCompleted.push('smoke')
      saveState(config, state)
    })
    }
  }

  if (shouldRunStep(config, 'report')) {
    if (config.dryRun) {
      logger.info('report', 'Skipped in dry-run')
    } else {
    await logger.runStep('report', async () => {
      if (config.recordCycle && state.smoke) {
        const rejectsMig2 = state.artifactDir
          ? readJson(join(state.artifactDir, 'rejects.json')).count ?? 0
          : 0
        const rejectsMig3 = state.artifactDir
          ? readJson(join(state.artifactDir, 'rejects-ac.json')).count ?? 0
          : 0
        const line = {
          date: new Date().toISOString().slice(0, 10),
          seasonV1: config.v1SeasonId,
          seasonV2: state.seasonV2,
          artifactDir: state.artifactDir,
          counts: state.smoke,
          rejects: { mig2: rejectsMig2, mig3: rejectsMig3 },
          smoke: 'pass',
          notes: '',
        }
        appendFileSync(config.replayLogPath, `${JSON.stringify(line)}\n`)
        logger.info('report', `Appended replay log → ${config.replayLogPath}`)
      }
      logger.info('report', `Done. troupeId=${state.troupeId} seasonV2=${state.seasonV2} artifact=${state.artifactDir}`)
      state.stepsCompleted.push('report')
      saveState(config, state)
    })
    }
  }

  return state
}
