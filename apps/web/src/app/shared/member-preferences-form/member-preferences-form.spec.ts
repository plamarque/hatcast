import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { MemberPreferencesForm } from './member-preferences-form'

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
  loadOk?: boolean
  patchOk?: boolean
  troupes?: (typeof troupeA)[]
} = {}) {
  const snack = { open: vi.fn() }
  const patchPreferences = vi.fn().mockResolvedValue(
    options.patchOk === false
      ? { ok: false, status: 500 }
      : {
          ok: true,
          status: 200,
          data: {
            memberDisplayName: 'Léa B',
            preferredRoleKeys: ['volunteer', 'player'],
          },
        },
  )
  const getPreferences = vi.fn().mockResolvedValue(
    options.loadOk === false
      ? { ok: false, status: 500 }
      : {
          ok: true,
          status: 200,
          data: {
            memberDisplayName: 'Léa',
            preferredRoleKeys: ['volunteer', 'player'],
          },
        },
  )
  const patchMembershipDisplayName = vi.fn()

  await TestBed.configureTestingModule({
    imports: [MemberPreferencesForm, NoopAnimationsModule],
    providers: [
      { provide: MatSnackBar, useValue: snack },
      {
        provide: TroupeContextService,
        useValue: {
          activeTroupes: () => options.troupes ?? [troupeA],
          patchMembershipDisplayName,
        },
      },
      {
        provide: MePreferencesApiService,
        useValue: { getPreferences, patchPreferences },
      },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(MemberPreferencesForm)
  fixture.detectChanges()
  for (let i = 0; i < 20; i++) {
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 0))
    fixture.detectChanges()
    if (!fixture.componentInstance['preferredRolesLoading']()) {
      break
    }
  }

  return { fixture, snack, getPreferences, patchPreferences, patchMembershipDisplayName }
}

describe('MemberPreferencesForm', () => {
  it('saves pseudo via single account preferences PATCH', async () => {
    const { fixture, patchPreferences, snack } = await setup()
    const component = fixture.componentInstance as MemberPreferencesForm
    component['onPseudoInput']('Léa B')

    await component['save']()
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledTimes(1)
    expect(patchPreferences).toHaveBeenCalledWith({ memberDisplayName: 'Léa B' })
    expect(snack.open).toHaveBeenCalledWith('Préférences enregistrées', 'OK', { duration: 3000 })
  })

  it('shows error snack when preferences patch fails', async () => {
    const { fixture, snack } = await setup({ patchOk: false })
    const component = fixture.componentInstance as MemberPreferencesForm
    component['onPseudoInput']('Autre pseudo')

    await component['save']()
    await fixture.whenStable()

    expect(snack.open).toHaveBeenCalledWith('Enregistrement impossible', 'OK', { duration: 5000 })
  })

  it('disables save when preferences load fails', async () => {
    const { fixture, snack } = await setup({ loadOk: false })
    expect(snack.open).toHaveBeenCalledWith('Impossible de charger vos préférences.', 'OK', {
      duration: 5000,
    })
    const saveButton = fixture.nativeElement.querySelector(
      '[data-testid="member-preferences-save"]',
    ) as HTMLButtonElement
    expect(saveButton.disabled).toBe(true)
  })
})
