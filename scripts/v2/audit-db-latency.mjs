#!/usr/bin/env node
/**
 * PERF-16 — DB latency audit (RTT, pg_stat_statements, EXPLAIN hot paths).
 *
 * Usage:
 *   node scripts/v2/audit-db-latency.mjs rtt
 *   node scripts/v2/audit-db-latency.mjs pg-stat [--limit=20]
 *   node scripts/v2/audit-db-latency.mjs explain
 *   node scripts/v2/audit-db-latency.mjs report [--api-base=http://127.0.0.1:8080] [--session-cookie=...]
 *
 * Connection: HATCAST_DATASOURCE_* via resolveHatcastDatasourceUrl (see migrate-malice-load.mjs).
 * Output: .local/perf-profile/db-latency-*.json
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import pg from 'pg'

import {
  parseDbInfo,
  resolveHatcastDatasourceUrl,
  normalizePostgresUrl,
} from '../migrate-malice-load.mjs'

const { Pool } = pg

export const DEFAULT_OUT_DIR = path.join(process.cwd(), '.local', 'perf-profile')

export function parseCliArgs(argv = process.argv.slice(2)) {
  const result = {
    command: argv[0] && !argv[0].startsWith('--') ? argv[0] : 'report',
    databaseUrl: resolveHatcastDatasourceUrl(),
    source: process.env.HATCAST_DB_RTT_SOURCE ?? 'local',
    regionHint: process.env.HATCAST_CLOUD_RUN_REGION ?? null,
    limit: 20,
    apiBase: process.env.HATCAST_PERF_API_BASE ?? 'http://127.0.0.1:8080',
    sessionCookie: process.env.HATCAST_PERF_SESSION_COOKIE ?? '',
    outDir: DEFAULT_OUT_DIR,
    endpointFilter: null,
  }

  for (const arg of argv) {
    if (arg.startsWith('--database-url=')) {
      result.databaseUrl = normalizePostgresUrl(arg.slice(15).trim())
    } else if (arg.startsWith('--source=')) {
      result.source = arg.slice(9).trim()
    } else if (arg.startsWith('--region=')) {
      result.regionHint = arg.slice(9).trim()
    } else if (arg.startsWith('--limit=')) {
      result.limit = Number.parseInt(arg.slice(8), 10)
    } else if (arg.startsWith('--api-base=')) {
      result.apiBase = arg.slice(11).trim().replace(/\/$/, '')
    } else if (arg.startsWith('--session-cookie=')) {
      result.sessionCookie = arg.slice(17).trim()
    } else if (arg.startsWith('--out-dir=')) {
      result.outDir = arg.slice(10).trim()
    } else if (arg.startsWith('--endpoint=')) {
      result.endpointFilter = arg.slice(11).trim()
    } else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (!arg.startsWith('--') && !result.command) {
      result.command = arg
    }
  }

  if (argv[0] && !argv[0].startsWith('--')) {
    result.command = argv[0]
  }

  return result
}

function printHelp() {
  console.log(`Usage:
  node scripts/v2/audit-db-latency.mjs <command> [options]

Commands:
  rtt       Measure median/p95 RTT (10× SELECT 1) via pooled Neon URL
  pg-stat   Top queries from pg_stat_statements
  explain   Run EXPLAIN (ANALYZE, BUFFERS) from db-hot-path-queries.sql
  report    Merge RTT + pg_stat + optional API probe → JSON report

Options:
  --database-url=URL   Override Postgres URL (default: HATCAST_DATASOURCE_*)
  --source=local       RTT source label (local | cloud-shell | cloud-run-job)
  --region=REGION      Cloud Run region hint for report metadata
  --limit=N            pg-stat top N (default 20)
  --api-base=URL       API base for hot-path probe (default http://127.0.0.1:8080)
  --session-cookie=…   HATCAST_SESSION=… value for authenticated GET probes
  --endpoint=PATH      Filter report endpoints (e.g. /v1/me/agenda)
  --out-dir=PATH       Output directory (default .local/perf-profile)`)
}

export function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function percentile95(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil(sorted.length * 0.95) - 1
  return sorted[Math.max(0, index)]
}

export function estimateNetworkMs(jdbcTotalMs, serverExecMs) {
  return Math.max(0, Math.round(jdbcTotalMs - serverExecMs))
}

export function inferRegionHint(host) {
  if (!host) return null
  if (/neon\.tech/i.test(host)) return 'aws-eu-central-1'
  return null
}

export function buildReportFilename(now = new Date()) {
  return `db-latency-${now.toISOString().replace(/[:.]/g, '-')}.json`
}

/** Maps db-hot-path-queries.sql @name blocks to API endpoint path fragments. */
export const EXPLAIN_BLOCK_TO_ENDPOINT = {
  agenda_upcoming_events: '/v1/me/agenda',
  availability_summary: '/availability/summary',
  composition_slots: '/composition',
}

export function matchExplainBlockToEndpoint(blockName, endpoints) {
  const fragment = EXPLAIN_BLOCK_TO_ENDPOINT[blockName]
  if (!fragment || !Array.isArray(endpoints)) return null
  return endpoints.find((e) => e.endpoint?.includes(fragment)) ?? null
}

export async function measureRtt(databaseUrl, { iterations = 10 } = {}) {
  if (!databaseUrl) {
    throw new Error('Missing database URL — set HATCAST_DATASOURCE_URL in .env')
  }
  const pool = new Pool({ connectionString: databaseUrl })
  const samples = []
  try {
    for (let i = 0; i < iterations; i += 1) {
      const started = performance.now()
      await pool.query('SELECT 1')
      samples.push(performance.now() - started)
    }
  } finally {
    await pool.end()
  }
  const dbInfo = parseDbInfo(databaseUrl)
  const medianRttMs = Math.round(median(samples) * 10) / 10
  const p95Ms = Math.round(percentile95(samples) * 10) / 10
  return {
    medianRttMs,
    p95Ms,
    samplesMs: samples.map((v) => Math.round(v * 10) / 10),
    host: dbInfo?.host ?? null,
    database: dbInfo?.database ?? null,
  }
}

export async function fetchPgStatTop(databaseUrl, limit = 20) {
  if (!databaseUrl) {
    throw new Error('Missing database URL — set HATCAST_DATASOURCE_URL in .env')
  }
  const pool = new Pool({ connectionString: databaseUrl })
  try {
    const sql = `
      SELECT
        query,
        calls,
        round(total_exec_time::numeric, 2) AS total_exec_ms,
        round(mean_exec_time::numeric, 2) AS mean_exec_ms
      FROM pg_stat_statements
      WHERE query NOT ILIKE '%pg_stat_statements%'
      ORDER BY total_exec_time DESC
      LIMIT $1
    `
    const { rows } = await pool.query(sql, [limit])
    return rows.map((row) => ({
      query: String(row.query).replace(/\s+/g, ' ').trim(),
      calls: Number(row.calls),
      totalExecMs: Number(row.total_exec_ms),
      meanExecMs: Number(row.mean_exec_ms),
    }))
  } catch (err) {
    if (/pg_stat_statements/i.test(String(err.message))) {
      return {
        error:
          'pg_stat_statements unavailable — enable via Flyway V64 or Neon Query Insights',
      }
    }
    throw err
  } finally {
    await pool.end()
  }
}

export function parseExplainExecutionMs(output) {
  const match = output.match(/Execution Time:\s*([\d.]+)\s*ms/i)
  return match ? Math.round(Number.parseFloat(match[1])) : null
}

export function loadHotPathQueries(sqlFile = path.join(process.cwd(), 'scripts/v2/db-hot-path-queries.sql')) {
  const raw = fs.readFileSync(sqlFile, 'utf8')
  const blocks = []
  let currentName = null
  let currentSql = []
  for (const line of raw.split('\n')) {
    const nameMatch = line.match(/^-- @name\s+(\S+)/)
    if (nameMatch) {
      if (currentName && currentSql.length) {
        blocks.push({ name: currentName, sql: currentSql.join('\n').trim() })
      }
      currentName = nameMatch[1]
      currentSql = []
      continue
    }
    if (currentName && !line.startsWith('--')) {
      currentSql.push(line)
    }
  }
  if (currentName && currentSql.length) {
    blocks.push({ name: currentName, sql: currentSql.join('\n').trim() })
  }
  return blocks
}

export function runExplainBlocks(databaseUrl, blocks) {
  const results = []
  for (const block of blocks) {
    const res = spawnSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-c', block.sql], {
      encoding: 'utf8',
    })
    const output = `${res.stdout ?? ''}${res.stderr ?? ''}`
    results.push({
      name: block.name,
      serverExecMs: parseExplainExecutionMs(output),
      output: output.trim(),
      exitCode: res.status ?? 1,
    })
  }
  return results
}

export function classifyEndpointFindings(endpoint) {
  const findings = []
  const label = endpoint.endpoint ?? endpoint.path ?? 'unknown'
  const { jdbcTotalMs = 0, roundTrips = 0 } = endpoint
  const serverExecMs = endpoint.serverExecMs ?? 0
  const networkEstimateMs =
    endpoint.networkEstimateMs ?? (serverExecMs > 0 ? estimateNetworkMs(jdbcTotalMs, serverExecMs) : 0)

  if (serverExecMs > 0 && jdbcTotalMs > 0 && networkEstimateMs / jdbcTotalMs > 0.25) {
    findings.push({
      severity: 'major',
      category: 'network-dominated',
      detail: `networkEstimateMs=${networkEstimateMs} is >25% of jdbcTotalMs=${jdbcTotalMs} — batch/BFF or reduce round-trips (PERF-10)`,
    })
  }
  if (serverExecMs > 0 && jdbcTotalMs > 0 && serverExecMs / jdbcTotalMs > 0.5) {
    const isHeavyJoin =
      label.includes('/availability/summary') || label.includes('/composition')
    findings.push({
      severity: 'major',
      category: isHeavyJoin ? 'heavy-join' : 'missing-index',
      detail: isHeavyJoin
        ? `serverExecMs=${serverExecMs} dominates jdbcTotalMs=${jdbcTotalMs} on ${label} — PERF-15 join/aggregate tuning`
        : `serverExecMs=${serverExecMs} dominates jdbcTotalMs=${jdbcTotalMs} — EXPLAIN + indexes (PERF-11/15)`,
    })
  }
  if (roundTrips >= 6) {
    findings.push({
      severity: 'major',
      category: 'sequential-round-trips',
      detail: `${roundTrips} JDBC round-trips on ${label} — consider join fetch or batch loader (UserAgendaService)`,
    })
  }
  if (roundTrips >= 3 && roundTrips < 6) {
    findings.push({
      severity: 'minor',
      category: 'n-plus-one',
      detail: `${roundTrips} statements on ${label} — verify no N+1 in service layer`,
    })
  }
  return findings
}

export async function probeHotPathEndpoints({ apiBase, sessionCookie }) {
  if (!sessionCookie) {
    return { skipped: true, reason: 'Set HATCAST_PERF_SESSION_COOKIE or --session-cookie for API probe' }
  }

  const cookieHeader = sessionCookie.includes('=') ? sessionCookie : `HATCAST_SESSION=${sessionCookie}`
  const headers = { Cookie: cookieHeader, Accept: 'application/json' }

  const agendaRes = await fetch(`${apiBase}/v1/me/agenda?page=0&size=10&scope=upcoming`, { headers })
  if (!agendaRes.ok) {
    return { error: `GET /v1/me/agenda failed (${agendaRes.status})` }
  }
  const agenda = await agendaRes.json()
  const first = agenda.content?.[0]
  const endpoints = [
    buildEndpointProbe(agendaRes, 'GET', '/v1/me/agenda'),
  ]

  if (first?.eventId && first?.seasonId) {
    const eventId = first.eventId
    const summaryRes = await fetch(
      `${apiBase}/v1/seasons/${first.seasonId}/events/${eventId}/availability/summary`,
      { headers },
    )
    if (summaryRes.ok) {
      endpoints.push(
        buildEndpointProbe(summaryRes, 'GET', `/v1/seasons/…/events/${eventId}/availability/summary`),
      )
    }
    const compositionRes = await fetch(
      `${apiBase}/v1/seasons/${first.seasonId}/events/${eventId}/composition`,
      { headers },
    )
    if (compositionRes.ok) {
      endpoints.push(
        buildEndpointProbe(compositionRes, 'GET', `/v1/seasons/…/events/${eventId}/composition`),
      )
    }
    for (const tab of ['dispos', 'equipe']) {
      const pageRes = await fetch(
        `${apiBase}/v1/seasons/${first.seasonId}/events/${eventId}/page?tab=${tab}`,
        { headers },
      )
      if (pageRes.ok) {
        endpoints.push(
          buildEndpointProbe(
            pageRes,
            'GET',
            `/v1/seasons/…/events/${eventId}/page?tab=${tab}`,
          ),
        )
      }
    }
  }

  return { endpoints }
}

function buildEndpointProbe(response, method, pathLabel) {
  const roundTrips = Number.parseInt(response.headers.get('x-hatcast-sql-count') ?? '0', 10)
  const jdbcTotalMs = Number.parseInt(response.headers.get('x-hatcast-sql-total-ms') ?? '0', 10)
  const httpTotalMs = Number.parseInt(response.headers.get('x-hatcast-http-total-ms') ?? '0', 10)
  const endpoint = {
    method,
    endpoint: pathLabel,
    roundTrips,
    jdbcTotalMs,
    serverExecMs: null,
    httpTotalMs,
    networkEstimateMs: null,
    findings: [],
  }
  endpoint.findings = classifyEndpointFindings(endpoint)
  return endpoint
}

export async function buildReport(options) {
  const rtt = await measureRtt(options.databaseUrl)
  const pgStatTop = await fetchPgStatTop(options.databaseUrl, options.limit)
  const explainBlocks = runExplainBlocks(options.databaseUrl, loadHotPathQueries())
  const apiProbe = await probeHotPathEndpoints(options)

  let endpoints = apiProbe.endpoints ?? []
  if (options.endpointFilter) {
    endpoints = endpoints.filter((e) => e.endpoint.includes(options.endpointFilter))
  }

  for (const block of explainBlocks) {
    if (block.serverExecMs == null) continue
    const existing = matchExplainBlockToEndpoint(block.name, endpoints)
    if (existing) {
      existing.serverExecMs = block.serverExecMs
      existing.networkEstimateMs = estimateNetworkMs(existing.jdbcTotalMs, block.serverExecMs)
      existing.findings = classifyEndpointFindings(existing)
    }
  }

  const dbInfo = parseDbInfo(options.databaseUrl)
  return {
    generatedAt: new Date().toISOString(),
    neonHost: dbInfo?.host ?? null,
    regions: {
      neon: inferRegionHint(dbInfo?.host),
      cloudRun: options.regionHint,
    },
    rtt: {
      medianRttMs: rtt.medianRttMs,
      p95Ms: rtt.p95Ms,
      source: options.source,
      host: rtt.host,
    },
    endpoints,
    explain: explainBlocks.map(({ name, serverExecMs, exitCode }) => ({
      name,
      serverExecMs,
      exitCode,
    })),
    pgStatTop: Array.isArray(pgStatTop) ? pgStatTop : [],
    pgStatError: Array.isArray(pgStatTop) ? null : pgStatTop.error,
    apiProbeSkipped: apiProbe.skipped ? apiProbe.reason : null,
    apiProbeError: apiProbe.error ?? null,
  }
}

function writeJsonReport(report, outDir = DEFAULT_OUT_DIR) {
  fs.mkdirSync(outDir, { recursive: true })
  const filePath = path.join(outDir, buildReportFilename())
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`)
  return filePath
}

async function main() {
  const opts = parseCliArgs()

  if (!opts.databaseUrl && opts.command !== 'help') {
    console.error('❌ Missing HATCAST_DATASOURCE_URL (or --database-url)')
    process.exit(1)
  }

  switch (opts.command) {
    case 'rtt': {
      const rtt = await measureRtt(opts.databaseUrl)
      const payload = {
        ...rtt,
        source: opts.source,
        regionHint: opts.regionHint ?? inferRegionHint(rtt.host),
      }
      console.log(JSON.stringify(payload, null, 2))
      break
    }
    case 'pg-stat': {
      const rows = await fetchPgStatTop(opts.databaseUrl, opts.limit)
      console.log(JSON.stringify(rows, null, 2))
      break
    }
    case 'explain': {
      const blocks = loadHotPathQueries()
      const results = runExplainBlocks(opts.databaseUrl, blocks)
      console.log(JSON.stringify(results, null, 2))
      break
    }
    case 'report': {
      const report = await buildReport(opts)
      const filePath = writeJsonReport(report, opts.outDir)
      console.error(`✅ Report written: ${filePath}`)
      console.log(JSON.stringify(report, null, 2))
      break
    }
    default:
      printHelp()
      process.exit(1)
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(`❌ ${err.message}`)
    process.exit(1)
  })
}
