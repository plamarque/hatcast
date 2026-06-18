import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import type { DrawFormula } from '../../core/draw/draw-formula-payload'
import { TroupeDrawFormulaArchiveDialog } from './troupe-draw-formula-archive-dialog'
import { TroupeDrawFormulaEditorDialog } from './troupe-draw-formula-editor-dialog'
import { TroupeDrawFormulasTab } from './troupe-draw-formulas-tab'

describe('TroupeDrawFormulasTab', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  const formulas: DrawFormula[] = [
    {
      id: 'sys-1',
      troupeId: 't1',
      name: 'V1',
      description: null,
      status: 'PUBLISHED',
      factorConfig: [
        { factorId: 'equity_tag', enabled: true },
        { factorId: 'past_participation', enabled: true },
        { factorId: 'immediate_replay', enabled: false },
        { factorId: 'role_request', enabled: false },
      ],
      version: 1,
      isSystem: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'custom-1',
      troupeId: 't1',
      name: 'Ma formule',
      description: null,
      status: 'DRAFT',
      factorConfig: [
        { factorId: 'equity_tag', enabled: true },
        { factorId: 'past_participation', enabled: true },
        { factorId: 'immediate_replay', enabled: false },
        { factorId: 'role_request', enabled: false },
      ],
      version: 1,
      isSystem: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ]

  async function setup(dialogResult?: unknown) {
    const list = vi.fn().mockResolvedValue({ ok: true, status: 200, data: formulas })
    const snackOpen = vi.fn()
    const dialogOpen = vi.fn().mockImplementation((component, config) => {
      if (component === TroupeDrawFormulaEditorDialog) {
        return {
          afterClosed: () =>
            of(
              dialogResult ?? {
                ok: true,
                published: false,
                formula: formulas[1],
              },
            ),
        }
      }
      if (component === TroupeDrawFormulaArchiveDialog) {
        return {
          afterClosed: () =>
            of(
              dialogResult ?? {
                ok: false,
                status: 409,
                message:
                  "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
              },
            ),
        }
      }
      return { afterClosed: () => of(undefined) }
    })

    TestBed.resetTestingModule()
    const drawFormulaApi = { list }
    await TestBed.configureTestingModule({
      imports: [TroupeDrawFormulasTab, NoopAnimationsModule],
      providers: [
        { provide: DrawFormulaApiService, useValue: drawFormulaApi },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatSnackBar, useValue: { open: snackOpen } },
      ],
    })
      .overrideProvider(DrawFormulaApiService, { useValue: drawFormulaApi })
      .overrideProvider(MatDialog, { useValue: { open: dialogOpen } })
      .overrideProvider(MatSnackBar, { useValue: { open: snackOpen } })
      .compileComponents()

    const fixture = TestBed.createComponent(TroupeDrawFormulasTab)
    fixture.componentRef.setInput('troupeId', 't1')
    fixture.detectChanges()
    await vi.waitFor(() => {
      expect(list).toHaveBeenCalledWith('t1')
      expect(fixture.nativeElement.textContent).toContain('Ma formule')
    })
    return { fixture, list, dialogOpen, snackOpen }
  }

  it('renders formula rows from API', async () => {
    const { fixture } = await setup()
    const text = fixture.nativeElement.textContent ?? ''
    expect(text).toContain('V1')
    expect(text).toContain('Ma formule')
    expect(text).toContain('Système')
    expect(text).toContain('Brouillon')
  })

  it('hides edit and archive actions for system formula', async () => {
    const { fixture } = await setup()
    expect(fixture.nativeElement.querySelector('[aria-label="Modifier V1"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Archiver V1"]')).toBeNull()
    expect(fixture.nativeElement.querySelector('[aria-label="Modifier Ma formule"]')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('[aria-label="Archiver Ma formule"]')).toBeTruthy()
  })

  it('opens create dialog and refreshes list on success', async () => {
    const { fixture, list, dialogOpen, snackOpen } = await setup()
    await (
      fixture.componentInstance as unknown as { openCreate: () => Promise<void> }
    ).openCreate()
    fixture.detectChanges()
    expect(dialogOpen).toHaveBeenCalledWith(
      TroupeDrawFormulaEditorDialog,
      expect.objectContaining({
        data: { mode: 'create', troupeId: 't1' },
        disableClose: true,
      }),
    )
    expect(snackOpen).toHaveBeenCalledWith('Formule enregistrée', 'OK', { duration: 4000 })
    await vi.waitFor(() => {
      expect(list.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('shows snackbar when archive returns 409', async () => {
    const { fixture, snackOpen } = await setup()
    await (
      fixture.componentInstance as unknown as {
        openArchive: (formula: DrawFormula) => Promise<void>
      }
    ).openArchive(formulas[1]!)
    fixture.detectChanges()
    expect(snackOpen).toHaveBeenCalledWith(
      "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
      'OK',
      { duration: 7000 },
    )
  })
})
