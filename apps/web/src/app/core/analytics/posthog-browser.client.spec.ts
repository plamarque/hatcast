import { beforeEach, describe, expect, it, vi } from 'vitest'

const { init } = vi.hoisted(() => ({ init: vi.fn() }))
vi.mock('posthog-js', () => ({ default: { init } }))

describe('PostHog privacy configuration', () => {
  beforeEach(() => { vi.resetModules(); init.mockReset() })
  it('explicitly blocks private UI from session recording', async () => {
    const { initPostHogBrowser } = await import('./posthog-browser.client')
    expect(await initPostHogBrowser({ apiKey: 'fixture', apiHost: 'https://analytics.invalid', uiHost: '' })).toBe(true)
    expect(init).toHaveBeenCalledWith('fixture', expect.objectContaining({ session_recording: { blockClass: 'ph-no-capture' } }))
  })
})
