import { Component, inject, signal } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import {
  TroupeApiService,
  type TroupeCategory,
} from '../../core/troupes/troupe-api.service'
import { categoryApiErrorMessage } from './category-api-messages'

export interface TroupeCategoryFormDialogData {
  mode: 'create' | 'edit'
  troupeId: string
  category?: TroupeCategory
}

export type TroupeCategoryFormDialogResult = { ok: true; category: TroupeCategory }

function trimmedRequired(control: AbstractControl): ValidationErrors | null {
  const value = control.value
  if (typeof value !== 'string' || !value.trim()) {
    return { required: true }
  }
  return null
}

@Component({
  selector: 'app-troupe-category-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'create' ? 'Ajouter une catégorie' : 'Modifier la catégorie' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form" (ngSubmit)="save()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Libellé</mat-label>
          <input matInput formControlName="label" />
          @if (form.controls.label.touched && form.controls.label.errors?.['required']) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close [disabled]="saving()">Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || saving()"
        (click)="save()"
      >
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form {
      display: grid;
      gap: 0.5rem;
      min-width: min(20rem, 100%);
      padding-top: 0.25rem;
    }

    .full {
      width: 100%;
    }
  `,
})
export class TroupeCategoryFormDialog {
  private readonly fb = inject(FormBuilder)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<TroupeCategoryFormDialog, TroupeCategoryFormDialogResult>)
  protected readonly data = inject<TroupeCategoryFormDialogData>(MAT_DIALOG_DATA)

  protected readonly saving = signal(false)

  protected readonly form = this.fb.group({
    label: [this.data.category?.label ?? '', [Validators.required, trimmedRequired]],
  })

  protected async save(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.saving()) return

    this.saving.set(true)
    const label = (this.form.controls.label.value ?? '').trim()

    if (this.data.mode === 'create') {
      const result = await this.troupeApi.createCategory(this.data.troupeId, { label })
      this.saving.set(false)
      if (!result.ok || !result.data) {
        this.snack.open(categoryApiErrorMessage(result.status), 'OK', { duration: 6000 })
        return
      }
      this.dialogRef.close({ ok: true, category: result.data })
      return
    }

    const slug = this.data.category?.slug
    if (!slug) {
      this.saving.set(false)
      this.snack.open('Catégorie introuvable.', 'OK', { duration: 6000 })
      return
    }

    const result = await this.troupeApi.updateCategoryLabel(this.data.troupeId, slug, { label })
    this.saving.set(false)
    if (!result.ok || !result.data) {
      this.snack.open(categoryApiErrorMessage(result.status), 'OK', { duration: 6000 })
      return
    }
    this.dialogRef.close({ ok: true, category: result.data })
  }
}
