import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { MemberDisplayNameService } from '../../../core/account/member-display-name.service'
import { MePreferencesApiService } from '../../../core/account/me-preferences-api.service'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import { TroupeContextService } from '../../../core/troupes/troupe-context.service'
import { AccountPageContext } from '../account-page-context'
import { AccountChangeEmailDialog } from '../dialogs/account-change-email-dialog'
import { AccountProfileTab } from './account-profile-tab'

const troupeA = {
  id: 't1',
  name: 'Troupe A',
  slug: 'troupe-a',
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
  activeMemberCount: 2,
  upcomingEventCount: 0,
}

async function setup(options: {
  patchOk?: boolean
  hasGoogleAccount?: boolean
  gender?: 'male' | 'female' | 'non_specified' | null
} = {}) {
  const snack = { open: vi.fn() }
  const dialogOpen = vi.fn()
  const initialGender = options.gender ?? 'non_specified'
  const patchPreferences = vi.fn().mockImplementation(
    async (body: { memberDisplayName?: string; gender?: string }) => {
      if (options.patchOk === false) {
        return { ok: false, status: 500 }
      }
      return {
        ok: true,
        status: 200,
        data: {
          memberDisplayName: body.memberDisplayName ?? 'Léa',
          preferredRoleKeys: ['volunteer'],
          gender: body.gender ?? (initialGender ?? 'non_specified'),
        },
      }
    },
  )
  const getPreferences = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: {
      memberDisplayName: 'Léa',
      preferredRoleKeys: ['volunteer'],
      ...(options.gender === null
        ? {}
        : { gender: initialGender }),
    },
  })
  const memberDisplayNameSignal = signal('Léa')
  const memberGenderSignal = signal<'male' | 'female' | 'non_specified'>(
    initialGender ?? 'non_specified',
  )
  const setGenderPreview = vi.fn((gender: 'male' | 'female' | 'non_specified' | null) => {
    if (gender !== null) {
      memberGenderSignal.set(gender)
    }
  })
  const setFromSave = vi.fn((value: string, gender?: 'male' | 'female' | 'non_specified') => {
    memberDisplayNameSignal.set(value.trim())
    if (gender !== undefined) {
      memberGenderSignal.set(gender)
    }
  })
  const loadFromApi = vi.fn().mockImplementation(async () => {
    memberDisplayNameSignal.set('Léa')
    return true
  })
  const patchMembershipDisplayName = vi.fn()
  const pageCtx = {
    user: signal({
      slug: 'lea',
      email: 'lea@example.com',
      displayName: 'Léa Martin',
      avatarUrl: null,
      hasGoogleAccount: options.hasGoogleAccount ?? false,
    }),
    avatarSaving: signal(false),
    avatarDisplayName: () => 'Léa Martin',
    accountDisplayName: () => 'Léa Martin',
    onAvatarFileSelected: vi.fn(),
    importGoogleAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  }

  await TestBed.configureTestingModule({
    imports: [AccountProfileTab, NoopAnimationsModule],
    providers: [
      { provide: AccountPageContext, useValue: pageCtx },
      { provide: MatSnackBar, useValue: snack },
      { provide: MatDialog, useValue: { open: dialogOpen } },
      {
        provide: FirebaseAuthService,
        useValue: {
          getAuthOrNull: () => ({
            currentUser: {
              providerData: options.hasGoogleAccount
                ? [{ providerId: 'google.com' }]
                : [{ providerId: 'password' }],
              email: 'lea@example.com',
            },
          }),
        },
      },
      {
        provide: MePreferencesApiService,
        useValue: { patchPreferences, getPreferences },
      },
      {
        provide: MemberDisplayNameService,
        useValue: {
          memberDisplayName: memberDisplayNameSignal,
          memberGender: memberGenderSignal,
          loadFromApi,
          syncSessionUser: vi.fn(),
          setFromSave,
          setGenderPreview,
          railLabel: () => memberDisplayNameSignal(),
        },
      },
      {
        provide: TroupeContextService,
        useValue: {
          activeTroupes: () => [troupeA],
          patchMembershipDisplayName,
        },
      },
      { provide: AuthApiService, useValue: {} },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(AccountProfileTab)
  fixture.detectChanges()
  for (let i = 0; i < 20; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    fixture.detectChanges()
    if (!fixture.componentInstance['preferencesLoading']()) {
      break
    }
  }

  return {
    fixture,
    snack,
    dialogOpen,
    patchPreferences,
    patchMembershipDisplayName,
    setFromSave,
    setGenderPreview,
    memberDisplayNameSignal,
    memberGenderSignal,
    getPreferences,
  }
}

describe('AccountProfileTab', () => {
  it('renders profile fields with single save button and email edit icon', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain('Pseudo')
    expect(fixture.nativeElement.querySelector('[data-testid="account-profile-save"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[data-testid="account-email-edit"]')).toBeTruthy()
  })

  it('opens change email dialog from edit icon', async () => {
    const { fixture, dialogOpen } = await setup()
    const editBtn = fixture.nativeElement.querySelector(
      '[data-testid="account-email-edit"]',
    ) as HTMLButtonElement
    editBtn.click()
    expect(dialogOpen).toHaveBeenCalledWith(
      AccountChangeEmailDialog,
      expect.objectContaining({
        data: expect.objectContaining({ currentEmail: 'lea@example.com' }),
      }),
    )
  })

  it('rejects empty pseudo without API call', async () => {
    const { fixture, patchPreferences } = await setup()
    const component = fixture.componentInstance as AccountProfileTab
    component['onPseudoInput']('   ')
    await component['saveProfile']()
    fixture.detectChanges()
    expect(patchPreferences).not.toHaveBeenCalled()
    expect(component['pseudoError']()).toBe(true)
  })

  it('saves pseudo via PATCH and syncs rail service and troupes', async () => {
    const { fixture, snack, patchPreferences, patchMembershipDisplayName, setFromSave, memberDisplayNameSignal } =
      await setup()
    const component = fixture.componentInstance as AccountProfileTab
    component['onPseudoInput']('Léa B')

    await component['saveProfile']()
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledWith({ memberDisplayName: 'Léa B' })
    expect(setFromSave).toHaveBeenCalledWith('Léa B', 'non_specified')
    expect(memberDisplayNameSignal()).toBe('Léa B')
    expect(patchMembershipDisplayName).toHaveBeenCalledWith('t1', 'Léa B')
    expect(snack.open).toHaveBeenCalledWith('Profil enregistré', 'OK', { duration: 3000 })
  })

  it('shows error snack when patch fails', async () => {
    const { fixture, snack } = await setup({ patchOk: false })
    const component = fixture.componentInstance as AccountProfileTab
    component['onPseudoInput']('Léa B')

    await component['saveProfile']()
    await fixture.whenStable()

    expect(snack.open).toHaveBeenCalledWith('Enregistrement impossible', 'OK', { duration: 5000 })
  })

  it('pre-selects non_specified when API omits gender', async () => {
    const { fixture } = await setup({ gender: null })
    const neutralToggle = fixture.nativeElement.querySelector(
      '[data-testid="account-gender-non-specified"]',
    ) as HTMLElement
    expect(neutralToggle.classList.contains('mat-button-toggle-checked')).toBe(true)
    expect((fixture.componentInstance as AccountProfileTab)['gender']()).toBe('non_specified')
  })

  it('uses gender toggle group and saves gender with shared Enregistrer', async () => {
    const { fixture, snack, patchPreferences, setGenderPreview } = await setup({ gender: 'male' })
    expect(fixture.nativeElement.querySelector('[data-testid="account-gender-group"]')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('Quel genre utiliser pour me désigner ?')
    expect(fixture.nativeElement.textContent).toContain('Masculin')

    const component = fixture.componentInstance as AccountProfileTab
    const saveBtn = fixture.nativeElement.querySelector(
      '[data-testid="account-profile-save"]',
    ) as HTMLButtonElement
    expect(saveBtn.disabled).toBe(true)

    component['onGenderInput']('female')
    fixture.detectChanges()
    expect(setGenderPreview).toHaveBeenCalledWith('female')
    expect(saveBtn.disabled).toBe(false)

    await component['saveProfile']()
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledWith({ gender: 'female' })
    expect(component['gender']()).toBe('female')
    expect(snack.open).toHaveBeenCalledWith('Profil enregistré', 'OK', { duration: 3000 })
  })

  it('shows error snack when gender save fails and reverts selection', async () => {
    const { fixture, snack } = await setup({ patchOk: false, gender: 'male' })
    const component = fixture.componentInstance as AccountProfileTab

    component['onGenderInput']('female')
    await component['saveProfile']()
    await fixture.whenStable()

    expect(snack.open).toHaveBeenCalledWith('Enregistrement impossible', 'OK', { duration: 5000 })
    expect(component['gender']()).toBe('male')
  })
})
