import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { describe, expect, it, vi } from 'vitest'

import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeEditDialog, type TroupeEditDialogData } from './troupe-edit-dialog'

const troupe: TroupeListItem = {
  id: 't1',
  name: 'Les Improbots',
  slug: 'les-improbots',
  isDemo: false,
  joinPolicy: 'OPEN',
  membership: {
    id: 'm1',
    displayName: 'Admin',
    status: 'ACTIVE',
    baselineRole: 'TROUPE_ADMIN',
    createdAt: '',
    updatedAt: '',
  },
  activeMemberCount: 4,
  upcomingEventCount: 2,
}

async function setup(
  apiOverrides: Partial<Pick<TroupeApiService, 'updateTroupe'>> = {},
) {
  const close = vi.fn()
  const snack = { open: vi.fn() }
  const updateTroupe = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...troupe, name: 'Nom modifié' },
  })

  await TestBed.configureTestingModule({
    imports: [TroupeEditDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: { troupe } satisfies TroupeEditDialogData },
      { provide: MatSnackBar, useValue: snack },
      {
        provide: TroupeApiService,
        useValue: { updateTroupe, ...apiOverrides },
      },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(TroupeEditDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, close, snack, updateTroupe }
}

describe('TroupeEditDialog', () => {
  it('shows help text and Bientôt placeholders without focusable disabled fields', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('L’adresse web de la troupe ne change pas.')
    expect(text).toContain('Logo')
    expect(text).toContain('Description')
    expect(text).toContain('Bientôt')
    expect(fixture.nativeElement.querySelector('input[disabled]')).toBeNull()
    expect(fixture.nativeElement.querySelector('textarea[disabled]')).toBeNull()
  })

  it('saves trimmed name and closes dialog on success', async () => {
    const { fixture, close, snack, updateTroupe } = await setup()
    const component = fixture.componentInstance as TroupeEditDialog
    component['form'].controls.name.setValue('  Nom modifié  ')
    component['form'].markAsDirty()

    await component['save']()
    await fixture.whenStable()

    expect(updateTroupe).toHaveBeenCalledWith('t1', { name: 'Nom modifié' })
    expect(snack.open).toHaveBeenCalledWith('Troupe mise à jour', 'OK', { duration: 3000 })
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nom modifié' }))
  })

  it('shows snackbar when API save fails', async () => {
    const updateTroupe = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    const { fixture, snack } = await setup({ updateTroupe })
    const component = fixture.componentInstance as TroupeEditDialog
    component['form'].controls.name.setValue('Nom modifié')
    component['form'].markAsDirty()

    await component['save']()
    await fixture.whenStable()

    expect(snack.open).toHaveBeenCalledWith('Enregistrement impossible', 'OK', { duration: 5000 })
  })
})
