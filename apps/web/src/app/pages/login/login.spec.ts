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
import { environment } from '../../../environments/environment'
import { Login } from './login'

const PO_VIDEO_GUIDES = {
  member: 'https://drive.google.com/file/d/1MHLED9mJYjNQLO8OClFTzwDrSnRdsGKD/view?usp=drive_link',
  organizer: 'https://drive.google.com/file/d/1rDz8fAt5fYEZnfD9vooXTsqAUxuF6UNu/view?usp=drive_link',
  admin: 'https://drive.google.com/file/d/18Es9X-yZIamdo2gkJOCjKVKYV_rISa69/view?usp=sharing',
} as const

const defaultVideoGuides = { ...environment.onboardingVideoGuides }

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
    environment.onboardingVideoGuides = { member: '', organizer: '', admin: '' }
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
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
    environment.onboardingVideoGuides = { ...defaultVideoGuides }
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
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
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
    environment.onboardingVideoGuides = { member: '', organizer: '', admin: '' }
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
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
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
    environment.onboardingVideoGuides = { ...defaultVideoGuides }
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

describe('Login video guides', () => {
  let fixture: ComponentFixture<Login>

  beforeEach(async () => {
    environment.onboardingVideoGuides = { ...PO_VIDEO_GUIDES }

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        {
          provide: AuthApiService,
          useValue: {
            ensureHatcastSession: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
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
            snapshot: { queryParamMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Login)
  })

  afterEach(() => {
    environment.onboardingVideoGuides = { ...defaultVideoGuides }
    TestBed.resetTestingModule()
  })

  it('renders three external guide links with safe new-tab attributes', () => {
    fixture.detectChanges()

    const section = fixture.nativeElement.querySelector('.auth__video-guides')
    expect(section).toBeTruthy()
    expect(section.querySelector('#login-video-guides-heading')?.textContent?.trim()).toBe('Guides vidéo')

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('.auth__video-guides a.auth__video-guide-link'),
    ) as HTMLAnchorElement[]

    expect(links).toHaveLength(3)
    expect(links.map((link) => link.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'play_circle Guide membre',
      'play_circle Guide organisateur',
      'play_circle Guide administrateur',
    ])
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      PO_VIDEO_GUIDES.member,
      PO_VIDEO_GUIDES.organizer,
      PO_VIDEO_GUIDES.admin,
    ])

    for (const link of links) {
      expect(link.getAttribute('target')).toBe('_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('rel')).toContain('noreferrer')
      expect(link.getAttribute('aria-label')).toMatch(/\(nouvel onglet\)$/)
    }
  })

  it('hides the guides block when all URLs are empty', () => {
    environment.onboardingVideoGuides = { member: '', organizer: '', admin: '' }
    fixture.detectChanges()

    expect(fixture.nativeElement.querySelector('.auth__video-guides')).toBeNull()
  })
})
