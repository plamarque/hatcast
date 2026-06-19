import { Component, computed, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider'
import { MatTooltipModule } from '@angular/material/tooltip'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import {
  immediateReplayEffectSummary,
  pastParticipationEffectSummary,
  roleRequestEffectSummary,
} from '../../core/draw/draw-formula-effect-summary'
import {
  buildFactorConfig,
  defaultEditorState,
  editorStateFromFactorConfig,
  hasEnabledMalusBonusCriterion,
  mapApiErrorToField,
  type DrawFormula,
  type DrawFormulaEditorState,
} from '../../core/draw/draw-formula-payload'
import {
  directionLabel,
  malusBonusFactors,
  reservedFactors,
  type MalusBonusFactorId,
} from '../../core/draw/draw-factor-catalog'
import { TroupeDrawFormulaProfileChart } from './troupe-draw-formula-profile-chart'

export interface TroupeDrawFormulaEditorDialogData {
  mode: 'create' | 'edit'
  troupeId: string
  formula?: DrawFormula
}

export type TroupeDrawFormulaEditorDialogResult = {
  ok: true
  published: boolean
  formula: DrawFormula
}

function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value
  if (typeof value !== 'string' || !value.trim()) {
    return { required: true }
  }
  return null
}

@Component({
  selector: 'app-troupe-draw-formula-editor-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatTooltipModule,
    MatIconModule,
    TroupeDrawFormulaProfileChart,
  ],
  templateUrl: './troupe-draw-formula-editor-dialog.html',
  styleUrl: './troupe-draw-formula-editor-dialog.scss',
})
export class TroupeDrawFormulaEditorDialog {
  private readonly fb = inject(FormBuilder)
  private readonly drawFormulaApi = inject(DrawFormulaApiService)
  private readonly dialogRef = inject(
    MatDialogRef<TroupeDrawFormulaEditorDialog, TroupeDrawFormulaEditorDialogResult>,
  )
  protected readonly data = inject<TroupeDrawFormulaEditorDialogData>(MAT_DIALOG_DATA)

  protected readonly saving = signal(false)
  protected readonly footerError = signal<string | null>(null)
  protected readonly fieldErrors = signal<Record<string, string>>({})
  protected readonly expandedFactor = signal<MalusBonusFactorId | null>(null)

  protected readonly malusBonusFactors = malusBonusFactors()
  protected readonly reservedFactors = reservedFactors()

  private readonly initialEditorState = editorStateFromFactorConfig(
    this.data.formula?.factorConfig,
  )

  protected readonly form = this.fb.group({
    name: [
      this.data.formula?.name ?? '',
      [Validators.required, trimmedRequired, Validators.maxLength(255)],
    ],
    description: [this.data.formula?.description ?? '', [Validators.maxLength(2000)]],
    past_participation_enabled: [this.initialEditorState.past_participation.enabled],
    past_participation_strength: [this.initialEditorState.past_participation.strength],
    immediate_replay_enabled: [this.initialEditorState.immediate_replay.enabled],
    immediate_replay_intensity: [this.initialEditorState.immediate_replay.replayDisplayIntensity],
    role_request_enabled: [this.initialEditorState.role_request.enabled],
    role_request_bonus: [this.initialEditorState.role_request.bonusPerUnfulfilled],
    role_request_cap: [this.initialEditorState.role_request.maxBonusMultiplier],
  })

  private readonly formValues = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  })

  protected readonly editorState = computed<DrawFormulaEditorState>(() => {
    const values = this.formValues()
    return {
      past_participation: {
        ...defaultEditorState().past_participation,
        enabled: values.past_participation_enabled === true,
        strength: values.past_participation_strength ?? 1,
      },
      immediate_replay: {
        ...defaultEditorState().immediate_replay,
        enabled: values.immediate_replay_enabled === true,
        replayDisplayIntensity: values.immediate_replay_intensity ?? 1,
      },
      role_request: {
        ...defaultEditorState().role_request,
        enabled: values.role_request_enabled === true,
        bonusPerUnfulfilled: values.role_request_bonus ?? 1,
        maxBonusMultiplier: values.role_request_cap ?? 10,
      },
    }
  })


  protected directionLabel(factorId: string): string | null {
    const entry = this.malusBonusFactors.find((item) => item.factorId === factorId)
    return entry ? directionLabel(entry.direction) : null
  }

  protected formatStrength(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  }

  protected formatReplay(value: number): string {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  protected formatBonus(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  }

  protected formatCap(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
  }

  protected fieldError(key: string): string | null {
    return this.fieldErrors()[key] ?? null
  }

  protected isFactorEnabled(factorId: string): boolean {
    if (factorId === 'past_participation') {
      return this.form.controls.past_participation_enabled.value === true
    }
    if (factorId === 'immediate_replay') {
      return this.form.controls.immediate_replay_enabled.value === true
    }
    return this.form.controls.role_request_enabled.value === true
  }

  protected isFactorExpanded(factorId: string): boolean {
    return this.expandedFactor() === factorId
  }

  protected toggleFactorDetails(factorId: string): void {
    if (
      factorId !== 'past_participation' &&
      factorId !== 'immediate_replay' &&
      factorId !== 'role_request'
    ) {
      return
    }
    this.expandedFactor.update((current) => (current === factorId ? null : factorId))
  }

  protected effectSummary(factorId: string): string {
    const state = this.editorState()
    if (factorId === 'past_participation') {
      return pastParticipationEffectSummary(state.past_participation.strength)
    }
    if (factorId === 'immediate_replay') {
      return immediateReplayEffectSummary(state.immediate_replay.replayDisplayIntensity)
    }
    return roleRequestEffectSummary(
      state.role_request.bonusPerUnfulfilled,
      state.role_request.maxBonusMultiplier,
    )
  }

  protected async saveDraft(): Promise<void> {
    await this.save('DRAFT')
  }

  protected async publish(): Promise<void> {
    if (!hasEnabledMalusBonusCriterion(this.editorState())) {
      this.footerError.set(
        'Au moins un critère malus/bonus doit être activé pour publier la formule.',
      )
      return
    }
    await this.save('PUBLISHED')
  }

  private async save(status: 'DRAFT' | 'PUBLISHED'): Promise<void> {
    this.form.markAllAsTouched()
    this.footerError.set(null)
    this.fieldErrors.set({})
    if (this.form.invalid || this.saving()) return

    this.saving.set(true)
    const name = (this.form.controls.name.value ?? '').trim()
    const descriptionRaw = (this.form.controls.description.value ?? '').trim()
    const description = descriptionRaw || null
    const factorConfig = buildFactorConfig(this.editorState())
    const body = {
      name,
      description,
      status: this.resolveSaveStatus(status),
      factorConfig,
    }

    const result =
      this.data.mode === 'create'
        ? await this.drawFormulaApi.create(this.data.troupeId, body)
        : await this.drawFormulaApi.patch(this.data.troupeId, this.data.formula!.id, body)

    this.saving.set(false)
    if (result.ok && result.data) {
      this.dialogRef.close({
        ok: true,
        published: status === 'PUBLISHED',
        formula: result.data,
      })
      return
    }

    if (!result.ok) {
      const mapping = mapApiErrorToField(result.error.message)
      if (mapping.field) {
        this.expandedFactor.set(mapping.field)
        const key =
          mapping.paramKey ??
          (mapping.field === 'role_request' ? mapping.field : `${mapping.field}_strength`)
        this.fieldErrors.set({ [key]: result.error.message })
      } else {
        this.footerError.set(result.error.message)
      }
    }
  }

  private resolveSaveStatus(requested: 'DRAFT' | 'PUBLISHED'): 'DRAFT' | 'PUBLISHED' {
    if (requested === 'PUBLISHED') {
      return 'PUBLISHED'
    }
    if (this.data.mode === 'edit' && this.data.formula?.status === 'PUBLISHED') {
      return 'PUBLISHED'
    }
    return 'DRAFT'
  }
}
