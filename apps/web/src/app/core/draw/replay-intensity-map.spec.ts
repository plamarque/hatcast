import { describe, expect, it } from 'vitest'

import { replayDisplayFromParams, replayParamsFromDisplay } from './replay-intensity-map'

describe('replay-intensity-map', () => {
  it('maps EXCLUDE to display 1.0', () => {
    expect(replayDisplayFromParams('EXCLUDE', undefined)).toBe(1)
    expect(replayDisplayFromParams(undefined, undefined)).toBe(1)
  })

  it('maps MALUS multiplier to display intensity', () => {
    expect(replayDisplayFromParams('MALUS', 0.25)).toBe(0.75)
  })

  it('round-trips EXCLUDE at display 1.0', () => {
    expect(replayParamsFromDisplay(1)).toEqual({ mode: 'EXCLUDE' })
    expect(replayDisplayFromParams('EXCLUDE', undefined)).toBe(1)
  })

  it('round-trips MALUS from display intensity', () => {
    const params = replayParamsFromDisplay(0.75)
    expect(params).toEqual({ mode: 'MALUS', malusMultiplier: 0.25 })
    expect(
      replayDisplayFromParams(params.mode, params.malusMultiplier),
    ).toBe(0.75)
  })
})
