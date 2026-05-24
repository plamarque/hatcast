import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, provideRouter } from '@angular/router'
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
