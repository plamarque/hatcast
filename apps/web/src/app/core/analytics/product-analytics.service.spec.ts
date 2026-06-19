import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { environment } from '../../../environments/environment'
import { FR47_AVAILABILITY_FIRST_SUBMISSION, FR47_NOTIFICATION_LINK_OPENED, V2_MIGRATION_FIRST_SESSION } from './fr47-event-names'
import { resolveNotificationLinkTab } from './notification-link-tab'
import { setPostHogBrowserFacadeForTests } from './posthog-browser.client'
import { ProductAnalyticsService } from './product-analytics.service'

describe('ProductAnalyticsService', () => {
  let capture: ReturnType<
    typeof vi.fn<(event: string, properties?: Record<string, unknown>) => void>
  >
  let identify: ReturnType<
    typeof vi.fn<
      (distinctId: string, personProperties?: { email?: string; name?: string }) => void
    >
  >
  let reset: ReturnType<typeof vi.fn<() => void>>
  const savedEnv = { ...environment }

  function clearSessionStorage(): void {
    if (typeof sessionStorage !== 'undefined' && typeof sessionStorage.clear === 'function') {
      sessionStorage.clear()
    }
  }

  function clearV2MigrationDedupe(userId: string): void {
    const key = `hatcast:v2-migration-first-session:${userId}`
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key)
    }
  }

  beforeEach(() => {
    clearSessionStorage()
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
    clearSessionStorage()
    clearV2MigrationDedupe('00000000-0000-4000-8000-000000000001')
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
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', undefined)
  })

  it('identifies with email and name person properties when provided', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000001', {
      email: 'alice@example.com',
      displayName: 'Alice',
    })
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', {
      email: 'alice@example.com',
      name: 'Alice',
    })
  })

  it('omits empty email and name from person properties', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000001', {
      email: '  ',
      displayName: null,
    })
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', undefined)
  })

  it('sends only available person properties when partial', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000001', {
      email: 'bob@example.com',
      displayName: '',
    })
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', {
      email: 'bob@example.com',
    })
  })

  it('captures v2_migration_first_session once per user', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    const userId = '00000000-0000-4000-8000-000000000001'
    clearV2MigrationDedupe(userId)
    service().identifyUser(userId, { email: 'alice@example.com', displayName: 'Alice' })
    service().identifyUser(userId, { email: 'alice@example.com', displayName: 'Alice' })
    expect(capture).toHaveBeenCalledTimes(1)
    expect(capture).toHaveBeenCalledWith(
      V2_MIGRATION_FIRST_SESSION,
      expect.objectContaining({
        user_id: userId,
        first_seen_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      }),
    )
    expect(capture).not.toHaveBeenCalledWith(
      V2_MIGRATION_FIRST_SESSION,
      expect.objectContaining({ email: expect.anything() }),
    )
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
