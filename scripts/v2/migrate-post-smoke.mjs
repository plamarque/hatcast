#!/usr/bin/env node
/**
 * Post-migration smoke (Palier 1) — La Malice consultation-path checks after migrate:v2:run.
 *
 * Combines SQL integrity (MIG-S01–S04, S08) with API read paths (MIG-S05–S07).
 * Expected row counts come from the current artifact manifest (not stale constants).
 *
 * Usage:
 *   npm run migrate:malice:post-smoke
 *   npm run migrate:malice:post-smoke -- --state=export/malice-runs/<run-id>/state.json
 *   npm run migrate:malice:post-smoke -- --database-url=... --season-v2=... --artifact-dir=...
 *
 * Env: HATCAST_MIGRATION_API_KEY, HATCAST_MIGRATE_DATABASE_URL | NEON_* , HATCAST_MIGRATE_API_BASE_*
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import dotenv from 'dotenv'

import { createApiClient } from './migrate-lib/api-client.mjs'
import {
  assertEqual,
  assertMax,
  assertMin,
} from './migrate-lib/checks.mjs'
import { deriveExpectedCounts } from './migrate-lib/expected-counts.mjs'
import { withClient } from './migrate-lib/neon.mjs'
import { buildPostgresConnectionUrl } from '../migrate-malice-load.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const DEFAULT_GOLDEN = join(__dirname, 'fixtures', 'malice-migration-golden.json')

dotenv.config({ path: join(REPO_ROOT, '.env.local') })
dotenv.config({ path: join(REPO_ROOT, '.env') })

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function parseArgs(argv) {
  /** @type {{
   *   statePath?: string
   *   artifactDir?: string
   *   seasonV2?: string
   *   troupeId?: string
   *   databaseUrl?: string
   *   apiBaseUrl?: string
   *   migrationApiKey?: string
   *   goldenPath: string
   *   skipApi: boolean
   *   exportDir: string
   * }} */
  const out = {
    goldenPath: DEFAULT_GOLDEN,
    skipApi: false,
    exportDir: './export/malice-runs',
  }

  for (const arg of argv) {
    if (arg.startsWith('--state=')) out.statePath = arg.slice('--state='.length)
    else if (arg.startsWith('--artifact-dir=')) out.artifactDir = arg.slice('--artifact-dir='.length)
    else if (arg.startsWith('--season-v2=')) out.seasonV2 = arg.slice('--season-v2='.length)
    else if (arg.startsWith('--troupe-id=')) out.troupeId = arg.slice('--troupe-id='.length)
    else if (arg.startsWith('--database-url=')) out.databaseUrl = arg.slice('--database-url='.length)
    else if (arg.startsWith('--api-base-url=')) out.apiBaseUrl = arg.slice('--api-base-url='.length)
    else if (arg.startsWith('--migration-api-key=')) {
      out.migrationApiKey = arg.slice('--migration-api-key='.length)
    } else if (arg.startsWith('--golden=')) out.goldenPath = arg.slice('--golden='.length)
    else if (arg.startsWith('--export-dir=')) out.exportDir = arg.slice('--export-dir='.length)
    else if (arg === '--skip-api') out.skipApi = true
  }

  const rawDatabaseUrl =
    out.databaseUrl ??
    process.env.HATCAST_MIGRATE_DATABASE_URL?.trim() ??
    process.env.NEON_STAGING_URL?.trim() ??
    process.env.NEON_LOCAL_URL?.trim() ??
    process.env.HATCAST_DATASOURCE_URL?.trim()

  out.databaseUrl = rawDatabaseUrl
    ? buildPostgresConnectionUrl(rawDatabaseUrl, {
        username: process.env.HATCAST_DATASOURCE_USERNAME,
        password: process.env.HATCAST_DATASOURCE_PASSWORD ?? '',
      })
    : undefined

  out.apiBaseUrl =
    out.apiBaseUrl ??
    process.env.HATCAST_MIGRATE_API_BASE?.trim() ??
    process.env.HATCAST_MIGRATE_API_BASE_LOCAL?.trim() ??
    'http://127.0.0.1:8080'

  out.migrationApiKey =
    out.migrationApiKey ?? process.env.HATCAST_MIGRATION_API_KEY?.trim() ?? ''

  return out
}

function findLatestStatePath(exportDir) {
  const abs = resolve(process.cwd(), exportDir)
  if (!existsSync(abs)) return null

  const candidates = []
  for (const name of readdirSync(abs)) {
    const statePath = join(abs, name, 'state.json')
    try {
      const st = statSync(statePath)
      if (!st.isFile()) continue
      const state = readJson(statePath)
      if (state.stepsCompleted?.includes('smoke') && state.seasonV2 && state.artifactDir) {
        candidates.push({ statePath, mtime: st.mtimeMs })
      }
    } catch {
      /* skip */
    }
  }
  candidates.sort((a, b) => b.mtime - a.mtime)
  return candidates[0]?.statePath ?? null
}

function loadRunContext(opts) {
  const statePath =
    opts.statePath ??
    findLatestStatePath(opts.exportDir) ??
    null

  if (!statePath || !existsSync(statePath)) {
    throw new Error(
      'No migration state found. Pass --state=export/malice-runs/<run>/state.json or run migrate-from-v1 first.',
    )
  }

  const state = readJson(statePath)
  const artifactDir = opts.artifactDir ?? state.artifactDir
  const seasonV2 = opts.seasonV2 ?? state.seasonV2
  const troupeId = opts.troupeId ?? state.troupeId

  if (!artifactDir || !existsSync(artifactDir)) {
    throw new Error(`artifactDir missing or not found: ${artifactDir}`)
  }
  if (!seasonV2) throw new Error('seasonV2 missing in state — run full pipeline through smoke')
  if (!troupeId) throw new Error('troupeId missing in state — run bootstrap step')

  return { statePath, state, artifactDir, seasonV2, troupeId }
}

async function dbSnapshot(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid) AS events,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE) AS events_non_archived,
         (SELECT event_count::int FROM seasons WHERE id = $1::uuid) AS season_event_count,
         (SELECT COUNT(*)::int FROM season_participants WHERE season_id = $1::uuid AND status = 'ACTIVE') AS participants,
         (SELECT COUNT(*)::int FROM event_availability ea JOIN events e ON e.id = ea.event_id WHERE e.season_id = $1::uuid) AS availability,
         (SELECT COUNT(*)::int FROM event_compositions ec JOIN events e ON e.id = ec.event_id WHERE e.season_id = $1::uuid) AS compositions,
         (SELECT COUNT(*)::int FROM events WHERE season_id = $1::uuid AND archived = FALSE AND (
           category = 'deplacements' OR (category IS NULL AND template_type = 'deplacement')
         )) AS deplacements,
         (SELECT COUNT(*)::int FROM event_compositions ec
          JOIN events e ON e.id = ec.event_id
          WHERE e.season_id = $1::uuid
            AND NOT EXISTS (
              SELECT 1 FROM event_composition_slots s WHERE s.event_id = ec.event_id
            )) AS compositions_without_slots`,
      [seasonId],
    )
    return res.rows[0]
  })
}

async function resolveAnchorEvents(databaseUrl, seasonId) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT id, slug, title, archived, category, template_type,
              EXISTS (
                SELECT 1 FROM event_compositions ec
                WHERE ec.event_id = events.id AND ec.validated_at IS NOT NULL
              ) AS has_validated_composition
       FROM events
       WHERE season_id = $1::uuid
       ORDER BY starts_at`,
      [seasonId],
    )
    return res.rows
  })
}

async function resolveUserSlug(databaseUrl, seasonId, normalizedEmail) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT u.slug
       FROM users u
       JOIN season_participants sp ON sp.user_id = u.id
       WHERE sp.season_id = $1::uuid
         AND lower(trim(sp.normalized_email)) = lower(trim($2))
       LIMIT 1`,
      [seasonId, normalizedEmail],
    )
    return res.rows[0]?.slug ?? null
  })
}

async function compositionSlotAssigned(databaseUrl, seasonId, eventSlug, roleKey, slotIndex) {
  return withClient(databaseUrl, async (client) => {
    const res = await client.query(
      `SELECT s.season_participant_id IS NOT NULL AS assigned
       FROM event_composition_slots s
       JOIN events e ON e.id = s.event_id
       WHERE e.season_id = $1::uuid
         AND e.slug = $2
         AND s.role_key = $3
         AND s.slot_index = $4
       LIMIT 1`,
      [seasonId, eventSlug, roleKey, slotIndex],
    )
    if (res.rowCount === 0) return null
    return res.rows[0].assigned
  })
}

function pickAnchors(events) {
  const deplacement = events.find(
    (e) =>
      !e.archived &&
      (e.category === 'deplacements' || e.template_type === 'deplacement'),
  )
  const archived = events.find((e) => e.archived)
  const validatedComposition = events.find((e) => e.has_validated_composition)
  return { deplacement, archived, validatedComposition }
}

/**
 * @param {ReturnType<typeof deriveExpectedCounts>} expected
 * @param {object} db
 * @param {object} golden
 */
export function evaluatePostSmokeDb(expected, db, golden) {
  assertEqual('MIG-S01 events', Number(db.events), expected.events)
  assertEqual('MIG-S01 availability', Number(db.availability), expected.availability)
  assertEqual('MIG-S01 compositions', Number(db.compositions), expected.compositions)
  assertMin('MIG-S01 participants', Number(db.participants), expected.players)
  assertMax('MIG-S01 rejects mig2', expected.rejectsMig2, golden.rejects.mig2Max)
  assertMax('MIG-S01 rejects mig3', expected.rejectsMig3, golden.rejects.mig3Max)

  assertEqual('MIG-S02 deplacements', Number(db.deplacements), expected.deplacements)
  assertEqual(
    'MIG-S03 season.event_count vs non-archived',
    Number(db.season_event_count),
    Number(db.events_non_archived),
  )
  assertEqual('MIG-S04 compositions without slot rows', Number(db.compositions_without_slots), 0)
}

/**
 * @param {object} golden
 * @param {{ availabilities: number, selections: number, declines: number }} stats
 */
export function evaluateMemberStats(golden, stats) {
  const { expected, tolerance = 0 } = golden.memberStats
  for (const key of ['availabilities', 'selections', 'declines']) {
    const actual = stats[key]
    const target = expected[key]
    if (actual < target - tolerance || actual > target + tolerance) {
      throw new Error(
        `MIG-S07 memberStats.${key}: expected ${target} ± ${tolerance}, got ${actual}`,
      )
    }
  }
}

async function runApiChecks({ api, seasonV2, troupeId, dbTotalEvents, golden, userSlug, anchors }) {
  let totalElements = 0
  let page = 0
  let totalPages = 1
  const eventsBySlug = new Map()

  while (page < totalPages) {
    const paged = await api.listSeasonEvents(seasonV2, page, 100)
    totalPages = paged.totalPages ?? 1
    totalElements = paged.totalElements ?? totalElements
    for (const ev of paged.content ?? []) {
      eventsBySlug.set(ev.slug, ev)
    }
    page++
  }

  assertEqual('MIG-S05 api.events.totalElements', totalElements, Number(dbTotalEvents))

  const anchorSlugs = [
    anchors.deplacement?.slug,
    anchors.archived?.slug,
    anchors.validatedComposition?.slug,
    golden.anchors.matchCambo.slug,
  ].filter(Boolean)

  for (const slug of anchorSlugs) {
    const ev = eventsBySlug.get(slug)
    if (!ev) throw new Error(`MIG-S06 anchor event missing in API list: ${slug}`)
    const detail = await api.get(`/v1/seasons/${seasonV2}/events/${ev.id}`)
    if (!detail?.id || !detail?.title) {
      throw new Error(`MIG-S06 event detail incomplete for ${slug}`)
    }
    const needsComposition =
      slug === golden.anchors.matchCambo.slug ||
      slug === anchors.validatedComposition?.slug
    if (needsComposition) {
      const composition = await api.get(`/v1/seasons/${seasonV2}/events/${ev.id}/composition`)
      if (!composition?.slots) {
        throw new Error(`MIG-S06 composition missing slots for ${slug}`)
      }
    }
  }

  if (userSlug) {
    const glance = await api.get(
      `/v1/members/${userSlug}/season-glance?seasonId=${seasonV2}&troupeId=${troupeId}`,
    )
    const stats = glance?.stats
    if (!stats?.availabilities || !stats?.selections || !stats?.declines) {
      throw new Error('MIG-S07 season-glance stats shape missing')
    }
    evaluateMemberStats(golden, {
      availabilities: stats.availabilities.count ?? 0,
      selections: stats.selections.count ?? 0,
      declines: stats.declines.count ?? 0,
    })
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (!opts.databaseUrl) {
    console.error('Missing database URL (HATCAST_MIGRATE_DATABASE_URL, --database-url=, or Neon env)')
    process.exit(1)
  }

  const golden = readJson(opts.goldenPath)
  const ctx = loadRunContext(opts)
  const expected = deriveExpectedCounts(ctx.artifactDir, { requireAc: true })

  console.log(`Post-smoke — season=${ctx.seasonV2}`)
  console.log(`  state: ${ctx.statePath}`)
  console.log(`  artifacts: ${ctx.artifactDir}`)
  console.log(
    `  expected: events=${expected.events} availability=${expected.availability} ` +
      `compositions=${expected.compositions} deplacements=${expected.deplacements}`,
  )

  const db = await dbSnapshot(opts.databaseUrl, ctx.seasonV2)
  console.log(
    `  db: events=${db.events} non_archived=${db.events_non_archived} ` +
      `availability=${db.availability} compositions=${db.compositions} deplacements=${db.deplacements}`,
  )

  evaluatePostSmokeDb(expected, db, golden)

  const anchorEvents = await resolveAnchorEvents(opts.databaseUrl, ctx.seasonV2)
  const anchors = pickAnchors(anchorEvents)
  if (!anchors.deplacement) throw new Error('MIG-S06: no deplacement anchor event in DB')
  if (!anchors.archived) throw new Error('MIG-S06: no archived anchor event in DB')
  if (!anchors.validatedComposition) {
    throw new Error('MIG-S06: no validated composition anchor event in DB')
  }
  console.log(
    `  anchors: deplacement=${anchors.deplacement.slug} archived=${anchors.archived.slug} ` +
      `validated=${anchors.validatedComposition.slug}`,
  )

  const matchCambo = golden.anchors.matchCambo
  const djAssigned = await compositionSlotAssigned(
    opts.databaseUrl,
    ctx.seasonV2,
    matchCambo.slug,
    matchCambo.emptySlot.roleKey,
    matchCambo.emptySlot.slotIndex,
  )
  if (djAssigned === null) {
    throw new Error(`MIG-S08: slot row missing for ${matchCambo.slug} ${matchCambo.emptySlot.roleKey}`)
  }
  if (djAssigned !== false) {
    throw new Error(
      `MIG-S08: expected empty ${matchCambo.emptySlot.roleKey} slot on ${matchCambo.slug} (known reject)`,
    )
  }
  console.log(`  MIG-S08: ${matchCambo.slug} ${matchCambo.emptySlot.roleKey} slot empty (expected)`)

  if (!opts.skipApi) {
    if (!opts.migrationApiKey) {
      throw new Error('HATCAST_MIGRATION_API_KEY required for API checks (or pass --skip-api)')
    }
    const api = createApiClient({
      apiBaseUrl: opts.apiBaseUrl,
      migrationApiKey: opts.migrationApiKey,
    })
    await api.preflight()

    const userSlug = await resolveUserSlug(
      opts.databaseUrl,
      ctx.seasonV2,
      golden.memberStats.normalizedEmail,
    )
    if (!userSlug) {
      throw new Error(`MIG-S07: user slug not found for ${golden.memberStats.normalizedEmail}`)
    }

    await runApiChecks({
      api,
      seasonV2: ctx.seasonV2,
      troupeId: ctx.troupeId,
      dbTotalEvents: db.events,
      golden,
      userSlug,
      anchors,
    })
    console.log('  API checks: OK')
  } else {
    console.log('  API checks: skipped (--skip-api)')
  }

  console.log('✅ migrate post-smoke: PASSED')
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href

if (isMain) {
  main().catch((err) => {
    console.error(`❌ ${err.message || err}`)
    process.exit(1)
  })
}
