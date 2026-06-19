import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import { TroupeDrawFormulaArchiveDialog } from './troupe-draw-formula-archive-dialog'

describe('TroupeDrawFormulaArchiveDialog', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  async function setup(archiveResult: Awaited<ReturnType<DrawFormulaApiService['archive']>>) {
    const archive = vi.fn().mockResolvedValue(archiveResult)
    const close = vi.fn()
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [TroupeDrawFormulaArchiveDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { troupeId: 't1', formulaId: 'f1', name: 'Ma formule' },
        },
        { provide: MatDialogRef, useValue: { close } },
        { provide: DrawFormulaApiService, useValue: { archive } },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeDrawFormulaArchiveDialog)
    fixture.detectChanges()
    return { fixture, archive, close }
  }

  it('closes with policy message on 409', async () => {
    const { fixture, close } = await setup({
      ok: false,
      status: 409,
      error: { status: 409, message: 'Formule utilisée par une politique de tirage' },
    })
    await (
      fixture.componentInstance as unknown as { confirmArchive: () => Promise<void> }
    ).confirmArchive()
    expect(close).toHaveBeenCalledWith({
      ok: false,
      status: 409,
      message:
        "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
    })
  })
})
