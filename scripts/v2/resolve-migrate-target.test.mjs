import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeMigrateTarget,
  resolveMigrateTarget,
  MIGRATE_TARGETS,
} from './resolve-migrate-target.mjs'

describe('resolve-migrate-target', () => {
  it('lists four targets', () => {
    assert.deepEqual(MIGRATE_TARGETS, [
      'local',
      'development',
      'staging',
      'production',
    ])
  })

  it('normalizes target names', () => {
    assert.equal(normalizeMigrateTarget('Staging'), 'staging')
  })

  it('rejects unknown target', () => {
    assert.throws(() => normalizeMigrateTarget('qa'), /Unknown migrate target/)
  })

  it('resolves staging database and load target', () => {
    const env = {
      NEON_STAGING_URL: 'postgresql://u:p@ep-staging-123.neon.tech/neondb',
      HATCAST_MIGRATE_API_BASE_STAGING: 'https://hatcast-v2-staging.example.run.app',
    }
    const r = resolveMigrateTarget('staging', env)
    assert.equal(r.target, 'staging')
    assert.equal(r.loadTarget, 'staging')
    assert.match(r.databaseUrl, /ep-staging-123/)
    assert.equal(r.apiBaseUrl, env.HATCAST_MIGRATE_API_BASE_STAGING)
    assert.equal(r.restartMode, 'github')
  })

  it('resolves local defaults', () => {
    const r = resolveMigrateTarget('local', {
      HATCAST_DATASOURCE_URL: 'jdbc:postgresql://ep-local.neon.tech/neondb',
    })
    assert.equal(r.apiBaseUrl, 'http://127.0.0.1:8080')
    assert.equal(r.restartMode, 'prompt-local')
    assert.match(r.databaseUrl, /ep-local/)
  })

  it('enables migration API auto-config on development only', () => {
    const dev = resolveMigrateTarget('development', {})
    const stg = resolveMigrateTarget('staging', {})
    assert.equal(dev.autoEnableMigrationApi, true)
    assert.equal(stg.autoEnableMigrationApi, false)
  })

  it('resolves production with prod load target', () => {
    const r = resolveMigrateTarget('production', {
      NEON_PRODUCTION_URL: 'postgresql://u:p@ep-prod.neon.tech/neondb',
      HATCAST_MIGRATE_API_BASE_PRODUCTION: 'https://hatcast-v2.example.run.app',
    })
    assert.equal(r.loadTarget, 'prod')
    assert.equal(r.requiresProdConfirm, true)
    assert.equal(r.restartMode, 'none')
  })
})
