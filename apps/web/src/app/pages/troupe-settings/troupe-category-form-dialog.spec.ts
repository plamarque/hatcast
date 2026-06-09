import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeCategoryFormDialog } from './troupe-category-form-dialog'

describe('TroupeCategoryFormDialog', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  async function setup(
    mode: 'create' | 'edit',
    apiResult: { ok: boolean; status: number; data?: { slug: string; label: string } },
  ) {
    const close = vi.fn()
    const snack = { open: vi.fn() }
    const apiMethod =
      mode === 'create'
        ? { createCategory: vi.fn().mockResolvedValue(apiResult) }
        : {
            updateCategoryLabel: vi.fn().mockResolvedValue(apiResult),
          }

    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [TroupeCategoryFormDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue:
            mode === 'create'
              ? { mode: 'create', troupeId: 't1' }
              : {
                  mode: 'edit',
                  troupeId: 't1',
                  category: { slug: 'cabaret', label: 'Cabaret' },
                },
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: MatSnackBar, useValue: snack },
        { provide: TroupeApiService, useValue: apiMethod },
      ],
    })
      .overrideProvider(MatSnackBar, { useValue: snack })
      .overrideProvider(TroupeApiService, { useValue: apiMethod })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeCategoryFormDialog)
    fixture.detectChanges()
    return { fixture, close, snack, apiMethod }
  }

  it('rejects whitespace-only label on create', async () => {
    const { fixture, close, apiMethod } = await setup('create', {
      ok: true,
      status: 201,
      data: { slug: 'nouveau', label: 'Nouveau' },
    })
    ;(fixture.componentInstance as unknown as { form: { patchValue: (v: object) => void } }).form.patchValue({
      label: '   ',
    })
    await (fixture.componentInstance as unknown as { save: () => Promise<void> }).save()
    expect(apiMethod.createCategory).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()
  })

  it('does not show slug field on create', async () => {
    const { fixture } = await setup('create', {
      ok: true,
      status: 201,
      data: { slug: 'nouveau', label: 'Nouveau' },
    })
    expect(fixture.nativeElement.textContent).not.toContain('Identifiant')
    expect(fixture.nativeElement.textContent).not.toContain('slug')
  })

  it('POST create with label only on save', async () => {
    const { fixture, close, apiMethod } = await setup('create', {
      ok: true,
      status: 201,
      data: { slug: 'nouveau', label: 'Nouveau' },
    })
    ;(fixture.componentInstance as unknown as { form: { patchValue: (v: object) => void } }).form.patchValue({
      label: 'Nouveau',
    })
    await (fixture.componentInstance as unknown as { save: () => Promise<void> }).save()
    expect(apiMethod.createCategory).toHaveBeenCalledWith('t1', { label: 'Nouveau' })
    expect(close).toHaveBeenCalledWith({ ok: true, category: { slug: 'nouveau', label: 'Nouveau' } })
  })

  it('PATCH edit sends label only', async () => {
    const { fixture, close, apiMethod } = await setup('edit', {
      ok: true,
      status: 200,
      data: { slug: 'cabaret', label: 'Cabaret modifié' },
    })
    ;(fixture.componentInstance as unknown as { form: { patchValue: (v: object) => void } }).form.patchValue({
      label: 'Cabaret modifié',
    })
    await (fixture.componentInstance as unknown as { save: () => Promise<void> }).save()
    expect(apiMethod.updateCategoryLabel).toHaveBeenCalledWith('t1', 'cabaret', {
      label: 'Cabaret modifié',
    })
    expect(close).toHaveBeenCalledWith({
      ok: true,
      category: { slug: 'cabaret', label: 'Cabaret modifié' },
    })
  })

  it('keeps dialog open and shows snackbar on API failure', async () => {
    const { fixture, close, snack } = await setup('create', { ok: false, status: 409 })
    const instance = fixture.componentInstance as unknown as {
      form: { patchValue: (v: object) => void; valid: boolean }
      save: () => Promise<void>
    }
    instance.form.patchValue({ label: 'Nouveau' })
    fixture.detectChanges()
    expect(instance.form.valid).toBe(true)
    await instance.save()
    expect(close).not.toHaveBeenCalled()
    expect(snack.open).toHaveBeenCalledWith('Cette catégorie existe déjà.', 'OK', {
      duration: 6000,
    })
  })
})
