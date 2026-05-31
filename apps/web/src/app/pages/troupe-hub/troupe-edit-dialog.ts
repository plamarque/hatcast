import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'

export interface TroupeEditDialogData {
  troupe: TroupeListItem
}

@Component({
  selector: 'app-troupe-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>Modifier la troupe</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="troupe-edit-dialog">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="troupe-edit-dialog__field">
          <mat-label>Nom de la troupe</mat-label>
          <input matInput formControlName="name" maxlength="255" />
          @if (form.controls.name.hasError('required')) {
            <mat-error>Le nom ne peut pas être vide.</mat-error>
          }
        </mat-form-field>
        <p class="troupe-edit-dialog__help">L’adresse web de la troupe ne change pas.</p>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="troupe-edit-dialog__field">
          <mat-label>Logo</mat-label>
          <input matInput disabled value="" />
          <span matTextSuffix class="troupe-edit-dialog__soon">Bientôt</span>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="troupe-edit-dialog__field">
          <mat-label>Description</mat-label>
          <textarea matInput disabled rows="2"></textarea>
          <span matTextSuffix class="troupe-edit-dialog__soon">Bientôt</span>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="saving() || form.invalid || !form.dirty"
        (click)="save()"
      >
        @if (saving()) {
          <mat-spinner diameter="20" />
        } @else {
          Enregistrer
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .troupe-edit-dialog {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: min(100vw - 4rem, 24rem);
      padding-top: 0.25rem;
    }
    .troupe-edit-dialog__field {
      width: 100%;
    }
    .troupe-edit-dialog__help {
      margin: 0 0 0.25rem;
      font-size: 0.85rem;
      opacity: 0.85;
    }
    .troupe-edit-dialog__soon {
      font-size: 0.75rem;
      opacity: 0.75;
      white-space: nowrap;
    }
  `,
})
export class TroupeEditDialog {
  private readonly fb = inject(FormBuilder)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<TroupeEditDialog, TroupeListItem | undefined>)
  protected readonly data = inject<TroupeEditDialogData>(MAT_DIALOG_DATA)

  protected readonly saving = signal(false)

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.troupe.name, [Validators.required, Validators.maxLength(255)]],
  })

  protected async save(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return
    }
    const next = this.form.controls.name.value.trim()
    if (!next) {
      this.form.controls.name.setErrors({ required: true })
      return
    }
    this.saving.set(true)
    try {
      const result = await this.troupeApi.updateTroupe(this.data.troupe.id, { name: next })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }
      this.snack.open('Troupe mise à jour', 'OK', { duration: 3000 })
      this.dialogRef.close(result.data)
    } finally {
      this.saving.set(false)
    }
  }
}
