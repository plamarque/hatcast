import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { evaluateMigrationGate } from './e1-staging-migration-assert.mjs'

const baseOpts = {
  minEvents: 1,
  minParticipants: 1,
  minDeplacements: 1,
}

describe('e1-staging-migration-assert — evaluateMigrationGate', () => {
  it('passes on typical Malice staging snapshot (36 events, 4 deplacements)', () => {
    evaluateMigrationGate(
      {
        seasonEventCount: 36,
        eventsNonArchived: 36,
        eventsArchived: 19,
        deplacements: 4,
        participantsActive: 32,
        eventsWithDisposOpen: 30,
      },
      baseOpts,
    )
  })

  it('fails when season.event_count is out of sync', () => {
    assert.throws(
      () =>
        evaluateMigrationGate(
          {
            seasonEventCount: 55,
            eventsNonArchived: 36,
            eventsArchived: 0,
            deplacements: 4,
            participantsActive: 10,
            eventsWithDisposOpen: 5,
          },
          baseOpts,
        ),
      /E1-MIG-003/,
    )
  })

  it('applies opt-in strict parity when eventsExpected is set', () => {
    assert.throws(
      () =>
        evaluateMigrationGate(
          {
            seasonEventCount: 36,
            eventsNonArchived: 36,
            eventsArchived: 0,
            deplacements: 4,
            participantsActive: 10,
            eventsWithDisposOpen: 5,
          },
          { ...baseOpts, eventsExpected: 55, eventsTolerance: 2 },
        ),
      /E1-MIG-OPT events parity/,
    )
  })
})
