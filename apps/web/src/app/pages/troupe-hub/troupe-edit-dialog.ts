import { Component, DestroyRef, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'

const MAX_LOGO_BYTES = 2 * 1024 * 1024

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
    MatIconModule,
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

        <div class="troupe-edit-dialog__logo-row">
          <span class="troupe-edit-dialog__logo-preview" aria-hidden="true">
            @if (logoPreviewUrl(); as logoUrl) {
              <img [src]="logoUrl" alt="" />
            } @else {
              <mat-icon>groups</mat-icon>
            }
          </span>
          <div class="troupe-edit-dialog__logo-actions">
            <span class="troupe-edit-dialog__logo-label">Logo de la troupe</span>
            @if (selectedLogoFile(); as file) {
              <span class="troupe-edit-dialog__logo-hint">{{ file.name }}</span>
            } @else {
              <span class="troupe-edit-dialog__logo-hint">JPEG, PNG, WebP ou AVIF, 2 Mo max.</span>
            }
            <div class="troupe-edit-dialog__logo-buttons">
              <button
                type="button"
                mat-stroked-button
                [disabled]="saving()"
                (click)="logoFileInput.click()"
              >
                Choisir une image
              </button>
              @if (canRemoveLogo()) {
                <button type="button" mat-button [disabled]="saving()" (click)="removeLogo()">
                  Supprimer le logo
                </button>
              }
            </div>
          </div>
          <input
            #logoFileInput
            class="troupe-edit-dialog__file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            [disabled]="saving()"
            (change)="onLogoFileSelected($event)"
          />
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="troupe-edit-dialog__field">
          <mat-label>Description courte</mat-label>
          <textarea
            matInput
            formControlName="description"
            maxlength="500"
            rows="4"
            placeholder="Présente la troupe en quelques mots."
          ></textarea>
          <mat-hint align="end">{{ form.controls.description.value.length }}/500</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="saving() || form.invalid || !hasChanges()"
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
    .troupe-edit-dialog__logo-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.35rem 0 0.75rem;
    }
    .troupe-edit-dialog__logo-preview {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 4rem;
      height: 4rem;
      overflow: hidden;
      border-radius: 50%;
      background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);
      color: var(--mat-sys-primary);
    }
    .troupe-edit-dialog__logo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .troupe-edit-dialog__logo-actions {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 0.35rem;
      min-width: 0;
    }
    .troupe-edit-dialog__logo-label {
      font-weight: 600;
    }
    .troupe-edit-dialog__logo-hint {
      color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
      font-size: 0.75rem;
    }
    .troupe-edit-dialog__logo-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .troupe-edit-dialog__file-input {
      display: none;
    }
  `,
})
export class TroupeEditDialog {
  private readonly fb = inject(FormBuilder)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<TroupeEditDialog, TroupeListItem | undefined>)
  private readonly destroyRef = inject(DestroyRef)
  protected readonly data = inject<TroupeEditDialogData>(MAT_DIALOG_DATA)

  /** Blob preview from file picker — revoked on replace and dialog destroy. */
  private previewBlobUrl: string | null = null

  protected readonly saving = signal(false)
  protected readonly selectedLogoFile = signal<File | null>(null)
  protected readonly logoPreviewUrl = signal<string | null>(this.data.troupe.logoUrl ?? null)
  protected readonly logoMarkedForDeletion = signal(false)

  protected readonly form = this.fb.nonNullable.group({
    name: [this.data.troupe.name, [Validators.required, Validators.maxLength(255)]],
    description: [this.data.troupe.description ?? '', [Validators.maxLength(500)]],
  })

  constructor() {
    this.destroyRef.onDestroy(() => this.revokePreviewBlob())
  }

  protected hasChanges(): boolean {
    return this.form.dirty || this.selectedLogoFile() !== null || this.logoMarkedForDeletion()
  }

  protected canRemoveLogo(): boolean {
    return !this.logoMarkedForDeletion() && (!!this.logoPreviewUrl() || !!this.data.troupe.logoUrl)
  }

  protected onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    input.value = ''
    if (!file) return

    if (file.size > MAX_LOGO_BYTES) {
      this.snack.open('Fichier trop volumineux (2 Mo max.)', 'OK', { duration: 5000 })
      return
    }

    this.selectedLogoFile.set(file)
    this.logoMarkedForDeletion.set(false)
    if (typeof URL.createObjectURL !== 'function') {
      this.revokePreviewBlob()
      this.logoPreviewUrl.set(null)
      return
    }
    this.revokePreviewBlob()
    const blobUrl = URL.createObjectURL(file)
    this.previewBlobUrl = blobUrl
    this.logoPreviewUrl.set(blobUrl)
  }

  protected removeLogo(): void {
    this.selectedLogoFile.set(null)
    this.logoMarkedForDeletion.set(true)
    this.revokePreviewBlob()
    this.logoPreviewUrl.set(null)
  }

  private revokePreviewBlob(): void {
    if (!this.previewBlobUrl) {
      return
    }
    URL.revokeObjectURL(this.previewBlobUrl)
    this.previewBlobUrl = null
  }

  protected async save(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return
    }
    const nextName = this.form.controls.name.value.trim()
    if (!nextName) {
      this.form.controls.name.setErrors({ required: true })
      return
    }
    this.saving.set(true)
    try {
      const result = await this.troupeApi.updateTroupe(this.data.troupe.id, {
        name: nextName,
        description: this.form.controls.description.value,
      })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }
      let updated = result.data
      const selectedLogo = this.selectedLogoFile()
      if (selectedLogo) {
        const logoResult = await this.troupeApi.uploadTroupeLogo(this.data.troupe.id, selectedLogo)
        if (!logoResult.ok || !logoResult.data) {
          this.snack.open('Logo impossible à enregistrer', 'OK', { duration: 5000 })
          return
        }
        updated = logoResult.data
      } else if (this.logoMarkedForDeletion()) {
        const logoResult = await this.troupeApi.deleteTroupeLogo(this.data.troupe.id)
        if (!logoResult.ok || !logoResult.data) {
          this.snack.open('Suppression du logo impossible', 'OK', { duration: 5000 })
          return
        }
        updated = logoResult.data
      }
      this.snack.open('Troupe mise à jour', 'OK', { duration: 3000 })
      this.dialogRef.close(updated)
    } finally {
      this.saving.set(false)
    }
  }
}
