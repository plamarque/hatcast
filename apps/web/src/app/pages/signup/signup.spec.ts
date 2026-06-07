import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, provideRouter, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { userMessageForSignupIdpRecovery } from '../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'
import {
  clearPendingPostLoginRedirect,
  getPendingPostLoginRedirect,
  rememberPendingPostLoginRedirect,
} from '../../core/navigation/post-login-redirect-storage'
import { Signup } from './signup'

const { createUserWithEmailAndPassword } = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword,
}))

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>
  let snackOpen: ReturnType<typeof vi.fn>
  let signInWithIdentityPlatformIdTokenWithRetry: ReturnType<typeof vi.fn>
  let navigateAfterSignIn: ReturnType<typeof vi.fn>
  let routerNavigateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    createUserWithEmailAndPassword.mockReset()
    snackOpen = vi.fn()
    signInWithIdentityPlatformIdTokenWithRetry = vi.fn()
    navigateAfterSignIn = vi.fn().mockResolvedValue(true)
    localStorage.clear()

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            signInWithGoogleIdToken: vi.fn(),
            signInWithIdentityPlatformIdToken: vi.fn(),
            signInWithIdentityPlatformIdTokenWithRetry,
            importGoogleAvatar: vi.fn(),
          },
        },
        {
          provide: FirebaseAuthService,
          useValue: {
            hasFirebaseWebConfig: vi.fn().mockReturnValue(true),
            getAuthOrNull: vi.fn().mockReturnValue({}),
          },
        },
        {
          provide: PostLoginNavigationService,
          useValue: { navigateAfterSignIn },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) =>
                  key === 'returnUrl' ? '/agenda?tab=upcoming' : null,
              },
            },
          },
        },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Signup)
    routerNavigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('stores a valid returnUrl query param on init', () => {
    rememberPendingPostLoginRedirect('/connexion')
    fixture.detectChanges()

    expect(getPendingPostLoginRedirect()).toBe('/agenda?tab=upcoming')
  })

  it('shows snackbar and skips IdP when passwords mismatch', async () => {
    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'different456',
    })

    await component.signUpWithEmail()

    expect(snackOpen).toHaveBeenCalledWith(
      'Les deux mots de passe ne correspondent pas.',
      'OK',
      { duration: 6000 },
    )
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('retries IdP exchange and navigates after success on third attempt', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('fresh-id-token') },
    })
    signInWithIdentityPlatformIdTokenWithRetry.mockResolvedValue({ ok: true, status: 200 })

    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    await component.signUpWithEmail()

    expect(signInWithIdentityPlatformIdTokenWithRetry).toHaveBeenCalledWith(
      'fresh-id-token',
      true,
    )
    expect(snackOpen).toHaveBeenCalledWith('Connexion réussie.', 'OK', { duration: 3500 })
    expect(navigateAfterSignIn).toHaveBeenCalled()
    expect(routerNavigateSpy).not.toHaveBeenCalled()
  })

  it('redirects to connexion with recovery message after persistent transient IdP failure', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('fresh-id-token') },
    })
    signInWithIdentityPlatformIdTokenWithRetry.mockResolvedValue({ ok: false, status: 500 })

    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    await component.signUpWithEmail()

    expect(signInWithIdentityPlatformIdTokenWithRetry).toHaveBeenCalledTimes(1)
    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForSignupIdpRecovery(),
      'OK',
      { duration: 8000 },
    )
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/connexion'], {
      queryParams: { returnUrl: '/agenda?tab=upcoming' },
    })
    expect(navigateAfterSignIn).not.toHaveBeenCalled()
  })

  it('redirects to connexion with recovery message after network IdP failure (status 0)', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('fresh-id-token') },
    })
    signInWithIdentityPlatformIdTokenWithRetry.mockResolvedValue({ ok: false, status: 0 })

    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    await component.signUpWithEmail()

    expect(signInWithIdentityPlatformIdTokenWithRetry).toHaveBeenCalledTimes(1)
    expect(snackOpen).toHaveBeenCalledWith(
      userMessageForSignupIdpRecovery(),
      'OK',
      { duration: 8000 },
    )
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/connexion'], {
      queryParams: { returnUrl: '/agenda?tab=upcoming' },
    })
    expect(navigateAfterSignIn).not.toHaveBeenCalled()
  })

  it('does not redirect to login on definitive IdP failure (403)', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('fresh-id-token') },
    })
    signInWithIdentityPlatformIdTokenWithRetry.mockResolvedValue({ ok: false, status: 403 })

    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    await component.signUpWithEmail()

    expect(routerNavigateSpy).not.toHaveBeenCalled()
    expect(snackOpen).toHaveBeenCalledWith(
      'Ce compte n’est pas autorisé à accéder à HatCast.',
      'OK',
      { duration: 8000 },
    )
  })

  it('does not reference deleteUser in signup.ts', () => {
    const src = readFileSync(join(process.cwd(), 'src/app/pages/signup/signup.ts'), 'utf8')
    expect(src).not.toMatch(/\bdeleteUser\b/)
  })

  it('links to connexion with preserved returnUrl in footer', () => {
    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      loginQueryParams: { returnUrl?: string }
    }

    expect(component.loginQueryParams).toEqual({ returnUrl: '/agenda?tab=upcoming' })

    const link = fixture.nativeElement.querySelector(
      'a.auth__text-link[routerlink="/connexion"]',
    ) as HTMLAnchorElement | null

    expect(link).not.toBeNull()
    expect(link?.textContent?.trim()).toBe('Se connecter')
  })
})

describe('Signup returnUrl invalid', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('clears storage when returnUrl is invalid', async () => {
    rememberPendingPostLoginRedirect('/agenda')

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            signInWithGoogleIdToken: vi.fn(),
            signInWithIdentityPlatformIdToken: vi.fn(),
            signInWithIdentityPlatformIdTokenWithRetry: vi.fn(),
          },
        },
        {
          provide: FirebaseAuthService,
          useValue: { hasFirebaseWebConfig: vi.fn().mockReturnValue(false), getAuthOrNull: vi.fn() },
        },
        {
          provide: PostLoginNavigationService,
          useValue: { navigateAfterSignIn: vi.fn().mockResolvedValue(true) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'returnUrl' ? 'https://evil.example' : null),
              },
            },
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    const invalidFixture = TestBed.createComponent(Signup)
    invalidFixture.detectChanges()

    expect(getPendingPostLoginRedirect()).toBeNull()
    clearPendingPostLoginRedirect()
  })
})

describe('Signup IdP retry (AuthApiService)', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  let navigateAfterSignIn: ReturnType<typeof vi.fn>
  let routerNavigateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    navigateAfterSignIn = vi.fn().mockResolvedValue(true)
    createUserWithEmailAndPassword.mockReset()
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('retry-id-token') },
    })

    await TestBed.configureTestingModule({
      imports: [Signup],
      providers: [
        provideRouter([]),
        AuthApiService,
        {
          provide: FirebaseAuthService,
          useValue: {
            hasFirebaseWebConfig: vi.fn().mockReturnValue(true),
            getAuthOrNull: vi.fn().mockReturnValue({}),
          },
        },
        {
          provide: PostLoginNavigationService,
          useValue: { navigateAfterSignIn },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents()

    routerNavigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('calls IdP three times when API returns 503 twice then 200', async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            user: { id: 'u1', slug: 'u1', email: 'new@example.com', displayName: null },
          }),
      })

    const fixture = TestBed.createComponent(Signup)
    fixture.detectChanges()
    const component = fixture.componentInstance as Signup & {
      signUpWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'new@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })

    await component.signUpWithEmail()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(navigateAfterSignIn).toHaveBeenCalled()
    expect(routerNavigateSpy).not.toHaveBeenCalled()
  })
})
