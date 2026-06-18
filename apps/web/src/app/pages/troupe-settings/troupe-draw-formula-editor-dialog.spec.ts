import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import { buildFactorConfig, defaultEditorState, type DrawFormula } from '../../core/draw/draw-formula-payload'
import { TroupeDrawFormulaEditorDialog } from './troupe-draw-formula-editor-dialog'

describe('TroupeDrawFormulaEditorDialog', () => {
  afterEach(() => {
    TestBed.resetTestingModule()
  })

  async function setup(mode: 'create' | 'edit' = 'create', formula?: DrawFormula) {
    const create = vi.fn()
    const patch = vi.fn()
    TestBed.resetTestingModule()
    await TestBed.configureTestingModule({
      imports: [TroupeDrawFormulaEditorDialog, NoopAnimationsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { mode, troupeId: 't1', formula },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        {
          provide: DrawFormulaApiService,
          useValue: { create, patch },
        },
      ],
    }).compileComponents()

    const fixture = TestBed.createComponent(TroupeDrawFormulaEditorDialog)
    fixture.detectChanges()
    return { fixture, create, patch }
  }

  it('builds default payload with equity_tag and past_participation enabled', async () => {
    const { fixture } = await setup()
    const instance = fixture.componentInstance as unknown as {
      editorState: () => ReturnType<typeof defaultEditorState>
    }
    const config = buildFactorConfig(instance.editorState())
    expect(config[0]).toEqual({ factorId: 'equity_tag', enabled: true })
    expect(config[1]).toEqual({ factorId: 'past_participation', enabled: true })
  })

  it('maps 400 API error to inline field message', async () => {
    const { fixture, create } = await setup()
    const instance = fixture.componentInstance as unknown as {
      form: { controls: { name: { setValue: (v: string) => void } } }
      saveDraft: () => Promise<void>
      fieldErrors: () => Record<string, string>
    }
    instance.form.controls.name.setValue('Ma formule')
    create.mockResolvedValue({
      ok: false,
      status: 400,
      error: { status: 400, message: 'past_participation.params.strength doit être entre 0.0 et 2.0' },
    })
    await instance.saveDraft()
    fixture.detectChanges()
    expect(instance.fieldErrors()['past_participation_strength']).toContain('strength doit être entre')
  })

  it('blocks publish when no malus/bonus criterion is enabled', async () => {
    const { fixture, create } = await setup()
    const instance = fixture.componentInstance as unknown as {
      form: {
        controls: {
          name: { setValue: (v: string) => void }
          past_participation_enabled: { setValue: (v: boolean) => void }
          immediate_replay_enabled: { setValue: (v: boolean) => void }
          role_request_enabled: { setValue: (v: boolean) => void }
        }
      }
      publish: () => Promise<void>
      footerError: () => string | null
    }
    instance.form.controls.name.setValue('Sans critère')
    instance.form.controls.past_participation_enabled.setValue(false)
    instance.form.controls.immediate_replay_enabled.setValue(false)
    instance.form.controls.role_request_enabled.setValue(false)
    await instance.publish()
    fixture.detectChanges()
    expect(create).not.toHaveBeenCalled()
    expect(instance.footerError()).toContain('Au moins un critère malus/bonus')
  })

  it('keeps PUBLISHED status when saving a published formula', async () => {
    const published: DrawFormula = {
      id: 'f1',
      troupeId: 't1',
      name: 'Publiée',
      description: null,
      status: 'PUBLISHED',
      factorConfig: buildFactorConfig(defaultEditorState()),
      version: 2,
      isSystem: false,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    }
    const { fixture, patch } = await setup('edit', published)
    const instance = fixture.componentInstance as unknown as {
      form: { controls: { name: { setValue: (v: string) => void } } }
      saveDraft: () => Promise<void>
    }
    patch.mockResolvedValue({ ok: true, status: 200, data: published })
    instance.form.controls.name.setValue('Publiée modifiée')
    await instance.saveDraft()
    expect(patch).toHaveBeenCalledWith(
      't1',
      'f1',
      expect.objectContaining({ status: 'PUBLISHED' }),
    )
  })
})
