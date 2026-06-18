import { Component, inject, input, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { firstValueFrom } from 'rxjs'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'
import {
  enabledMalusBonusSummary,
  type DrawFormula,
} from '../../core/draw/draw-formula-payload'
import { formulaStatusLabel } from '../../core/draw/draw-factor-catalog'
import { DRAW_CHANCES_HELP_PATH } from '../../shared/composition/chance-breakdown.constants'
import {
  TroupeDrawFormulaArchiveDialog,
  type TroupeDrawFormulaArchiveDialogResult,
} from './troupe-draw-formula-archive-dialog'
import {
  TroupeDrawFormulaEditorDialog,
  type TroupeDrawFormulaEditorDialogResult,
} from './troupe-draw-formula-editor-dialog'

@Component({
  selector: 'app-troupe-draw-formulas-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './troupe-draw-formulas-tab.html',
  styleUrl: './troupe-draw-formulas-tab.scss',
})
export class TroupeDrawFormulasTab implements OnInit {
  private readonly drawFormulaApi = inject(DrawFormulaApiService)
  private readonly dialog = inject(MatDialog)
  private readonly snack = inject(MatSnackBar)

  readonly troupeId = input.required<string>()

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly formulas = signal<DrawFormula[]>([])

  protected readonly helpPath = DRAW_CHANCES_HELP_PATH

  async ngOnInit(): Promise<void> {
    await this.reload()
  }

  protected statusLabel(status: DrawFormula['status']): string {
    return formulaStatusLabel(status)
  }

  protected factorSummary(formula: DrawFormula): string {
    return enabledMalusBonusSummary(formula.factorConfig) || 'Aucun critère malus/bonus actif'
  }

  protected async openCreate(): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaEditorDialog, {
      data: { mode: 'create', troupeId: this.troupeId() },
      width: 'min(480px, 100vw - 2rem)',
      maxHeight: '90vh',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaEditorDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open(
      result.published ? 'Formule publiée' : 'Formule enregistrée',
      'OK',
      { duration: 4000 },
    )
    await this.reload()
  }

  protected async openEdit(formula: DrawFormula): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaEditorDialog, {
      data: { mode: 'edit', troupeId: this.troupeId(), formula },
      width: 'min(480px, 100vw - 2rem)',
      maxHeight: '90vh',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaEditorDialogResult
      | undefined
    if (!result?.ok) return
    this.snack.open(
      result.published ? 'Formule publiée' : 'Formule enregistrée',
      'OK',
      { duration: 4000 },
    )
    await this.reload()
  }

  protected async openArchive(formula: DrawFormula): Promise<void> {
    const ref = this.dialog.open(TroupeDrawFormulaArchiveDialog, {
      data: {
        troupeId: this.troupeId(),
        formulaId: formula.id,
        name: formula.name,
      },
      width: 'min(24rem, 100vw - 2rem)',
      disableClose: true,
    })
    const result = (await firstValueFrom(ref.afterClosed())) as
      | TroupeDrawFormulaArchiveDialogResult
      | undefined
    if (!result) return
    if (!result.ok) {
      this.snack.open(result.message, 'OK', { duration: 7000 })
      return
    }
    this.snack.open('Formule archivée', 'OK', { duration: 4000 })
    await this.reload()
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    this.loadError.set(false)
    const result = await this.drawFormulaApi.list(this.troupeId())
    this.loading.set(false)
    if (!result.ok || !result.data) {
      this.loadError.set(true)
      this.formulas.set([])
      return
    }
    this.formulas.set(result.data)
  }
}
