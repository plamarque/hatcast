import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, provideRouter } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'
import {
  clearPendingPostLoginRedirect,
  getPendingPostLoginRedirect,
  rememberPendingPostLoginRedirect,
} from '../../core/navigation/post-login-redirect-storage'
import { Login } from './login'

const { signInWithEmailAndPassword } = vi.hoisted(() => ({
  signInWithEmailAndPassword: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword,
}))

describe('Login returnUrl', () => {
  let fixture: ComponentFixture<Login>

  beforeEach(async () => {
    localStorage.clear()
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            signInWithGoogleIdToken: vi.fn(),
            signInWithIdentityPlatformIdToken: vi.fn(),
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
                get: (key: string) =>
                  key === 'returnUrl' ? '/saison/festibask/event/e1?showConfirm=true' : null,
              },
            },
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Login)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('stores a valid returnUrl query param on init', () => {
    rememberPendingPostLoginRedirect('/agenda')
    fixture.detectChanges()

    expect(getPendingPostLoginRedirect()).toBe('/saison/festibask/event/e1?showConfirm=true')
  })

  it('clears storage when returnUrl is invalid', async () => {
    TestBed.resetTestingModule()
    localStorage.clear()
    rememberPendingPostLoginRedirect('/agenda')

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            signInWithGoogleIdToken: vi.fn(),
            signInWithIdentityPlatformIdToken: vi.fn(),
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
      ],
    }).compileComponents()

    const invalidFixture = TestBed.createComponent(Login)
    invalidFixture.detectChanges()

    expect(getPendingPostLoginRedirect()).toBeNull()
    clearPendingPostLoginRedirect()
  })
})

describe('Login email IdP', () => {
  let fixture: ComponentFixture<Login>
  let signInWithIdentityPlatformIdToken: ReturnType<typeof vi.fn>
  let signInWithIdentityPlatformIdTokenWithRetry: ReturnType<typeof vi.fn>
  let navigateAfterSignIn: ReturnType<typeof vi.fn>
  let snackOpen: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    localStorage.clear()
    signInWithIdentityPlatformIdToken = vi.fn()
    signInWithIdentityPlatformIdTokenWithRetry = vi.fn()
    navigateAfterSignIn = vi.fn().mockResolvedValue(true)
    snackOpen = vi.fn()
    signInWithEmailAndPassword.mockReset()
    signInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue('login-id-token') },
    })

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            signInWithGoogleIdToken: vi.fn(),
            signInWithIdentityPlatformIdToken,
            signInWithIdentityPlatformIdTokenWithRetry,
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
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Login)
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('uses single-attempt IdP exchange on email login without retry helper', async () => {
    signInWithIdentityPlatformIdToken.mockResolvedValue({ ok: true, status: 200 })

    fixture.detectChanges()
    const component = fixture.componentInstance as Login & {
      signInWithEmail: () => Promise<void>
    }

    component['emailForm'].setValue({
      email: 'user@example.com',
      password: 'password123',
    })

    await component.signInWithEmail()

    expect(signInWithIdentityPlatformIdToken).toHaveBeenCalledWith('login-id-token', true)
    expect(signInWithIdentityPlatformIdToken).toHaveBeenCalledTimes(1)
    expect(signInWithIdentityPlatformIdTokenWithRetry).not.toHaveBeenCalled()
    expect(snackOpen).toHaveBeenCalledWith('Connexion réussie.', 'OK', { duration: 3500 })
    expect(navigateAfterSignIn).toHaveBeenCalled()
  })
})
