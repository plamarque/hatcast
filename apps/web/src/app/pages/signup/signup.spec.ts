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
import { Signup } from './signup'

const createUserWithEmailAndPassword = vi.fn()

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args: unknown[]) => createUserWithEmailAndPassword(...args),
}))

describe('Signup', () => {
  let fixture: ComponentFixture<Signup>
  let snackOpen: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    createUserWithEmailAndPassword.mockReset()
    snackOpen = vi.fn()
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
          useValue: { navigateAfterSignIn: vi.fn().mockResolvedValue(true) },
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
