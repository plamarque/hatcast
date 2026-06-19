import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'

import { DrawFormulaApiService } from '../../core/draw/draw-formula-api.service'

export interface TroupeDrawFormulaArchiveDialogData {
  troupeId: string
  formulaId: string
  name: string
}

export type TroupeDrawFormulaArchiveDialogResult =
  | { ok: true }
  | { ok: false; message: string; status: number }

@Component({
  selector: 'app-troupe-draw-formula-archive-dialog',
  host: { 'data-testid': 'draw-formula-archive-dialog' },
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Archiver « {{ data.name }} » ?</h2>
    <mat-dialog-content>
      <p>
        Cette formule ne sera plus proposée dans les politiques. Les tirages passés ne sont pas
        modifiés.
      </p>
      @if (errorMessage()) {
        <p class="archive-dialog__error">{{ errorMessage() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close [disabled]="archiving()">Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="warn"
        [disabled]="archiving()"
        (click)="confirmArchive()"
      >
        Archiver
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .archive-dialog__error {
      color: color-mix(in srgb, var(--mat-sys-error) 85%, var(--mat-sys-on-surface));
      margin-top: 0.75rem;
    }
  `,
})
export class TroupeDrawFormulaArchiveDialog {
  private readonly drawFormulaApi = inject(DrawFormulaApiService)
  private readonly dialogRef = inject(
    MatDialogRef<TroupeDrawFormulaArchiveDialog, TroupeDrawFormulaArchiveDialogResult>,
  )
  protected readonly data = inject<TroupeDrawFormulaArchiveDialogData>(MAT_DIALOG_DATA)

  protected readonly archiving = signal(false)
  protected readonly errorMessage = signal<string | null>(null)

  protected async confirmArchive(): Promise<void> {
    if (this.archiving()) return
    this.archiving.set(true)
    this.errorMessage.set(null)
    const result = await this.drawFormulaApi.archive(this.data.troupeId, this.data.formulaId)
    this.archiving.set(false)
    if (result.ok) {
      this.dialogRef.close({ ok: true })
      return
    }
    if (result.error.status === 409) {
      this.dialogRef.close({
        ok: false,
        status: 409,
        message:
          "Cette formule est utilisée par une politique de tirage. Retire-la de la politique avant de l'archiver.",
      })
      return
    }
    this.errorMessage.set(result.error.message)
  }
}
