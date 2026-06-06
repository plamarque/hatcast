import { Component, computed, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import {
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export interface EditTroupeMemberDialogData {
  troupeId: string
  member: TroupeMemberAdmin
}

@Component({
  selector: 'app-edit-troupe-member-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dialogTitle() }}</h2>
    <mat-dialog-content>
      <div class="edit-troupe-member">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="edit-troupe-member__field">
          <mat-label>Nom affiché</mat-label>
          <input
            matInput
            autofocus
            [value]="displayName()"
            (input)="displayName.set($any($event.target).value)"
          />
        </mat-form-field>
        @if (isExterne()) {
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="edit-troupe-member__field">
            <mat-label>Email (optionnel)</mat-label>
            <input
              matInput
              [value]="email()"
              (input)="email.set($any($event.target).value)"
              placeholder="externe@example.com"
            />
            <mat-hint>Optionnel — pour pré-lier un compte HatCast existant.</mat-hint>
          </mat-form-field>
        } @else if (data.member.email) {
          <p class="edit-troupe-member__email-managed">Email géré par le compte HatCast.</p>
        }
        @if (error()) {
          <p class="edit-troupe-member__error" role="alert">{{ error() }}</p>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button type="button" mat-flat-button color="primary" [disabled]="saving()" (click)="submit()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host mat-dialog-content {
        overflow-x: hidden;
        overflow-y: visible;
        max-height: none;
      }

      .edit-troupe-member {
        box-sizing: border-box;
        display: grid;
        gap: 0.75rem;
        max-width: 100%;
        min-width: 0;
        padding-top: 0.5rem;
        width: 100%;
      }

      .edit-troupe-member__field {
        min-width: 0;
        width: 100%;
      }

      .edit-troupe-member__email-managed {
        margin: 0;
        font-size: 0.875rem;
        color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
      }

      .edit-troupe-member__error {
        margin: 0;
        color: var(--mat-sys-error);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class EditTroupeMemberDialog {
  private readonly api = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<EditTroupeMemberDialog, boolean>)
  protected readonly data = inject<EditTroupeMemberDialogData>(MAT_DIALOG_DATA)

  protected readonly displayName = signal(this.data.member.displayName)
  protected readonly email = signal(this.data.member.email ?? '')
  protected readonly saving = signal(false)
  protected readonly error = signal('')

  protected readonly isExterne = computed(() => this.data.member.baselineRole === 'EXTERNE')
  protected readonly dialogTitle = computed(() =>
    this.isExterne() ? 'Modifier cet externe' : 'Modifier le membre',
  )

  async submit(): Promise<void> {
    const name = this.displayName().trim()
    if (!name) {
      this.error.set('Saisissez un nom.')
      return
    }

    const patch: { displayName?: string; email?: string | null } = {}
    const originalName = this.data.member.displayName.trim()
    if (name !== originalName) {
      patch.displayName = name
    }

    if (this.isExterne()) {
      const trimmedEmail = this.email().trim()
      const originalEmail = (this.data.member.email ?? '').trim()
      if (trimmedEmail !== originalEmail) {
        patch.email = trimmedEmail || null
      }
    }

    if (Object.keys(patch).length === 0) {
      this.ref.close(false)
      return
    }

    this.saving.set(true)
    this.error.set('')
    try {
      const r = await this.api.updateMember(this.data.troupeId, this.data.member.id, patch)
      if (!r.ok) {
        this.error.set(this.errorMessage(r.status))
        return
      }
      this.ref.close(true)
    } finally {
      this.saving.set(false)
    }
  }

  private errorMessage(status: number): string {
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'La troupe doit conserver au moins un administrateur actif.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    if (status === 400) return 'Email invalide.'
    return 'Enregistrement impossible.'
  }
}
