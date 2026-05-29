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
})
