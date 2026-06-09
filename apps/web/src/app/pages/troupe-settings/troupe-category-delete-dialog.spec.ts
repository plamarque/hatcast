import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeCategoryDeleteDialog } from './troupe-category-delete-dialog'

describe('TroupeCategoryDeleteDialog', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  async function setup(preview: { ok: boolean; status: number; data?: { eventCount: number } }) {
    const close = vi.fn()
    const previewDeleteCategory = vi.fn().mockResolvedValue(preview)
    const deleteCategory = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      data: { affectedEventCount: preview.data?.eventCount ?? 0 },
    })

    TestBed.resetTestingModule()
    const troupeApi = { previewDeleteCategory, deleteCategory }
    await TestBed.configureTestingModule({
      imports: [TroupeCategoryDeleteDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            troupeId: 't1',
            slug: 'cabaret',
            label: 'Cabaret',
            defaultCategoryLabel: 'Spectacles ordinaires',
          },
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: TroupeApiService, useValue: troupeApi },
      ],
    })
      .overrideProvider(TroupeApiService, { useValue: troupeApi })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeCategoryDeleteDialog)
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(previewDeleteCategory).toHaveBeenCalled()
    })
    return { fixture, close, deleteCategory }
  }

  it('shows singular impact copy when one event uses category', async () => {
    const { fixture } = await setup({ ok: true, status: 200, data: { eventCount: 1 } })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain(
        '1 spectacle utilise cette catégorie. Il sera basculé en Spectacles ordinaires.',
      )
    })
  })

  it('shows impact copy when events use category', async () => {
    const { fixture } = await setup({ ok: true, status: 200, data: { eventCount: 3 } })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('3 spectacles utilisent cette catégorie')
    })
    expect(fixture.nativeElement.textContent).toContain('Spectacles ordinaires')
    expect(fixture.nativeElement.textContent).toContain('Cette action est irréversible.')
  })

  it('shows zero-impact copy when no events use category', async () => {
    const { fixture } = await setup({ ok: true, status: 200, data: { eventCount: 0 } })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain(
        'Aucun spectacle n’utilise cette catégorie.',
      )
    })
  })

  it('closes with error when preview fails', async () => {
    const { close } = await setup({ ok: false, status: 404 })
    await vi.waitFor(() => {
      expect(close).toHaveBeenCalledWith({
        ok: false,
        message: 'Catégorie introuvable.',
        closeOnly: true,
      })
    })
  })

  it('DELETE on confirm', async () => {
    const { fixture, close, deleteCategory } = await setup({
      ok: true,
      status: 200,
      data: { eventCount: 1 },
    })
    await vi.waitFor(() => {
      expect(fixture.nativeElement.textContent).toContain('Supprimer')
    })
    const confirm = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((b) => b.textContent?.includes('Supprimer'))!
    confirm.click()
    await vi.waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith('t1', 'cabaret')
      expect(close).toHaveBeenCalledWith({ ok: true })
    })
  })
})
