import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { evaluateMemberStats, evaluatePostSmokeDb } from './migrate-post-smoke.mjs'

const golden = {
  rejects: { mig2Max: 0, mig3Max: 2 },
  memberStats: {
    expected: { availabilities: 19, selections: 10, declines: 3 },
    tolerance: 0,
  },
}

describe('migrate-post-smoke — evaluatePostSmokeDb', () => {
  it('passes when DB matches artifact expectations', () => {
    evaluatePostSmokeDb(
      {
        events: 55,
        availability: 1226,
        compositions: 32,
        deplacements: 7,
        players: 31,
        rejectsMig2: 0,
        rejectsMig3: 2,
      },
      {
        events: 55,
        availability: 1226,
        compositions: 32,
        deplacements: 7,
        participants: 32,
        season_event_count: 36,
        events_non_archived: 36,
        compositions_without_slots: 0,
      },
      golden,
    )
  })

  it('fails on deplacements drift', () => {
    assert.throws(
      () =>
        evaluatePostSmokeDb(
          {
            events: 55,
            availability: 1226,
            compositions: 32,
            deplacements: 7,
            players: 31,
            rejectsMig2: 0,
            rejectsMig3: 2,
          },
          {
            events: 55,
            availability: 1226,
            compositions: 32,
            deplacements: 4,
            participants: 32,
            season_event_count: 36,
            events_non_archived: 36,
            compositions_without_slots: 0,
          },
          golden,
        ),
      /MIG-S02 deplacements/,
    )
  })

  it('fails when composition rows lack slot scaffolding', () => {
    assert.throws(
      () =>
        evaluatePostSmokeDb(
          {
            events: 55,
            availability: 1226,
            compositions: 32,
            deplacements: 7,
            players: 31,
            rejectsMig2: 0,
            rejectsMig3: 0,
          },
          {
            events: 55,
            availability: 1226,
            compositions: 32,
            deplacements: 7,
            participants: 32,
            season_event_count: 55,
            events_non_archived: 55,
            compositions_without_slots: 1,
          },
          golden,
        ),
      /MIG-S04/,
    )
  })
})

describe('migrate-post-smoke — evaluateMemberStats', () => {
  it('accepts Patrice golden stats', () => {
    evaluateMemberStats(golden, { availabilities: 19, selections: 10, declines: 3 })
  })

  it('rejects selection drift (BUG-002 regression signal)', () => {
    assert.throws(
      () => evaluateMemberStats(golden, { availabilities: 19, selections: 8, declines: 3 }),
      /MIG-S07 memberStats.selections/,
    )
  })
})
