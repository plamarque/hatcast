#!/usr/bin/env node
/**
 * PERF-16 gate — 10 sequential GET /v1/me/agenda against a Neon-backed API.
 * Manual / CI opt-in: requires live API + session cookie (not H2-only).
 *
 * Usage:
 *   HATCAST_PERF_SESSION_COOKIE='HATCAST_SESSION=…' \\
 *   HATCAST_PERF_API_BASE='https://staging.example' \\
 *   node scripts/v2/neon-perf-agenda-gate.mjs
 *
 * Exit 1 if p95 > 500 ms unless HATCAST_NEON_PERF_WAIVER=1 (document waiver in story).
 */

import { resolveHatcastDatasourceUrl } from '../migrate-malice-load.mjs'

const API_BASE = (process.env.HATCAST_PERF_API_BASE ?? 'http://127.0.0.1:8080').replace(/\/$/, '')
const SESSION_COOKIE = process.env.HATCAST_PERF_SESSION_COOKIE ?? ''
const P95_LIMIT_MS = Number.parseInt(process.env.HATCAST_NEON_PERF_P95_MS ?? '500', 10)
const WAIVER = process.env.HATCAST_NEON_PERF_WAIVER === '1'
const ALLOW_H2 = process.env.HATCAST_NEON_PERF_ALLOW_H2 === '1'

function percentile95(samples) {
  const sorted = [...samples].sort((a, b) => a - b)
  const index = Math.ceil(sorted.length * 0.95) - 1
  return sorted[Math.max(0, index)]
}

function assertNeonBackedTarget() {
  if (WAIVER || ALLOW_H2) return
  const databaseUrl = resolveHatcastDatasourceUrl()
  if (!databaseUrl || !/neon\.tech/i.test(databaseUrl)) {
    console.error(
      '❌ Gate requires Neon datasource (HATCAST_DATASOURCE_URL with neon.tech). ' +
        'Set HATCAST_NEON_PERF_WAIVER=1 or HATCAST_NEON_PERF_ALLOW_H2=1 to override.',
    )
    process.exit(1)
  }
}

async function fetchAgenda(cookieHeader) {
  const url = `${API_BASE}/v1/me/agenda?page=0&size=10&scope=upcoming`
  const started = performance.now()
  const res = await fetch(url, {
    headers: { Cookie: cookieHeader, Accept: 'application/json' },
  })
  return { res, durationMs: performance.now() - started }
}

async function main() {
  if (!SESSION_COOKIE) {
    console.error('❌ Set HATCAST_PERF_SESSION_COOKIE (authenticated session against Neon-backed API)')
    process.exit(1)
  }

  assertNeonBackedTarget()

  const cookieHeader = SESSION_COOKIE.includes('=') ? SESSION_COOKIE : `HATCAST_SESSION=${SESSION_COOKIE}`

  const warmup = await fetchAgenda(cookieHeader)
  if (!warmup.res.ok) {
    console.error(`❌ Warmup request failed: HTTP ${warmup.res.status}`)
    process.exit(1)
  }
  if (!WAIVER && !ALLOW_H2 && !warmup.res.headers.get('x-hatcast-sql-count')) {
    console.error(
      '❌ API did not return X-Hatcast-Sql-Count — enable hatcast.jdbc.metrics-enabled (dev profile against Neon)',
    )
    process.exit(1)
  }

  const durations = []
  for (let i = 0; i < 10; i += 1) {
    const { res, durationMs } = await fetchAgenda(cookieHeader)
    durations.push(durationMs)
    if (!res.ok) {
      console.error(`❌ Request ${i + 1} failed: HTTP ${res.status}`)
      process.exit(1)
    }
  }

  const p95 = Math.round(percentile95(durations))
  console.log(JSON.stringify({ samplesMs: durations.map((d) => Math.round(d)), p95Ms: p95 }, null, 2))

  if (p95 > P95_LIMIT_MS) {
    if (WAIVER) {
      console.error(`⚠️ p95=${p95}ms > ${P95_LIMIT_MS}ms — waived via HATCAST_NEON_PERF_WAIVER=1`)
      process.exit(0)
    }
    console.error(`❌ NFR-P2 gate failed: p95=${p95}ms > ${P95_LIMIT_MS}ms`)
    process.exit(1)
  }

  console.error(`✅ NFR-P2 gate passed: p95=${p95}ms ≤ ${P95_LIMIT_MS}ms`)
}

main().catch((err) => {
  console.error(`❌ ${err.message}`)
  process.exit(1)
})
