import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { MePushApiService } from './me-push-api.service'
import { PushNotificationsService } from './push-notifications.service'

describe('PushNotificationsService', () => {
  const getStatus = vi.fn()
  const registerSubscription = vi.fn()
  const deleteSubscription = vi.fn()
  const setEnabled = vi.fn()
  const getPublicConfig = vi.fn()

  beforeEach(() => {
    getStatus.mockReset()
    registerSubscription.mockReset()
    deleteSubscription.mockReset()
    setEnabled.mockReset()
    getPublicConfig.mockReset()

    TestBed.configureTestingModule({
      providers: [
        PushNotificationsService,
        {
          provide: MePushApiService,
          useValue: { getStatus, registerSubscription, deleteSubscription, setEnabled, getPublicConfig },
        },
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function service(): PushNotificationsService {
    return TestBed.inject(PushNotificationsService)
  }

  function mockServiceWorker(pushManager: { getSubscription: ReturnType<typeof vi.fn> }) {
    const registration = { active: {}, pushManager }
    return {
      getRegistration: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
    }
  }

  it('canUsePush returns false when PushManager is missing', () => {
    vi.stubGlobal('PushManager', undefined)
    expect(service().canUsePush()).toBe(false)
  })

  it('canUsePush returns true when PushManager and serviceWorker exist', () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: {} })
    expect(service().canUsePush()).toBe(true)
  })

  it('loadStatus returns disabled when no service worker is registered', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue(undefined),
        ready: new Promise(() => undefined),
      },
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('disabled')
  })

  it('loadStatus returns denied when Notification permission is denied', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'denied' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({ getSubscription: vi.fn().mockResolvedValue(null) }),
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('denied')
    expect(setEnabled).not.toHaveBeenCalled()
  })

  it('loadStatus removes the current device subscription when permission is denied', async () => {
    const unsubscribe = vi.fn().mockResolvedValue(true)
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'denied' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({
        getSubscription: vi.fn().mockResolvedValue({ endpoint: 'https://example.com/push', unsubscribe }),
      }),
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: true, subscriptionCount: 1 } })
    deleteSubscription.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('denied')
    expect(deleteSubscription).toHaveBeenCalledWith('https://example.com/push')
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('loadStatus returns enabled when API and local subscription agree', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({
        getSubscription: vi.fn().mockResolvedValue({ endpoint: 'https://example.com/push' }),
      }),
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: true, subscriptionCount: 1 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('enabled')
    expect(service().uiState()).toBe('enabled')
  })

  it('loadStatus returns disabled when the server is enabled but this device has no subscription', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({
        getSubscription: vi.fn().mockResolvedValue(null),
      }),
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: true, subscriptionCount: 1 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('disabled')
  })

  it('loadStatus returns disabled when this device has a subscription that is not registered server-side', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted' })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({
        getSubscription: vi.fn().mockResolvedValue({ endpoint: 'https://example.com/push' }),
      }),
    })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })

    const result = await service().loadStatus()
    expect(result.state).toBe('disabled')
  })

  it('enable returns denied when permission is not granted', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: mockServiceWorker({
        getSubscription: vi.fn().mockResolvedValue(null),
      }),
    })
    deleteSubscription.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })
    setEnabled.mockResolvedValue({ ok: true, status: 200, data: { enabled: false, subscriptionCount: 0 } })

    const result = await service().enable()
    expect(result.ok).toBe(false)
    expect(result.state).toBe('denied')
  })

  it('enable returns error when no service worker becomes available', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', {
      permission: 'default',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    })
    vi.stubGlobal('navigator', {
      ...navigator,
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue(undefined),
        ready: new Promise(() => undefined),
      },
    })
    getPublicConfig.mockResolvedValue({
      ok: true,
      status: 200,
      data: { webPushVapidPublicKey: 'test-vapid-public-key' },
    })

    const pending = service().enable()
    await vi.runAllTimersAsync()
    const result = await pending

    expect(result.ok).toBe(false)
    expect(result.state).toBe('error')
    expect(result.message).toContain('Service worker indisponible')
    expect(registerSubscription).not.toHaveBeenCalled()
  })
})
