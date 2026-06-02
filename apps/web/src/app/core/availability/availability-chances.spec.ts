import { describe, expect, it } from 'vitest'

import {
  calculatePracticalChance,
  isCandidateForRole,
  scoreCandidates,
} from './availability-chances'

describe('availability-chances', () => {
  it('isCandidateForRole accepts general availability', () => {
    expect(isCandidateForRole('available', [], 'mc')).toBe(true)
  })

  it('isCandidateForRole filters by explicit role keys', () => {
    expect(isCandidateForRole('available', ['player'], 'player')).toBe(true)
    expect(isCandidateForRole('available', ['player'], 'mc')).toBe(false)
    expect(isCandidateForRole('unavailable', [], 'player')).toBe(false)
  })

  it('scoreCandidates splits equal odds when no history and one place', () => {
    const scored = scoreCandidates(
      [{ participantId: 'a' }, { participantId: 'b' }, { participantId: 'c' }],
      1,
    )
    expect(scored.map((s) => s.chancePercent).sort()).toEqual([33, 33, 33])
  })

  it('scoreCandidates uses multi-draw probability for several places', () => {
    const scored = scoreCandidates(
      Array.from({ length: 8 }, (_, i) => ({ participantId: `p${i}` })),
      5,
    )
    expect(scored.every((s) => s.chancePercent === 63)).toBe(true)
  })

  it('calculatePracticalChance returns zero for empty total', () => {
    expect(calculatePracticalChance(1, 0)).toBe(0)
  })
})
