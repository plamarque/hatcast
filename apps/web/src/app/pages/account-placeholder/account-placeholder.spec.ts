import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router, RouterOutlet } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AppVersionService } from '../../core/app/app-version.service'
import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { MemberDisplayNameService } from '../../core/account/member-display-name.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { ChangelogDialogService } from '../../shared/changelog/changelog-dialog.service'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { getPendingPostLoginRedirect, clearPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { AccountPlaceholder } from './account-placeholder'
import { AccountAboutTab } from './tabs/account-about-tab'
import { AccountIdentityTab } from './tabs/account-identity-tab'
import { AccountNotificationsTab } from './tabs/account-notifications-tab'
import { AccountPreferencesTab } from './tabs/account-preferences-tab'
import { AccountSecurityTab } from './tabs/account-security-tab'
import { AccountChangeEmailDialog } from './dialogs/account-change-email-dialog'
import { AccountChangePasswordDialog } from './dialogs/account-change-password-dialog'
import { AccountDeleteDialog } from './dialogs/account-delete-dialog'

@Component({ template: '<router-outlet />', imports: [RouterOutlet] })
class AccountRouteHost {}

const accountRoutes = [
  { path: 'connexion', component: AccountRouteHost },
  {
    path: 'compte',
    component: AccountPlaceholder,
    children: [
      { path: '', component: AccountIdentityTab },
      { path: 'preferences', component: AccountPreferencesTab },
      { path: 'notifications', component: AccountNotificationsTab },
      { path: 'securite', component: AccountSecurityTab },
      { path: 'a-propos', component: AccountAboutTab },
      { path: '**', redirectTo: '' },
    ],
  },
]

describe('AccountPlaceholder', () => {
  async function setup(options: {
    session?: { ok: boolean; status: number; data?: { user: Record<string, unknown> } }
    hasGoogleAccount?: boolean
    hasPasswordProvider?: boolean
    routerUrl?: string
    appVersion?: string
  } = {}) {
    const snack = { open: vi.fn() }
    const navigate = vi.fn().mockResolvedValue(true)
    const logout = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const openChangelog = vi.fn()
    const dialogOpen = vi.fn()
    const getPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Léa', preferredRoleKeys: ['volunteer', 'player'] },
    })
    const patchPreferences = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { memberDisplayName: 'Léa B', preferredRoleKeys: ['volunteer', 'player'] },
    })
    const memberDisplayNameSignal = signal('Léa')
    const loadMemberDisplayName = vi.fn().mockImplementation(async () => {
      memberDisplayNameSignal.set('Léa')
      return true
    })

    const user = {
      id: 'u1',
      email: 'lea@example.com',
      displayName: 'Léa Martin',
      hasGoogleAccount: options.hasGoogleAccount ?? false,
      ...(options.session?.data?.user ?? {}),
    }

    const providerData =
      options.hasPasswordProvider === true
        ? [{ providerId: 'password' }]
        : options.hasGoogleAccount
          ? [{ providerId: 'google.com' }]
          : [{ providerId: 'password' }]

    await TestBed.configureTestingModule({
      imports: [AccountRouteHost, NoopAnimationsModule],
      providers: [
        provideRouter(accountRoutes),
        { provide: MatSnackBar, useValue: snack },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        {
          provide: FirebaseAuthService,
          useValue: {
            getAuthOrNull: () => ({
              currentUser: { providerData, email: user.email },
            }),
          },
        },
        {
          provide: TroupeContextService,
          useValue: {
            load: vi.fn().mockResolvedValue(true),
            activeTroupes: () => [
              {
                id: 't1',
                name: 'Les Improbots',
                slug: 'les-improbots',
                isDemo: false,
                joinPolicy: 'OPEN' as const,
                membership: {
                  id: 'm1',
                  displayName: 'Léa',
                  status: 'ACTIVE' as const,
                  baselineRole: 'MEMBER' as const,
                  createdAt: '',
                  updatedAt: '',
                },
                activeMemberCount: 3,
                upcomingEventCount: 1,
              },
            ],
            patchMembershipDisplayName: vi.fn(),
          },
        },
        {
          provide: TroupeApiService,
          useValue: { updateMyMembership: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { displayName: 'Léa' } }) },
        },
        {
          provide: MemberProfileApiService,
          useValue: {
            getPreferredRoles: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { preferredRoleKeys: ['volunteer', 'player'] },
            }),
            updatePreferredRoles: vi.fn().mockResolvedValue({
              ok: true,
              status: 200,
              data: { preferredRoleKeys: ['volunteer', 'player'] },
            }),
          },
        },
        { provide: AuthApiService, useValue: {} },
        {
          provide: MePreferencesApiService,
          useValue: { getPreferences, patchPreferences },
        },
        {
          provide: MemberDisplayNameService,
          useValue: {
            memberDisplayName: memberDisplayNameSignal,
            loadFromApi: loadMemberDisplayName,
            syncSessionUser: vi.fn(),
            setFromSave: (value: string) => memberDisplayNameSignal.set(value.trim()),
            railLabel: (user: { email?: string | null } | null) => {
              const pseudo = memberDisplayNameSignal().trim()
              return pseudo || user?.email?.trim() || 'Compte'
            },
          },
        },
        {
          provide: AppVersionService,
          useValue: {
            version: signal(options.appVersion ?? '0.0.0'),
            ensureLoaded: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ChangelogDialogService,
          useValue: { open: openChangelog, maybeAutoOpenAfterPwaUpdate: vi.fn() },
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

    const fixture = TestBed.createComponent(AccountRouteHost)
    fixture.detectChanges()
    await router.navigateByUrl(options.routerUrl ?? '/compte')
    fixture.detectChanges()

    for (let i = 0; i < 50; i++) {
      await fixture.whenStable()
      await new Promise((resolve) => setTimeout(resolve, 0))
      fixture.detectChanges()
      const identityReady =
        fixture.nativeElement.querySelector('[data-testid="account-avatar-menu-trigger"]') &&
        (fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]') ||
          fixture.nativeElement.querySelector('.account-page__pseudo-spinner'))
      if (identityReady) {
        if (fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]')) {
          break
        }
      }
      if (
        options.session?.ok === false &&
        (snack.open.mock.calls.length > 0 ||
          navigate.mock.calls.some((call) => call[0]?.[0] === '/connexion'))
      ) {
        break
      }
    }

    return { fixture, snack, navigate, logout, openChangelog, router, dialogOpen, getPreferences, patchPreferences }
  }

  it('affiche le titre et le sous-titre hub membre', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Mon compte')
    expect(text).toContain('Paramètres de votre compte HatCast.')
  })

  it('affiche les cinq onglets de navigation', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Identité')
    expect(text).toContain('Préférences')
    expect(text).toContain('Notifications')
    expect(text).toContain('Sécurité')
    expect(text).toContain('À propos')
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

  it('affiche la zone identité avec e-mail, displayName et pseudo éditable', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('lea@example.com')
    expect(text).toContain('Léa Martin')
    expect(text).toContain('Nom affiché dans toutes vos troupes.')
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]'),
    ).toBeTruthy()
    expect(text).not.toContain('Photo de profil')
  })

  it('navigue vers chaque onglet via la barre d’onglets', async () => {
    const { fixture, router } = await setup()

    const clickTab = (label: string) => {
      const links = fixture.nativeElement.querySelectorAll('a[mat-tab-link]')
      const link = Array.from(links as NodeListOf<HTMLAnchorElement>).find((a) =>
        a.textContent?.trim().includes(label),
      )
      expect(link).toBeTruthy()
      link!.click()
      fixture.detectChanges()
    }

    clickTab('Notifications')
    await fixture.whenStable()
    expect(router.url).toContain('/compte/notifications')
    const pushSection =
      fixture.nativeElement.querySelector('[data-testid="push-notifications-toggle"]') ??
      fixture.nativeElement.querySelector('[data-testid="push-notifications-unsupported"]')
    expect(pushSection).toBeTruthy()

    clickTab('Préférences')
    await fixture.whenStable()
    expect(router.url).toContain('/compte/preferences')
    expect(fixture.nativeElement.querySelector('[data-testid="member-preferences-save"]')).toBeTruthy()

    clickTab('Sécurité')
    await fixture.whenStable()
    expect(router.url).toContain('/compte/securite')
    expect(fixture.nativeElement.querySelector('[data-testid="account-change-email"]')).toBeTruthy()

    clickTab('À propos')
    await fixture.whenStable()
    expect(router.url).toContain('/compte/a-propos')
    expect(fixture.nativeElement.querySelector('[data-testid="account-app-version"]')).toBeTruthy()
  })

  it('n’affiche pas le pseudo sur Préférences (rôles seuls)', async () => {
    const { fixture, router } = await setup()
    await router.navigateByUrl('/compte/preferences')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const text = fixture.nativeElement.textContent ?? ''
    expect(text).not.toContain('Nom affiché dans toutes vos troupes.')
    expect(text).not.toContain('Pseudo par troupe')
    expect(text).not.toContain('Rôles préférés par troupe')
    expect(text).not.toContain('Retour aux troupes')
    expect(text).not.toContain('prochaine livraison')
    expect(fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]')).toBeNull()
  })

  it('affiche les rôles globaux sur l’onglet Préférences', async () => {
    const { fixture, router } = await setup()
    await router.navigateByUrl('/compte/preferences')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Rôles préférés')
    expect(
      fixture.nativeElement.querySelector('[data-testid="member-preferences-save"]'),
    ).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="account-troupe-preferences"]')).toBeNull()
  })

  it('active le changement de mot de passe sur Sécurité', async () => {
    const { fixture, router, dialogOpen } = await setup()
    await router.navigateByUrl('/compte/securite')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const button = fixture.nativeElement.querySelector(
      '[data-testid="account-reset-password"]',
    ) as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('Changer le mot de passe')
    expect(button.disabled).toBe(false)
    button.click()
    expect(dialogOpen).toHaveBeenCalledWith(
      AccountChangePasswordDialog,
      expect.objectContaining({
        data: expect.objectContaining({ hasPasswordProvider: true }),
      }),
    )
  })

  it('active le changement d’e-mail et la suppression de compte sur Sécurité', async () => {
    const { fixture, router, dialogOpen } = await setup()
    await router.navigateByUrl('/compte/securite')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const emailButton = fixture.nativeElement.querySelector(
      '[data-testid="account-change-email"]',
    ) as HTMLButtonElement
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-testid="account-delete"]',
    ) as HTMLButtonElement
    expect(emailButton).toBeTruthy()
    expect(emailButton.disabled).toBe(false)
    emailButton.click()
    expect(dialogOpen).toHaveBeenCalledWith(
      AccountChangeEmailDialog,
      expect.objectContaining({
        data: { currentEmail: 'lea@example.com' },
      }),
    )

    expect(deleteButton).toBeTruthy()
    expect(deleteButton.disabled).toBe(false)
    expect(deleteButton.textContent).toContain('Supprimer mon compte')
    expect(fixture.nativeElement.textContent).not.toContain('Bientôt')
    deleteButton.click()
    expect(dialogOpen).toHaveBeenCalledWith(
      AccountDeleteDialog,
      expect.objectContaining({
        data: expect.objectContaining({
          accountEmail: 'lea@example.com',
        }),
      }),
    )
    expect(fixture.nativeElement.textContent).toContain('Zone sensible')
  })

  it('Google-only : ligne mot de passe activée avec Définir et hint secours', async () => {
    const { fixture, router, dialogOpen } = await setup({ hasGoogleAccount: true })
    await router.navigateByUrl('/compte/securite')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const passwordButton = fixture.nativeElement.querySelector(
      '[data-testid="account-reset-password"]',
    ) as HTMLButtonElement
    expect(passwordButton).toBeTruthy()
    expect(passwordButton.disabled).toBe(false)
    expect(passwordButton.textContent).toContain('Définir un mot de passe')
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-google-password-hint"]'),
    ).toBeTruthy()
    passwordButton.click()
    expect(dialogOpen).toHaveBeenCalledWith(
      AccountChangePasswordDialog,
      expect.objectContaining({
        data: expect.objectContaining({ hasPasswordProvider: false }),
      }),
    )

    await router.navigateByUrl('/compte')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

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
    expect(fixture.nativeElement.textContent).toContain('Léa Martin')
  })

  it('affiche la version dans À propos et ouvre le changelog au clic', async () => {
    const { fixture, router, openChangelog } = await setup({ appVersion: '2.1.0' })
    await router.navigateByUrl('/compte/a-propos')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    const versionButton = fixture.nativeElement.querySelector(
      '[data-testid="account-app-version"]',
    ) as HTMLButtonElement
    expect(versionButton).toBeTruthy()
    expect(versionButton.textContent).toContain('v2.1.0')

    versionButton.click()
    expect(openChangelog).toHaveBeenCalled()
  })

  it('redirige une route enfant /compte inconnue vers Identité', async () => {
    const { fixture, router } = await setup()
    await router.navigateByUrl('/compte/unknown')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()

    expect(router.url).toContain('/compte')
    expect(router.url).not.toContain('/compte/unknown')
    expect(
      fixture.nativeElement.querySelector('[data-testid="account-avatar-menu-trigger"]'),
    ).toBeTruthy()
  })

  it('redirige /compte#notifications vers /compte/notifications', async () => {
    const { navigate } = await setup({ routerUrl: '/compte#notifications' })
    expect(navigate).toHaveBeenCalledWith(['/compte/notifications'], { replaceUrl: true })
  })

  it('déconnecte et redirige vers connexion depuis le header', async () => {
    const { fixture, logout, navigate } = await setup()
    const logoutBtn = fixture.nativeElement.querySelector(
      '[data-testid="account-logout"]',
    ) as HTMLButtonElement
    expect(logoutBtn).toBeTruthy()
    logoutBtn.click()
    await fixture.whenStable()
    expect(logout).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })

  it('affiche Se déconnecter dans le header sur tous les onglets', async () => {
    const { fixture, router } = await setup()
    await router.navigateByUrl('/compte/preferences')
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('[data-testid="account-logout"]')).toBeTruthy()
  })

  it('redirige vers connexion avec snackbar si la session est invalide', async () => {
    clearPendingPostLoginRedirect()
    const { snack, navigate } = await setup({
      session: { ok: false, status: 401 },
      routerUrl: '/compte',
    })

    expect(snack.open).toHaveBeenCalledWith(
      'Votre session a expiré ou vous n’êtes pas connecté.',
      'OK',
      { duration: 6000 },
    )
    expect(getPendingPostLoginRedirect()).toBe('/compte')
    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })

  it('redirige vers connexion depuis une route enfant si session invalide', async () => {
    clearPendingPostLoginRedirect()
    const { snack, navigate } = await setup({
      session: { ok: false, status: 401 },
      routerUrl: '/compte/notifications',
    })

    expect(snack.open).toHaveBeenCalled()
    expect(getPendingPostLoginRedirect()).toBe('/compte/notifications')
    expect(navigate).toHaveBeenCalledWith(['/connexion'], { replaceUrl: true })
  })
})
