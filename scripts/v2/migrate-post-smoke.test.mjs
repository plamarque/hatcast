import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

import {
  evaluateMatchCamboDjSlot,
  evaluateMemberStats,
  evaluatePostSmokeDb,
  hasKnownUnresolvedSlotReject,
} from './migrate-post-smoke.mjs'

const golden = {
  rejects: { mig2Max: 0, mig3Max: 2 },
  memberStats: {
    expected: { availabilities: 20, selections: 12, declines: 3 },
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
    evaluateMemberStats(golden, { availabilities: 20, selections: 12, declines: 3 })
  })

  it('rejects selection drift (BUG-002 regression signal)', () => {
    assert.throws(
      () => evaluateMemberStats(golden, { availabilities: 20, selections: 8, declines: 3 }),
      /MIG-S07 memberStats.selections/,
    )
  })
})

describe('migrate-post-smoke — MIG-S08 match-cambo DJ', () => {
  const matchCambo = {
    slug: 'match-cambo',
    emptySlot: { roleKey: 'dj', slotIndex: 0 },
  }

  it('accepts empty slot row', () => {
    const msg = evaluateMatchCamboDjSlot(false, '/missing', matchCambo)
    assert.match(msg, /slot empty/)
  })

  it('accepts omitted slot when rejects-ac documents PLAYER_UNRESOLVED', () => {
    const dir = mkdtempSync(join(tmpdir(), 'hatcast-mig-s08-'))
    writeFileSync(
      join(dir, 'manifest.json'),
      JSON.stringify({
        events: [{ v1EventId: 'eEMVHcH7Lp8qI38T377v', slug: 'match-cambo' }],
      }),
    )
    writeFileSync(
      join(dir, 'rejects-ac.json'),
      JSON.stringify({
        rejects: [
          {
            reason: 'PLAYER_UNRESOLVED',
            detail:
              'cast event=eEMVHcH7Lp8qI38T377v role=dj slot=0: v1 player a4yfpMeKx0FbGsbW1yX9 not in manifest',
          },
        ],
      }),
    )
    assert.equal(hasKnownUnresolvedSlotReject(dir, 'match-cambo', 'dj', 0), true)
    const msg = evaluateMatchCamboDjSlot(null, dir, matchCambo)
    assert.match(msg, /slot omitted/)
  })

  it('fails when slot row is missing without documented reject', () => {
    assert.throws(
      () => evaluateMatchCamboDjSlot(null, '/missing', matchCambo),
      /slot row missing/,
    )
  })

  it('fails when DJ slot is assigned', () => {
    assert.throws(
      () => evaluateMatchCamboDjSlot(true, '/missing', matchCambo),
      /expected empty dj slot/,
    )
  })
})
