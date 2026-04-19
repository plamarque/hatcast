import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'

import { AuthApiService } from './auth-api.service'
import { FirebaseAuthService } from './firebase-auth.service'

describe('AuthApiService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
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
})
