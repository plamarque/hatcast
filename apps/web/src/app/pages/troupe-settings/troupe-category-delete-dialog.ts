import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { categoryApiErrorMessage } from './category-api-messages'

export interface TroupeCategoryDeleteDialogData {
  troupeId: string
  slug: string
  label: string
  defaultCategoryLabel: string
}

export type TroupeCategoryDeleteDialogResult =
  | { ok: true }
  | { ok: false; message: string; closeOnly?: boolean }

@Component({
  selector: 'app-troupe-category-delete-dialog',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <mat-dialog-content class="loading">
        <mat-spinner diameter="32" />
      </mat-dialog-content>
    } @else {
      <h2 mat-dialog-title>Supprimer « {{ data.label }} » ?</h2>
      <mat-dialog-content>
        <p>{{ impactCopy() }}</p>
        <p class="warning">Cette action est irréversible.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button type="button" mat-button mat-dialog-close [disabled]="deleting()">Annuler</button>
        <button
          type="button"
          mat-flat-button
          color="warn"
          [disabled]="deleting()"
          (click)="confirmDelete()"
        >
          Supprimer
        </button>
      </mat-dialog-actions>
    }
  `,
  styles: `
    .loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .warning {
      color: color-mix(in srgb, var(--mat-sys-error) 85%, var(--mat-sys-on-surface));
      margin-top: 0.75rem;
    }
  `,
})
export class TroupeCategoryDeleteDialog implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly dialogRef = inject(MatDialogRef<TroupeCategoryDeleteDialog, TroupeCategoryDeleteDialogResult>)
  protected readonly data = inject<TroupeCategoryDeleteDialogData>(MAT_DIALOG_DATA)

  protected readonly loading = signal(true)
  protected readonly eventCount = signal(0)
  protected readonly deleting = signal(false)

  protected readonly impactCopy = () => {
    const count = this.eventCount()
    if (count === 0) {
      return 'Aucun spectacle n’utilise cette catégorie.'
    }
    if (count === 1) {
      return `1 spectacle utilise cette catégorie. Il sera basculé en ${this.data.defaultCategoryLabel}.`
    }
    return `${count} spectacles utilisent cette catégorie. Ils seront basculés en ${this.data.defaultCategoryLabel}.`
  }

  async ngOnInit(): Promise<void> {
    const preview = await this.troupeApi.previewDeleteCategory(this.data.troupeId, this.data.slug)
    if (!preview.ok || preview.data == null) {
      this.dialogRef.close({
        ok: false,
        message: categoryApiErrorMessage(preview.status),
        closeOnly: true,
      })
      return
    }
    this.loading.set(false)
    this.eventCount.set(preview.data.eventCount)
  }

  protected async confirmDelete(): Promise<void> {
    if (this.deleting()) return
    this.deleting.set(true)
    const result = await this.troupeApi.deleteCategory(this.data.troupeId, this.data.slug)
    this.deleting.set(false)
    if (!result.ok) {
      this.dialogRef.close({ ok: false, message: categoryApiErrorMessage(result.status) })
      return
    }
    this.dialogRef.close({ ok: true })
  }
}
