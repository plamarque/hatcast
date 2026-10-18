import { TestBed } from '@angular/core/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { environment } from '../../../environments/environment'
import { AVAILABILITY_REMINDER_SENT, COMPOSITION_MUTATION_COMPLETED, COMPOSITION_WORKSPACE_OPENED, FR47_AVAILABILITY_FIRST_SUBMISSION, FR47_NOTIFICATION_LINK_OPENED, V1_CUTOVER_SRC, V2_CUTOVER_REFERRAL_LANDING, V2_MIGRATION_FIRST_SESSION } from './fr47-event-names'
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
  let alias: ReturnType<
    typeof vi.fn<(aliasId: string, distinctId?: string) => void>
  >
  const savedEnv = { ...environment }
  let savedLocation = '/'

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
    if (typeof window !== 'undefined') {
      savedLocation = window.location.href
    }
    clearSessionStorage()
    capture = vi.fn()
    identify = vi.fn()
    reset = vi.fn()
    alias = vi.fn()
    setPostHogBrowserFacadeForTests({ capture, identify, alias, reset })
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
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', savedLocation)
    }
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

  it('does not retain an identified user after a session reset', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000009')
    service().resetSession()
    identify.mockClear()

    service().captureCompositionWorkspaceOpened(
      { ...service().eventContext('ev-after-reset', 's1', 't1'), actor_scope: 'event_organizer' },
      'draft',
    )

    expect(identify).not.toHaveBeenCalled()
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

  it('captures only bounded organizer journey properties and dedupes workspace opens', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    const ctx = { ...service().eventContext('ev-organizer', 's1', 't1'), actor_scope: 'event_organizer' as const }
    service().captureCompositionWorkspaceOpened(ctx, 'draft')
    service().captureCompositionWorkspaceOpened(ctx, 'draft')
    service().captureCompositionMutation(ctx, {
      action: 'slot', outcome: 'succeeded', operation: 'remove_slot', participant_id: 'forbidden', message: 'forbidden',
    } as never)
    service().captureAvailabilityReminder(ctx, { outcome: 'succeeded', recipient_count_bucket: '2_5' })
    expect(capture).toHaveBeenCalledTimes(3)
    expect(capture).toHaveBeenCalledWith(COMPOSITION_WORKSPACE_OPENED, expect.objectContaining({ actor_scope: 'event_organizer', lifecycle: 'draft' }))
    expect(capture).toHaveBeenCalledWith(COMPOSITION_MUTATION_COMPLETED, expect.objectContaining({ action: 'slot', outcome: 'succeeded', operation: 'remove_slot' }))
    expect(capture).toHaveBeenCalledWith(AVAILABILITY_REMINDER_SENT, expect.objectContaining({ recipient_count_bucket: '2_5' }))
    for (const [, properties] of capture.mock.calls) {
      expect(properties).not.toHaveProperty('participant_id')
      expect(properties).not.toHaveProperty('message')
      expect(properties).not.toHaveProperty('email')
    }

    capture.mockClear()
    service().captureCompositionWorkspaceOpened(ctx, 'unexpected' as never)
    service().captureCompositionMutation(ctx, { action: 'unexpected', outcome: 'succeeded' } as never)
    service().captureCompositionMutation(ctx, { action: 'slot', outcome: 'unexpected' } as never)
    service().captureAvailabilityReminder(ctx, { outcome: 'unexpected' } as never)
    expect(capture).not.toHaveBeenCalled()
  })

  it('sets the sole permitted organizer People trait after an identified organizer capture', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000009')
    identify.mockClear()
    service().captureCompositionWorkspaceOpened(
      { ...service().eventContext('ev-organizer-person', 's1', 't1'), actor_scope: 'event_organizer' },
      'draft',
    )
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000009', { has_ever_organized: true })
  })

  it('dedupes workspace opens with blocked storage and allows a new session', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    const storage = vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    const ctx = service().eventContext('blocked-event', 's1', 't1')
    service().captureCompositionWorkspaceOpened(ctx, 'draft')
    service().captureCompositionWorkspaceOpened(ctx, 'draft')
    expect(capture).toHaveBeenCalledTimes(1)
    service().resetSession()
    service().captureCompositionWorkspaceOpened(ctx, 'draft')
    expect(capture).toHaveBeenCalledTimes(2)
    storage.mockRestore()
  })

  it('uses memory when accessing the storage object itself throws', async () => {
    environment.posthogApiKey = 'phc_test'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    const storage = vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => { throw new Error('denied') })
    try {
      const ctx = service().eventContext('denied-storage', 's1', 't1')
      service().captureCompositionWorkspaceOpened(ctx, 'draft')
      service().captureCompositionWorkspaceOpened(ctx, 'draft')
      expect(capture).toHaveBeenCalledTimes(1)
    } finally {
      storage.mockRestore()
    }
  })

  it('sets the organizer trait for enriched FR47 events but never for member scope', async () => {
    environment.posthogApiKey = 'phc_test'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000009')
    identify.mockClear()
    const ctx = service().eventContext('trait-event', 's1', 't1')
    const props = { is_proxy: false, opened_at: 'opened', submitted_at: 'submitted' }
    service().captureAvailabilityFirstSubmission({ ...ctx, actor_scope: 'member' }, props)
    expect(identify).not.toHaveBeenCalled()
    service().captureAvailabilityFirstSubmission({ ...ctx, actor_scope: 'event_organizer' }, props)
    expect(identify).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000009', { has_ever_organized: true })
  })

  it('projects contaminated FR47 contexts and properties onto the approved keys', async () => {
    environment.posthogApiKey = 'phc_test'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(true)
    await service().bootstrap()
    const ctx = { ...service().eventContext('privacy-event', 's1', 't1'), email: 'forbidden', participant_id: 'forbidden' }
    const availability = { is_proxy: false, opened_at: 'opened', submitted_at: 'submitted', message: 'forbidden' }
    service().captureAvailabilityFirstSubmission(ctx, availability)
    service().captureCompositionValidated(ctx, { validated_at: 'validated', message: 'forbidden' } as never)
    service().captureCompositionAllConfirmationsReceived(ctx, { validated_at: 'validated', completed_at: 'complete', message: 'forbidden' } as never)
    service().captureNotificationLinkOpened(ctx, { link_tab: 'dispos', message: 'forbidden' } as never)
    expect(capture.mock.calls.map(([, props]) => props)).toEqual([
      { ...service().eventContext('privacy-event', 's1', 't1'), is_proxy: false, opened_at: 'opened', submitted_at: 'submitted' },
      { ...service().eventContext('privacy-event', 's1', 't1'), validated_at: 'validated' },
      { ...service().eventContext('privacy-event', 's1', 't1'), validated_at: 'validated', completed_at: 'complete' },
      { ...service().eventContext('privacy-event', 's1', 't1'), link_tab: 'dispos' },
    ])
  })

  it('captures v2_cutover_referral_landing once per session from URL params', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    window.history.replaceState({}, '', '/?src=v1_cutover&ph_ref=ph-anon-123')
    await service().bootstrap()
    expect(identify).toHaveBeenCalledWith('ph-anon-123')
    expect(capture).toHaveBeenCalledWith(V2_CUTOVER_REFERRAL_LANDING, {
      src: V1_CUTOVER_SRC,
      ph_ref: 'ph-anon-123',
    })
    expect(sessionStorage.getItem('hatcast:v1-cutover-ph-ref')).toBe('ph-anon-123')
    expect(window.location.search).not.toContain('ph_ref')
    expect(window.location.search).not.toContain('src=v1_cutover')

    capture.mockClear()
    identify.mockClear()
    service().captureV1CutoverReferralFromUrl()
    expect(capture).not.toHaveBeenCalled()
    expect(identify).not.toHaveBeenCalled()
  })

  it('does not capture referral landing without src=v1_cutover', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    window.history.replaceState({}, '', '/?ph_ref=orphan')
    await service().bootstrap()
    expect(identify).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalledWith(
      V2_CUTOVER_REFERRAL_LANDING,
      expect.anything(),
    )
  })

  it('cleans cutover URL when src=v1_cutover but ph_ref is missing', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    window.history.replaceState({}, '', '/?src=v1_cutover')
    await service().bootstrap()
    expect(identify).not.toHaveBeenCalled()
    expect(capture).not.toHaveBeenCalledWith(
      V2_CUTOVER_REFERRAL_LANDING,
      expect.anything(),
    )
    expect(window.location.search).not.toContain('src=v1_cutover')
  })

  it('aliases ph_ref and enriches v2_migration_first_session after identify', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    sessionStorage.setItem('hatcast:v1-cutover-ph-ref', 'ph-anon-456')
    await service().bootstrap()
    const userId = '00000000-0000-4000-8000-000000000001'
    clearV2MigrationDedupe(userId)
    service().identifyUser(userId, { email: 'alice@example.com', displayName: 'Alice' })
    expect(alias).toHaveBeenCalledWith(userId, 'ph-anon-456')
    expect(identify).toHaveBeenCalledWith(userId, {
      email: 'alice@example.com',
      name: 'Alice',
      v1_cutover_ph_ref: 'ph-anon-456',
    })
    expect(capture).toHaveBeenCalledWith(
      V2_MIGRATION_FIRST_SESSION,
      expect.objectContaining({
        user_id: userId,
        ph_ref: 'ph-anon-456',
        src: V1_CUTOVER_SRC,
      }),
    )
  })

  it('aliases ph_ref only once per session on repeated identify', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    sessionStorage.setItem('hatcast:v1-cutover-ph-ref', 'ph-anon-dedupe')
    await service().bootstrap()
    const userId = '00000000-0000-4000-8000-000000000001'
    clearV2MigrationDedupe(userId)
    service().identifyUser(userId)
    service().identifyUser(userId)
    expect(alias).toHaveBeenCalledTimes(1)
    expect(alias).toHaveBeenCalledWith(userId, 'ph-anon-dedupe')
  })

  it('identify without ph_ref does not alias', async () => {
    environment.posthogApiKey = 'phc_test'
    environment.posthogApiHost = 'https://e.hatcast.app'
    vi.spyOn(await import('./posthog-browser.client'), 'initPostHogBrowser').mockResolvedValue(
      true,
    )
    await service().bootstrap()
    service().identifyUser('00000000-0000-4000-8000-000000000002')
    expect(alias).not.toHaveBeenCalled()
  })

  it('cutover URL with ph_ref is no-op analytics when PostHog disabled', async () => {
    environment.posthogApiKey = ''
    window.history.replaceState({}, '', '/?src=v1_cutover&ph_ref=ph-anon-789')
    await service().bootstrap()
    expect(capture).not.toHaveBeenCalled()
    expect(identify).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('hatcast:v1-cutover-ph-ref')).toBeNull()
    expect(window.location.search).not.toContain('ph_ref')
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
