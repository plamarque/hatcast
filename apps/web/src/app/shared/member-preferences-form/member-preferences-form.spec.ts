import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import { MemberPreferencesForm } from './member-preferences-form'

async function setup(options: {
  loadOk?: boolean
  patchOk?: boolean
} = {}) {
  const snack = { open: vi.fn() }
  const patchPreferences = vi.fn().mockResolvedValue(
    options.patchOk === false
      ? { ok: false, status: 500 }
      : {
          ok: true,
          status: 200,
          data: {
            memberDisplayName: 'Léa',
            preferredRoleKeys: ['volunteer', 'player', 'mc'],
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

  await TestBed.configureTestingModule({
    imports: [MemberPreferencesForm, NoopAnimationsModule],
    providers: [
      { provide: MatSnackBar, useValue: snack },
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

  return { fixture, snack, getPreferences, patchPreferences }
}

describe('MemberPreferencesForm', () => {
  it('does not render pseudo field', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.textContent).not.toContain('Nom affiché dans toutes vos troupes.')
    expect(fixture.nativeElement.querySelector('mat-label')?.textContent?.trim()).not.toBe('Pseudo')
  })

  it('saves preferred roles via PATCH with preferredRoleKeys only', async () => {
    const { fixture, patchPreferences, snack } = await setup()
    const component = fixture.componentInstance as MemberPreferencesForm
    component['togglePreferredRole']('mc', true)

    await component['save']()
    await fixture.whenStable()

    expect(patchPreferences).toHaveBeenCalledTimes(1)
    expect(patchPreferences).toHaveBeenCalledWith({
      preferredRoleKeys: ['volunteer', 'player', 'mc'],
    })
    expect(snack.open).toHaveBeenCalledWith('Préférences enregistrées', 'OK', { duration: 3000 })
  })

  it('shows error snack when preferences patch fails', async () => {
    const { fixture, snack } = await setup({ patchOk: false })
    const component = fixture.componentInstance as MemberPreferencesForm
    component['togglePreferredRole']('mc', true)

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
