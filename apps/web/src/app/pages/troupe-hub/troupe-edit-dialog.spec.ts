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
  logoUrl: '/v1/public/troupes/t1/logo?v=1',
  description: 'Improvisation théâtrale.',
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
  apiOverrides: Partial<Pick<TroupeApiService, 'updateTroupe' | 'uploadTroupeLogo' | 'deleteTroupeLogo'>> = {},
  dataTroupe: TroupeListItem = troupe,
) {
  const close = vi.fn()
  const snack = { open: vi.fn() }
  const updateTroupe = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...troupe, name: 'Nom modifié' },
  })
  const uploadTroupeLogo = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...troupe, logoUrl: '/v1/public/troupes/t1/logo?v=2' },
  })
  const deleteTroupeLogo = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    data: { ...troupe, logoUrl: null },
  })

  await TestBed.configureTestingModule({
    imports: [TroupeEditDialog, NoopAnimationsModule],
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: { troupe: dataTroupe } satisfies TroupeEditDialogData },
      { provide: MatSnackBar, useValue: snack },
      {
        provide: TroupeApiService,
        useValue: { updateTroupe, uploadTroupeLogo, deleteTroupeLogo, ...apiOverrides },
      },
    ],
  }).compileComponents()
  TestBed.overrideProvider(MatSnackBar, { useValue: snack })

  const fixture = TestBed.createComponent(TroupeEditDialog)
  fixture.detectChanges()
  await fixture.whenStable()
  return { fixture, close, snack, updateTroupe, uploadTroupeLogo, deleteTroupeLogo }
}

describe('TroupeEditDialog', () => {
  it('shows editable logo and description controls', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('L’adresse web de la troupe ne change pas.')
    expect(text).toContain('Logo de la troupe')
    expect(text).toContain('Description courte')
    expect(text).toContain('Choisir une image')
    expect(text).toContain('Supprimer le logo')
    expect(fixture.nativeElement.querySelector('input[disabled]')).toBeNull()
    expect(fixture.nativeElement.querySelector('textarea[disabled]')).toBeNull()
  })

  it('saves trimmed name and closes dialog on success', async () => {
    const { fixture, close, snack, updateTroupe } = await setup()
    const component = fixture.componentInstance as TroupeEditDialog
    component['form'].controls.name.setValue('  Nom modifié  ')
    component['form'].controls.description.setValue('  Nouvelle description  ')
    component['form'].markAsDirty()

    await component['save']()
    await fixture.whenStable()

    expect(updateTroupe).toHaveBeenCalledWith('t1', {
      name: 'Nom modifié',
      description: '  Nouvelle description  ',
    })
    expect(snack.open).toHaveBeenCalledWith('Troupe mise à jour', 'OK', { duration: 3000 })
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ name: 'Nom modifié' }))
  })

  it('uploads selected logo after saving description', async () => {
    const { fixture, uploadTroupeLogo } = await setup()
    const component = fixture.componentInstance as TroupeEditDialog
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    component['form'].controls.description.setValue('Description')
    component['form'].markAsDirty()
    component['selectedLogoFile'].set(file)

    await component['save']()
    await fixture.whenStable()

    expect(uploadTroupeLogo).toHaveBeenCalledWith('t1', file)
  })

  it('deletes logo when requested', async () => {
    const { fixture, deleteTroupeLogo } = await setup()
    const component = fixture.componentInstance as TroupeEditDialog
    component['removeLogo']()

    await component['save']()
    await fixture.whenStable()

    expect(deleteTroupeLogo).toHaveBeenCalledWith('t1')
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
