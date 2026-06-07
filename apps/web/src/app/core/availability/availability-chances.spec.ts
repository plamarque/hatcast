import { describe, expect, it } from 'vitest'

import {
  calculatePracticalChance,
  chancePoolSegmentBackground,
  chancePoolTier,
  chanceSpectrumSegmentBackground,
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

  it('chancePoolTier maps four intuitive bands', () => {
    expect(chancePoolTier(93)).toBe('green')
    expect(chancePoolTier(62)).toBe('yellow')
    expect(chancePoolTier(36)).toBe('orange')
    expect(chancePoolTier(6)).toBe('red')
  })

  it('chancePoolSegmentBackground uses distinct muted HSL per tier and 5 % step', () => {
    const high = chancePoolSegmentBackground(93)
    const low = chancePoolSegmentBackground(36)
    expect(high).toContain('hsl(')
    expect(low).toContain('hsl(')
    expect(high).not.toBe(low)
    expect(chanceSpectrumSegmentBackground(93)).toBe(high)
  })

  it('chancePoolSegmentBackground separates yellow and orange hues', () => {
    const yellow = chancePoolSegmentBackground(62)
    const orange = chancePoolSegmentBackground(36)
    expect(yellow).toMatch(/hsl\(5[0-9] /)
    expect(orange).toMatch(/hsl\(2[0-9] /)
    expect(yellow).not.toBe(orange)
  })

  it('chancePoolSegmentBackground does not darken low yellow vs high orange', () => {
    const lowYellow = chancePoolSegmentBackground(50)
    const highOrange = chancePoolSegmentBackground(49)
    const parseLight = (bg: string): number => {
      const match = bg.match(/hsl\(\d+ [\d.]+% ([\d.]+)%\)/)
      return match ? Number.parseFloat(match[1]) : 0
    }
    expect(parseLight(lowYellow)).toBeGreaterThanOrEqual(parseLight(highOrange))
  })
})
