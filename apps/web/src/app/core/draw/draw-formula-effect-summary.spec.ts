import { describe, expect, it } from 'vitest'

import {
  BASE_CHANCE_EXAMPLE_PCT,
  immediateReplayEffectSummary,
  pastParticipationEffectSummary,
  roleRequestEffectSummary,
} from './draw-formula-effect-summary'

describe('draw-formula-effect-summary', () => {
  it('includes base chance example with point deltas for past participation', () => {
    const text = pastParticipationEffectSummary(1)
    expect(text).toContain(`${BASE_CHANCE_EXAMPLE_PCT} % de base`)
    expect(text).toContain('10 %')
    expect(text).toContain('−10 pt')
    expect(text).toContain('5 %')
    expect(text).toContain('−15 pt')
  })

  it('shows exclusion as zero points for replay at intensity 1', () => {
    const text = immediateReplayEffectSummary(1)
    expect(text).toContain('0 %')
    expect(text).toContain('−20 pt')
  })

  it('shows gain in points for role request bonus', () => {
    const text = roleRequestEffectSummary(1, 10)
    expect(text).toContain('40 %')
    expect(text).toContain('+20 pt')
    expect(text).toContain('80 %')
    expect(text).toContain('+60 pt')
  })

  it('shows no effect for role request at intensity zero', () => {
    const text = roleRequestEffectSummary(0, 10)
    expect(text).toContain('aucun effet')
    expect(text).toContain('0 pt')
  })
})
