import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { sendPasswordResetEmail } from 'firebase/auth'
import { describe, expect, it, vi } from 'vitest'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { getPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { AccountPlaceholder } from './account-placeholder'

vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: vi.fn(),
}))

describe('AccountPlaceholder', () => {
  const sendPasswordReset = vi.mocked(sendPasswordResetEmail)

  async function setup(options: {
    session?: { ok: boolean; status: number; data?: { user: Record<string, unknown> } }
    hasGoogleAccount?: boolean
    routerUrl?: string
    firebaseConfigured?: boolean
  } = {}) {
    const snack = { open: vi.fn() }
    const navigate = vi.fn().mockResolvedValue(true)
    const logout = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    sendPasswordReset.mockReset().mockResolvedValue(undefined)

    const user = {
      id: 'u1',
      email: 'lea@example.com',
      displayName: 'Léa Martin',
      hasGoogleAccount: options.hasGoogleAccount ?? false,
      ...(options.session?.data?.user ?? {}),
    }

    await TestBed.configureTestingModule({
      imports: [AccountPlaceholder, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: MatSnackBar, useValue: snack },
        { provide: AuthApiService, useValue: {} },
        {
          provide: FirebaseAuthService,
          useValue: {
            getAuthOrNull: () =>
              options.firebaseConfigured === false ? null : ({} as never),
          },
        },
      ],
    }).compileComponents()

    const authApi = {
      ensureHatcastSession: vi.fn().mockResolvedValue(
        options.session ?? {
          ok: true,
          status: 200,
          data: { user },
        },
      ),
      logout,
      uploadAvatar: vi.fn(),
      importGoogleAvatar: vi.fn(),
      deleteAvatar: vi.fn(),
    }
    TestBed.overrideProvider(AuthApiService, { useValue: authApi })
    TestBed.overrideProvider(MatSnackBar, { useValue: snack })

    const router = TestBed.inject(Router)
    vi.spyOn(router, 'navigate').mockImplementation(navigate)
    if (options.routerUrl) {
      Object.defineProperty(router, 'url', {
        value: options.routerUrl,
        configurable: true,
      })
    }

    const fixture = TestBed.createComponent(AccountPlaceholder)
    fixture.detectChanges()

    for (let i = 0; i < 30; i++) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      fixture.detectChanges()
      if (!fixture.componentInstance['loading']()) {
        break
      }
    }

    return { fixture, snack, navigate, logout }
  }

  it('affiche le titre et le sous-titre hub membre', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Mon compte')
    expect(text).toContain('Identité, sécurité et préférences')
  })

  it('propose un menu sur l’avatar pour la photo', async () => {
    const { fixture } = await setup()
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="account-avatar-menu-trigger"]',
    ) as HTMLButtonElement
    expect(trigger).toBeTruthy()
    trigger.click()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(
      document.querySelector('[data-testid="account-avatar-choose"]'),
    ).toBeTruthy()
    expect(document.body.textContent).toContain('Choisir une photo')
    expect(fixture.nativeElement.textContent).not.toContain('Choisir une image')
  })

  it('affiche la zone identité avec e-mail et displayName', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('lea@example.com')
    expect(text).toContain('Léa Martin')
    expect(text).not.toContain('Photo de profil')
  })

  it('n’affiche pas pseudo ni rôles par troupe', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).not.toContain('Pseudo par troupe')
    expect(text).not.toContain('Rôles préférés par troupe')
    expect(text).not.toContain('Retour aux troupes')
    expect(text).not.toContain('prochaine livraison')
    expect(text).not.toContain('Préférences par troupe')
  })

  it('affiche les préférences notifications en placeholder', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain('Notifications')
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-notif-availability-email"]'),
    ).toBeTruthy()
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-notif-push"]'),
    ).toBeTruthy()
  })

  it('envoie un e-mail de réinitialisation du mot de passe', async () => {
    const { fixture, snack } = await setup()
    await fixture.componentInstance['requestPasswordReset']()
    expect(sendPasswordReset).toHaveBeenCalledWith(
      expect.anything(),
      'lea@example.com',
      expect.objectContaining({
        url: expect.stringContaining('/reinitialiser-mot-de-passe'),
        handleCodeInApp: false,
      }),
    )
    expect(snack.open).toHaveBeenCalledWith(
      expect.stringContaining('lea@example.com'),
      'OK',
      expect.objectContaining({ duration: 8000 }),
    )
  })

  it('affiche les placeholders e-mail et suppression', async () => {
    const { fixture } = await setup()
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-change-email"]'),
    ).toBeTruthy()
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-reset-password"]'),
    ).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="account-delete"]')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Supprimer mon compte')
  })

  it('indique la connexion Google à la place du mot de passe', async () => {
    const { fixture } = await setup({ hasGoogleAccount: true })
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-reset-password"]'),
    ).toBeNull()
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-google-password-hint"]'),
    ).toBeTruthy()
    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="account-avatar-menu-trigger"]',
    ) as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(document.querySelector('[data-testid="account-avatar-google"]')).toBeTruthy()
  })

  it('utilise le displayName compte pour l’avatar, pas le pseudo troupe', async () => {
    const { fixture } = await setup()
    expect(fixture.componentInstance['avatarDisplayName']()).toBe('Léa Martin')
  })

  it('déconnecte et redirige vers connexion', async () => {
    const { fixture, logout, navigate } = await setup()
    await fixture.componentInstance['logout']()
    expect(logout).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })

  it('redirige vers connexion avec snackbar si la session est invalide', async () => {
    const { fixture, snack, navigate } = await setup({
      session: { ok: false, status: 401 },
      routerUrl: '/compte',
    })

    for (let i = 0; i < 30; i++) {
      if (navigate.mock.calls.length > 0) break
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
    expect(getPendingPostLoginRedirect()).toBe('/compte')
    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })
})
