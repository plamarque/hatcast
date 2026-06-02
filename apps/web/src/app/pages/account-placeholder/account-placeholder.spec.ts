import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideRouter, Router } from '@angular/router'
import { describe, expect, it, vi } from 'vitest'

import { AppVersionService } from '../../core/app/app-version.service'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { ChangelogDialogService } from '../../shared/changelog/changelog-dialog.service'
import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { getPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { AccountPlaceholder } from './account-placeholder'

describe('AccountPlaceholder', () => {
  async function setup(options: {
    session?: { ok: boolean; status: number; data?: { user: Record<string, unknown> } }
    hasGoogleAccount?: boolean
    routerUrl?: string
    appVersion?: string
  } = {}) {
    const snack = { open: vi.fn() }
    const navigate = vi.fn().mockResolvedValue(true)
    const logout = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const openChangelog = vi.fn()

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

    return { fixture, snack, navigate, logout, openChangelog }
  }

  it('affiche le titre et le sous-titre hub membre', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Mon compte')
    expect(text).toContain('Identité et sécurité du compte HatCast.')
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
  })

  it('affiche la section Préférences membre avec pseudo et rôles', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('Préférences membre')
    expect(text).toContain('Nom affiché dans toutes vos troupes.')
    expect(text).toContain('Rôles préférés')
    expect(
      fixture.nativeElement.querySelector('[data-testid="member-preferences-save"]'),
    ).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="account-troupe-preferences"]')).toBeNull()
  })

  it('garde le changement de mot de passe en placeholder', async () => {
    const { fixture } = await setup()
    const button = fixture.nativeElement.querySelector(
      '[data-testid="account-reset-password"]',
    ) as HTMLButtonElement
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('Changer le mot de passe')
    expect(button.disabled).toBe(true)
    expect(button.closest('.account-page__tooltip-row')).toBeTruthy()
  })

  it('affiche les placeholders e-mail et suppression', async () => {
    const { fixture } = await setup()
    const emailButton = fixture.nativeElement.querySelector(
      '[data-testid="account-change-email"]',
    ) as HTMLButtonElement
    const deleteButton = fixture.nativeElement.querySelector(
      '[data-testid="account-delete"]',
    ) as HTMLButtonElement
    expect(emailButton).toBeTruthy()
    expect(emailButton.disabled).toBe(true)
    expect(emailButton.closest('.account-page__tooltip-row')).toBeTruthy()
    expect(deleteButton).toBeTruthy()
    expect(deleteButton.disabled).toBe(true)
    expect(deleteButton.closest('.account-page__tooltip-row')).toBeTruthy()
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

  it('affiche la version dans À propos et ouvre le changelog au clic', async () => {
    const { fixture, openChangelog } = await setup({ appVersion: '2.1.0' })
    const versionButton = fixture.nativeElement.querySelector(
      '[data-testid="account-app-version"]',
    ) as HTMLButtonElement
    expect(versionButton).toBeTruthy()
    expect(versionButton.textContent).toContain('v2.1.0')
    expect(fixture.nativeElement.textContent).toContain('À propos')

    versionButton.click()
    expect(openChangelog).toHaveBeenCalled()
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
