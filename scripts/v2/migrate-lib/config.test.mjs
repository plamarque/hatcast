import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { parseConfig, shouldRunStep } from './config.mjs'

describe('migrate-lib config', () => {
  it('shouldRunStep respects from-step order', () => {
    const config = { fromStep: 'b4', stepOrder: ['preflight', 'bootstrap', 'b1', 'b2', 'roster', 'b4', 'b5'] }
    assert.equal(shouldRunStep(config, 'b2'), false)
    assert.equal(shouldRunStep(config, 'b4'), true)
    assert.equal(shouldRunStep(config, 'b5'), true)
  })

  it('parseConfig defaults dry-run without --yes', () => {
    const config = parseConfig(['--v1-season=test', '--api-base-url=http://localhost'])
    assert.equal(config.dryRun, true)
    assert.equal(config.yes, false)
  })

  it('parseConfig enables writes with --yes', () => {
    const config = parseConfig(['--yes', '--v1-season=test'])
    assert.equal(config.dryRun, false)
    assert.equal(config.yes, true)
  })

  it('parseConfig rejects unknown from-step', () => {
    assert.throws(() => parseConfig(['--from-step=unknown']), /Unknown --from-step/)
  })

  it('parseConfig resolves --migrate-env=development', () => {
    const prevDb = process.env.NEON_DEVELOPMENT_URL
    const prevApi = process.env.HATCAST_MIGRATE_API_BASE_DEVELOPMENT
    process.env.NEON_DEVELOPMENT_URL =
      'postgresql://user:pass@ep-development-1.neon.tech/neondb'
    process.env.HATCAST_MIGRATE_API_BASE_DEVELOPMENT = 'https://dev.example.run.app'
    try {
      const config = parseConfig([
        '--migrate-env=development',
        '--yes',
        '--v1-season=test',
        '--migration-api-key=test-key',
      ])
      assert.equal(config.migrateEnv, 'development')
      assert.match(config.databaseUrl, /ep-development-1/)
      assert.equal(config.apiBaseUrl, 'https://dev.example.run.app')
      assert.equal(config.target, 'development')
    } finally {
      if (prevDb === undefined) delete process.env.NEON_DEVELOPMENT_URL
      else process.env.NEON_DEVELOPMENT_URL = prevDb
      if (prevApi === undefined) delete process.env.HATCAST_MIGRATE_API_BASE_DEVELOPMENT
      else process.env.HATCAST_MIGRATE_API_BASE_DEVELOPMENT = prevApi
    }
  })

  it('parseConfig falls back when JSON env placeholder resolved to empty', () => {
    const prev = process.env.NEON_STAGING_URL
    process.env.NEON_STAGING_URL = 'postgresql://user:pass@ep-branch.example/neondb'
    try {
      const config = parseConfig([
        '--yes',
        '--v1-season=test',
        '--api-base-url=http://localhost',
        '--database-url=',
      ])
      assert.equal(config.databaseUrl, process.env.NEON_STAGING_URL)
    } finally {
      if (prev === undefined) delete process.env.NEON_STAGING_URL
      else process.env.NEON_STAGING_URL = prev
    }
  })
})
