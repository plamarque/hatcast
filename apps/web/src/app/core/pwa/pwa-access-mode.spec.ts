import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolvePwaAccessMode } from './pwa-access-mode'

describe('resolvePwaAccessMode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(window.navigator, 'standalone', { configurable: true, value: undefined })
  })

  it('uses display-mode standalone when available', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query === '(display-mode: standalone)' }))
    expect(resolvePwaAccessMode()).toBe('standalone')
  })

  it('recognizes the iOS standalone browser state', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    Object.defineProperty(window.navigator, 'standalone', { configurable: true, value: true })
    expect(resolvePwaAccessMode()).toBe('standalone')
  })

  it('returns web without a standalone signal', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    expect(resolvePwaAccessMode()).toBe('web')
  })
})
