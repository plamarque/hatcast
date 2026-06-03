import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { environment } from '../../../environments/environment'
import { FR47_AVAILABILITY_FIRST_SUBMISSION, FR47_NOTIFICATION_LINK_OPENED } from './fr47-event-names'
import { resolveNotificationLinkTab } from './notification-link-tab'
import { setPostHogBrowserFacadeForTests } from './posthog-browser.client'
import { ProductAnalyticsService } from './product-analytics.service'

describe('ProductAnalyticsService', () => {
  let capture: ReturnType<
    typeof vi.fn<(event: string, properties?: Record<string, unknown>) => void>
  >
  let identify: ReturnType<typeof vi.fn<(distinctId: string) => void>>
  let reset: ReturnType<typeof vi.fn<() => void>>
  const savedEnv = { ...environment }

  beforeEach(() => {
    sessionStorage.clear()
    capture = vi.fn()
    identify = vi.fn()
    reset = vi.fn()
    setPostHogBrowserFacadeForTests({ capture, identify, reset })
    Object.assign(environment, {
      posthogApiKey: '',
      posthogApiHost: '',
      posthogUiHost: 'https://eu.posthog.com',
      demoTroupeId: 'a0000001-0000-4000-8000-000000000099',
    })
    TestBed.configureTestingModule({})
  })

  afterEach(() => {
    setPostHogBrowserFacadeForTests(null)
    Object.assign(environment, savedEnv)
    sessionStorage.clear()
  })

  function service(): ProductAnalyticsService {
    return TestBed.inject(ProductAnalyticsService)
  }

  it('does not capture when posthogApiKey is empty', async () => {
    environment.posthogApiKey = ''
    await service().bootstrap()
    service().captureAvailabilityFirstSubmission(
      service().eventContext('ev-1', 'season-1', 'troupe-1'),
      {
        is_proxy: false,
        opened_at: '2026-01-01T00:00:00.000Z',
        submitted_at: '2026-01-02T00:00:00.000Z',
      },
    )
    expect(capture).not.toHaveBeenCalled()
    expect(service().isEnabled).toBe(false)
  })

  it('captures FR47 events when key is set and client is initialized', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    const initSpy = vi.spyOn(
      await import('./posthog-browser.client'),
      'initPostHogBrowser',
    )
    initSpy.mockResolvedValue(true)
    await service().bootstrap()
    expect(service().isEnabled).toBe(true)

    const ctx = service().eventContext('ev-1', 'season-1', environment.demoTroupeId)
    expect(ctx.is_demo_troupe).toBe(true)

    service().captureAvailabilityFirstSubmission(ctx, {
      is_proxy: true,
      opened_at: '2026-01-01T00:00:00.000Z',
      submitted_at: '2026-01-02T00:00:00.000Z',
    })
    expect(capture).toHaveBeenCalledWith(FR47_AVAILABILITY_FIRST_SUBMISSION, {
      event_id: 'ev-1',
      season_id: 'season-1',
      troupe_id: environment.demoTroupeId,
      is_demo_troupe: true,
      is_proxy: true,
      opened_at: '2026-01-01T00:00:00.000Z',
      submitted_at: '2026-01-02T00:00:00.000Z',
    })
  })

  it('identify and reset are no-op when disabled', async () => {
    environment.posthogApiKey = ''
    await service().bootstrap()
    service().identifyUser('user-uuid')
    service().resetSession()
    expect(identify).not.toHaveBeenCalled()
    expect(reset).not.toHaveBeenCalled()
  })

  it('identifies opaque user id when enabled', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000001')
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001')
  })

  it('dedupes composition_all_confirmations_received per event in session', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    const ctx = service().eventContext('ev-dedupe', 's1', 't1')
    const props = {
      validated_at: '2026-01-01T00:00:00.000Z',
      completed_at: '2026-01-02T00:00:00.000Z',
    }
    service().captureCompositionAllConfirmationsReceived(ctx, props)
    service().captureCompositionAllConfirmationsReceived(ctx, props)
    expect(capture).toHaveBeenCalledTimes(1)
  })

  it('captureNotificationLinkOpened sends link_tab', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().captureNotificationLinkOpened(
      service().eventContext('ev-1', 's1', 't1'),
      { link_tab: 'confirm' },
    )
    expect(capture).toHaveBeenCalledWith(FR47_NOTIFICATION_LINK_OPENED, expect.objectContaining({
      link_tab: 'confirm',
    }))
  })
})

describe('resolveNotificationLinkTab', () => {
  it('maps notification query params to link_tab values', () => {
    const params = {
      get: (key: string) => {
        const map: Record<string, string> = {
          tab: 'dispos',
          showConfirm: 'false',
        }
        return map[key] ?? null
      },
      has: () => true,
      getAll: () => [],
      keys: [],
    }
    expect(resolveNotificationLinkTab(params)).toBe('dispos')

    const confirmParams = {
      get: (key: string) => (key === 'showConfirm' ? 'true' : null),
      has: () => true,
      getAll: () => [],
      keys: [],
    }
    expect(resolveNotificationLinkTab(confirmParams)).toBe('confirm')

    const none = {
      get: () => null,
      has: () => false,
      getAll: () => [],
      keys: [],
    }
    expect(resolveNotificationLinkTab(none)).toBeNull()
  })
})
