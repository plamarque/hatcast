import { describe, expect, it } from 'vitest'

import { CompositionOverlayGateService } from './composition-overlay-gate.service'

describe('CompositionOverlayGateService', () => {
  it('allows help on top of an open breakdown sheet', () => {
    const gate = new CompositionOverlayGateService()
    expect(gate.tryAcquireBreakdown()).toBe(true)
    expect(gate.tryAcquireHelp()).toBe(true)
    gate.release()
    gate.release()
    expect(gate.tryAcquireHelp()).toBe(true)
    gate.release()
  })

  it('blocks a second breakdown while one is open', () => {
    const gate = new CompositionOverlayGateService()
    expect(gate.tryAcquireBreakdown()).toBe(true)
    expect(gate.tryAcquireBreakdown()).toBe(false)
    gate.release()
  })

  it('blocks a third overlay when breakdown and help are open', () => {
    const gate = new CompositionOverlayGateService()
    expect(gate.tryAcquireBreakdown()).toBe(true)
    expect(gate.tryAcquireHelp()).toBe(true)
    expect(gate.tryAcquireHelp()).toBe(false)
    gate.release()
    gate.release()
  })
})
