import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

import { MePreferencesApiService } from '../account/me-preferences-api.service'
import { MeInboxApiService } from '../inbox/me-inbox-api.service'
import { TroupeApiService } from '../troupes/troupe-api.service'
import { AuthApiService } from './auth-api.service'
import { FirebaseAuthService } from './firebase-auth.service'

describe('AuthApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
      ],
    })
  })

  function service(): AuthApiService {
    return TestBed.inject(AuthApiService)
  }

  it('signInWithIdentityPlatformIdToken envoie rememberMe true par défaut', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user: { id: 'x', email: null, displayName: null } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().signInWithIdentityPlatformIdToken('token-idp')

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/idp',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ idToken: 'token-idp', rememberMe: true }),
      }),
    )
  })

  it('signInWithIdentityPlatformIdToken envoie rememberMe false quand demandé', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user: { id: 'x', email: null, displayName: null } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().signInWithIdentityPlatformIdToken('token-idp', false)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/idp',
      expect.objectContaining({
        body: JSON.stringify({ idToken: 'token-idp', rememberMe: false }),
      }),
    )
  })

  it('signInWithIdentityPlatformIdTokenWithRetry retente sur 503 puis réussit', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ user: { id: 'u1', email: 'a@b.c', displayName: null } }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().signInWithIdentityPlatformIdTokenWithRetry('token-idp', true, {
      maxAttempts: 3,
      backoffMs: [0, 0],
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(3)
    for (const call of fetchMock.mock.calls) {
      expect(call[1]).toEqual(
        expect.objectContaining({
          body: JSON.stringify({ idToken: 'token-idp', rememberMe: true }),
        }),
      )
    }
  })

  it('signInWithIdentityPlatformIdTokenWithRetry n’applique pas de retry sur 403', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 403 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().signInWithIdentityPlatformIdTokenWithRetry('token-idp', true, {
      maxAttempts: 3,
      backoffMs: [0, 0],
    })

    expect(result.ok).toBe(false)
    expect(result.status).toBe(403)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('signInWithIdentityPlatformIdTokenWithRetry épuise les tentatives sur 500', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await service().signInWithIdentityPlatformIdTokenWithRetry('token-idp', true, {
      maxAttempts: 3,
      backoffMs: [0, 0],
    })

    expect(result.ok).toBe(false)
    expect(result.status).toBe(500)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('signInWithGoogleIdToken envoie rememberMe', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user: { id: 'x', email: null, displayName: null } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await service().signInWithGoogleIdToken('jwt-google', false)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/google',
      expect.objectContaining({
        body: JSON.stringify({ idToken: 'jwt-google', rememberMe: false }),
      }),
    )
  })

  it('logout invalide le cache des préférences et inbox membre', async () => {
    const invalidatePreferences = vi.fn()
    const invalidateInbox = vi.fn()
    const invalidateTroupes = vi.fn()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
        { provide: MePreferencesApiService, useValue: { invalidateCache: invalidatePreferences } },
        {
          provide: MeInboxApiService,
          useValue: { invalidateCache: invalidateInbox, bindSessionUser: vi.fn() },
        },
        { provide: TroupeApiService, useValue: { invalidateCache: invalidateTroupes } },
      ],
    })

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    await TestBed.inject(AuthApiService).logout()

    expect(invalidatePreferences).toHaveBeenCalledTimes(1)
    expect(invalidateInbox).toHaveBeenCalledTimes(1)
    expect(invalidateTroupes).toHaveBeenCalledTimes(1)
  })

  it('logout : POST /v1/auth/logout et efface la préférence « se souvenir de moi » si OK (sans client Firebase)', async () => {
    localStorage.setItem('hatcastRememberMe', '1')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    const ok = await service().logout()

    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
    expect(localStorage.getItem('hatcastRememberMe')).toBeNull()
  })

  it('logout : n’efface pas la préférence si le POST échoue', async () => {
    localStorage.setItem('hatcastRememberMe', '1')
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)

    const ok = await service().logout()

    expect(ok).toBe(false)
    expect(localStorage.getItem('hatcastRememberMe')).toBe('1')
  })

  it('deleteAccount invalide le cache inbox membre', async () => {
    const invalidateInbox = vi.fn()
    const invalidateTroupes = vi.fn()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
        {
          provide: MeInboxApiService,
          useValue: { invalidateCache: invalidateInbox, bindSessionUser: vi.fn() },
        },
        { provide: TroupeApiService, useValue: { invalidateCache: invalidateTroupes } },
      ],
    })

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204 })
    vi.stubGlobal('fetch', fetchMock)

    const result = await TestBed.inject(AuthApiService).deleteAccount('id-token')

    expect(result.ok).toBe(true)
    expect(invalidateInbox).toHaveBeenCalledTimes(1)
    expect(invalidateTroupes).toHaveBeenCalledTimes(1)
  })

  it('ensureHatcastSession réutilise le cache session sans second fetch', async () => {
    const body = {
      user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    })
    vi.stubGlobal('fetch', fetchMock)

    const auth = service()
    const first = await auth.ensureHatcastSession()
    const second = await auth.ensureHatcastSession()

    expect(first.ok).toBe(true)
    expect(second.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('401 invalide le cache session pour le prochain ensureHatcastSession', async () => {
    const body = {
      user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
    vi.stubGlobal('fetch', fetchMock)

    const auth = service()
    const unauthorized = await auth.ensureHatcastSession()
    const authorized = await auth.ensureHatcastSession()

    expect(unauthorized.ok).toBe(false)
    expect(authorized.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('ensureHatcastSession({ force: true }) bypass le cache', async () => {
    const body = {
      user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
    })
    vi.stubGlobal('fetch', fetchMock)

    const auth = service()
    await auth.ensureHatcastSession()
    await auth.ensureHatcastSession({ force: true })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('invalide le cache troupes quand l’utilisateur de session change', async () => {
    const invalidateTroupes = vi.fn()
    const invalidatePreferences = vi.fn()
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        AuthApiService,
        { provide: FirebaseAuthService, useValue: { getAuthOrNull: () => null } },
        { provide: MePreferencesApiService, useValue: { invalidateCache: invalidatePreferences } },
        {
          provide: MeInboxApiService,
          useValue: { invalidateCache: vi.fn(), bindSessionUser: vi.fn() },
        },
        { provide: TroupeApiService, useValue: { invalidateCache: invalidateTroupes } },
      ],
    })

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: { id: 'u1', slug: 'alice', email: null, displayName: 'Alice' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: { id: 'u2', slug: 'bob', email: null, displayName: 'Bob' },
          }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const auth = TestBed.inject(AuthApiService)
    await auth.signInWithIdentityPlatformIdToken('token-1')
    await auth.signInWithIdentityPlatformIdToken('token-2')

    expect(invalidateTroupes).toHaveBeenCalledTimes(1)
    expect(invalidatePreferences).toHaveBeenCalledTimes(1)
  })

  it('ne met pas en cache la session si invalidateSessionCache pendant un GET in-flight', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const auth = service()
    const pending = auth.ensureHatcastSession()
    auth.invalidateSessionCache()
    resolveFetch({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
      }),
    })
    await pending

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
      }),
    })
    await auth.ensureHatcastSession()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('logout efface le cache session pour le prochain ensureHatcastSession', async () => {
    const body = {
      user: { id: 'u1', slug: 'pat', email: 'a@b.c', displayName: 'Pat' },
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(body),
      })
    vi.stubGlobal('fetch', fetchMock)

    const auth = service()
    await auth.ensureHatcastSession()
    await auth.logout()
    await auth.ensureHatcastSession()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls.filter((call) => call[0] === '/v1/auth/me')).toHaveLength(2)
  })

  it('uploadAvatar envoie multipart avec CSRF', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-avatar; path=/'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          user: { id: 'u1', email: null, displayName: 'Pat', avatarUrl: '/v1/users/u1/avatar?v=1' },
        }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' })
    await service().uploadAvatar(file)

    expect(fetchMock).toHaveBeenCalledWith(
      '/v1/auth/me/avatar',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-avatar' }),
      }),
    )
  })
})
