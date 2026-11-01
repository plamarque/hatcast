import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { MePushApiService } from './me-push-api.service'
import { PushNotificationsService } from './push-notifications.service'

describe('PushNotificationsService', () => {
  const getStatus = vi.fn()
  const ownsSubscription = vi.fn()
  const registerSubscription = vi.fn()
  const deleteSubscription = vi.fn()
  const setEnabled = vi.fn()
  const getPublicConfig = vi.fn()

  beforeEach(() => {
    getStatus.mockReset()
    ownsSubscription.mockReset()
    ownsSubscription.mockResolvedValue({ ok: true, status: 200, data: { owned: true } })
    registerSubscription.mockReset()
    deleteSubscription.mockReset()
    setEnabled.mockReset()
    getPublicConfig.mockReset()

    TestBed.configureTestingModule({
      providers: [
        PushNotificationsService,
        {
          provide: MePushApiService,
          useValue: { getStatus, ownsSubscription, registerSubscription, deleteSubscription, setEnabled, getPublicConfig },
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

  function mockServiceWorker(pushManager: { getSubscription: ReturnType<typeof vi.fn>; subscribe?: ReturnType<typeof vi.fn> }) {
    const registration = { active: {}, pushManager }
    return {
      getRegistration: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
    }
  }

  it('registers an existing Advent device without changing global push settings or requesting permission', async () => {
    const json = { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } }
    const requestPermission = vi.fn()
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted', requestPermission })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker({ getSubscription: vi.fn().mockResolvedValue({ endpoint: json.endpoint, toJSON: () => json }) }) })
    const register = vi.fn().mockResolvedValue(true)
    expect(await service().activateAdventDevice(register)).toEqual({ endpoint: json.endpoint })
    expect(register).toHaveBeenCalledWith(json)
    expect(requestPermission).not.toHaveBeenCalled()
    expect(registerSubscription).not.toHaveBeenCalled()
    expect(deleteSubscription).not.toHaveBeenCalled()
    expect(setEnabled).not.toHaveBeenCalled()
  })

  it('does not ask again or mutate subscriptions when Advent permission is denied', async () => {
    const requestPermission = vi.fn()
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'denied', requestPermission })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker({ getSubscription: vi.fn() }) })
    const register = vi.fn()
    expect((await service().activateAdventDevice(register)).endpoint).toBeUndefined()
    expect(requestPermission).not.toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
    expect(deleteSubscription).not.toHaveBeenCalled()
    expect(setEnabled).not.toHaveBeenCalled()
  })

  it('asks on the gesture and registers a newly granted Advent subscription', async () => {
    const json = { endpoint: 'https://push.example/new-device', keys: { p256dh: 'key', auth: 'auth' } }
    const requestPermission = vi.fn().mockResolvedValue('granted')
    const subscribe = vi.fn().mockResolvedValue({ endpoint: json.endpoint, toJSON: () => json })
    const pushManager = { getSubscription: vi.fn().mockResolvedValue(null), subscribe }
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'default', requestPermission })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker(pushManager) })
    getPublicConfig.mockResolvedValue({ ok: true, data: { webPushVapidPublicKey: 'AQID' } })
    const register = vi.fn().mockResolvedValue(true)
    expect(await service().activateAdventDevice(register)).toEqual({ endpoint: json.endpoint })
    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(subscribe).toHaveBeenCalledWith(expect.objectContaining({ userVisibleOnly: true, applicationServerKey: expect.any(Uint8Array) }))
    expect(register).toHaveBeenCalledWith(json)
    expect(setEnabled).not.toHaveBeenCalled()
  })

  it('does not subscribe or register when a fresh permission request is refused', async () => {
    const requestPermission = vi.fn().mockResolvedValue('denied')
    const subscribe = vi.fn()
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'default', requestPermission })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker({ getSubscription: vi.fn(), subscribe }) })
    const register = vi.fn()
    const result = await service().activateAdventDevice(register)
    expect(result.endpoint).toBeUndefined()
    expect(requestPermission).toHaveBeenCalledTimes(1)
    expect(subscribe).not.toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
  })

  it('does not report activation when Advent device registration fails', async () => {
    const json = { endpoint: 'https://push.example/device', keys: { p256dh: 'key', auth: 'auth' } }
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted', requestPermission: vi.fn() })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker({ getSubscription: vi.fn().mockResolvedValue({ endpoint: json.endpoint, toJSON: () => json }) }) })
    const register = vi.fn().mockRejectedValue(new Error('offline'))
    const result = await service().activateAdventDevice(register)
    expect(result.endpoint).toBeUndefined()
    expect(result.message).toContain('Impossible')
    expect(deleteSubscription).not.toHaveBeenCalled()
    expect(setEnabled).not.toHaveBeenCalled()
  })

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

  it('does not report an Advent-only device as enabled for HatCast when another device is registered', async () => {
    vi.stubGlobal('PushManager', class {})
    vi.stubGlobal('Notification', { permission: 'granted' })
    vi.stubGlobal('navigator', { ...navigator, serviceWorker: mockServiceWorker({ getSubscription: vi.fn().mockResolvedValue({ endpoint: 'https://example.com/advent-only' }) }) })
    getStatus.mockResolvedValue({ ok: true, status: 200, data: { enabled: true, subscriptionCount: 1 } })
    ownsSubscription.mockResolvedValue({ ok: true, status: 200, data: { owned: false } })
    expect((await service().loadStatus()).state).toBe('disabled')
    expect(ownsSubscription).toHaveBeenCalledWith('https://example.com/advent-only')
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
