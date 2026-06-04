import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { MemberDisplayNameService } from '../../../core/account/member-display-name.service'
import { MePreferencesApiService } from '../../../core/account/me-preferences-api.service'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { TroupeContextService } from '../../../core/troupes/troupe-context.service'
import { AccountPageContext } from '../account-page-context'
import { AccountIdentityTab } from './account-identity-tab'

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

async function setup(options: { patchOk?: boolean } = {}) {
  const snack = { open: vi.fn() }
  const patchPreferences = vi.fn().mockResolvedValue(
    options.patchOk === false
      ? { ok: false, status: 500 }
      : {
          ok: true,
          status: 200,
          data: { memberDisplayName: 'Léa B', preferredRoleKeys: ['volunteer'] },
        },
  )
  const memberDisplayNameSignal = signal('Léa')
  const setFromSave = vi.fn((value: string) => memberDisplayNameSignal.set(value.trim()))
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
      hasGoogleAccount: false,
    }),
    avatarSaving: signal(false),
    avatarDisplayName: () => 'Léa Martin',
    accountDisplayName: () => 'Léa Martin',
    onAvatarFileSelected: vi.fn(),
    importGoogleAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  }

  await TestBed.configureTestingModule({
    imports: [AccountIdentityTab, NoopAnimationsModule],
    providers: [
      { provide: AccountPageContext, useValue: pageCtx },
      { provide: MatSnackBar, useValue: snack },
      {
        provide: MePreferencesApiService,
        useValue: { patchPreferences },
      },
      {
        provide: MemberDisplayNameService,
        useValue: {
          memberDisplayName: memberDisplayNameSignal,
          loadFromApi,
          syncSessionUser: vi.fn(),
          setFromSave,
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

  const fixture = TestBed.createComponent(AccountIdentityTab)
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
    patchPreferences,
    patchMembershipDisplayName,
    setFromSave,
    memberDisplayNameSignal,
  }
}

describe('AccountIdentityTab', () => {
  it('renders pseudo field with save button', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).toContain('Nom affiché dans toutes vos troupes.')
    expect(fixture.nativeElement.querySelector('[data-testid="account-pseudo-save"]')).toBeTruthy()
  })

  it('rejects empty pseudo without API call', async () => {
    const { fixture, patchPreferences } = await setup()
    const component = fixture.componentInstance as AccountIdentityTab
    component['onPseudoInput']('   ')
    await component['savePseudo']()
    fixture.detectChanges()
    expect(patchPreferences).not.toHaveBeenCalled()
    expect(component['pseudoError']()).toBe(true)
  })

  it('saves pseudo via PATCH and syncs rail service and troupes', async () => {
    const { fixture, snack, patchPreferences, patchMembershipDisplayName, setFromSave, memberDisplayNameSignal } =
      await setup()
    const component = fixture.componentInstance as AccountIdentityTab
    component['onPseudoInput']('Léa B')

    await component['savePseudo']()
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledWith({ memberDisplayName: 'Léa B' })
    expect(setFromSave).toHaveBeenCalledWith('Léa B')
    expect(memberDisplayNameSignal()).toBe('Léa B')
    expect(patchMembershipDisplayName).toHaveBeenCalledWith('t1', 'Léa B')
    expect(snack.open).toHaveBeenCalledWith('Pseudo enregistré', 'OK', { duration: 3000 })
  })

  it('shows error snack when patch fails', async () => {
    const { fixture, snack } = await setup({ patchOk: false })
    const component = fixture.componentInstance as AccountIdentityTab
    component['onPseudoInput']('Léa B')

    await component['savePseudo']()
    await fixture.whenStable()

    expect(snack.open).toHaveBeenCalledWith('Enregistrement impossible', 'OK', { duration: 5000 })
  })
})
