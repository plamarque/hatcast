import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { normalizePostgresUrl } from '../migrate-malice-load.mjs'
import {
  buildReportFilename,
  classifyEndpointFindings,
  estimateNetworkMs,
  inferRegionHint,
  loadHotPathQueries,
  matchExplainBlockToEndpoint,
  median,
  parseCliArgs,
  parseExplainExecutionMs,
  percentile95,
} from './audit-db-latency.mjs'

describe('audit-db-latency helpers', () => {
  it('parses CLI args with default report command', () => {
    const opts = parseCliArgs(['rtt', '--source=cloud-shell', '--limit=5'])
    assert.equal(opts.command, 'rtt')
    assert.equal(opts.source, 'cloud-shell')
    assert.equal(opts.limit, 5)
  })

  it('computes median and p95', () => {
    const samples = [10, 12, 11, 13, 15, 14, 16, 18, 17, 20]
    assert.equal(median(samples), 14.5)
    assert.equal(percentile95(samples), 20)
  })

  it('normalizes JDBC URL to postgresql scheme', () => {
    const normalized = normalizePostgresUrl(
      'jdbc:postgresql://ep-test.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    )
    assert.equal(
      normalized,
      'postgresql://ep-test.eu-central-1.aws.neon.tech/neondb?sslmode=require',
    )
  })

  it('estimates network ms bounded at zero', () => {
    assert.equal(estimateNetworkMs(420, 310), 110)
    assert.equal(estimateNetworkMs(100, 150), 0)
  })

  it('infers Neon region hint from host', () => {
    assert.equal(inferRegionHint('ep-local-123456.eu-central-1.aws.neon.tech'), 'aws-eu-central-1')
    assert.equal(inferRegionHint(null), null)
  })

  it('parses EXPLAIN execution time', () => {
    const output = 'Planning Time: 0.1 ms\nExecution Time: 45.678 ms'
    assert.equal(parseExplainExecutionMs(output), 46)
  })

  it('loads hot-path SQL blocks by @name marker', () => {
    const blocks = loadHotPathQueries()
    assert.ok(blocks.length >= 3)
    assert.ok(blocks.some((b) => b.name === 'agenda_upcoming_events'))
  })

  it('matches EXPLAIN block names to probed endpoints', () => {
    const endpoints = [
      { endpoint: 'GET /v1/me/agenda' },
      { endpoint: '/v1/seasons/…/events/x/availability/summary' },
    ]
    assert.equal(
      matchExplainBlockToEndpoint('agenda_upcoming_events', endpoints)?.endpoint,
      'GET /v1/me/agenda',
    )
    assert.ok(
      matchExplainBlockToEndpoint('availability_summary', endpoints)?.endpoint.includes(
        '/availability/summary',
      ),
    )
  })

  it('does not flag network-dominated when serverExecMs is unknown', () => {
    const findings = classifyEndpointFindings({
      endpoint: '/v1/me/agenda',
      roundTrips: 8,
      jdbcTotalMs: 420,
      serverExecMs: null,
      networkEstimateMs: null,
    })
    assert.ok(findings.some((f) => f.category === 'sequential-round-trips'))
    assert.ok(!findings.some((f) => f.category === 'network-dominated'))
  })

  it('classifies sequential round-trips and network when serverExecMs known', () => {
    const findings = classifyEndpointFindings({
      endpoint: '/v1/me/agenda',
      roundTrips: 8,
      jdbcTotalMs: 420,
      serverExecMs: 100,
      networkEstimateMs: 320,
    })
    assert.ok(findings.some((f) => f.category === 'sequential-round-trips'))
    assert.ok(findings.some((f) => f.category === 'network-dominated'))
  })

  it('classifies heavy-join on availability summary', () => {
    const findings = classifyEndpointFindings({
      endpoint: '/v1/seasons/…/events/x/availability/summary',
      roundTrips: 2,
      jdbcTotalMs: 400,
      serverExecMs: 300,
      networkEstimateMs: 100,
    })
    assert.ok(findings.some((f) => f.category === 'heavy-join'))
  })

  it('builds timestamped report filename', () => {
    const now = new Date('2026-06-10T12:34:56.789Z')
    assert.match(buildReportFilename(now), /^db-latency-2026-06-10T12-34-56-789Z\.json$/)
  })
})
