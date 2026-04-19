import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

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
})
