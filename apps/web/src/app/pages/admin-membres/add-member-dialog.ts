import { Component, computed, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

import {
  type TroupeBaselineRole,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export interface AddMemberDialogData {
  troupeId: string
}

@Component({
  selector: 'app-add-member-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ dialogTitle() }}</h2>
    <mat-dialog-content class="add-member">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-member__field">
        <mat-label>Nom affiché</mat-label>
        <input
          matInput
          autofocus
          [value]="displayName()"
          (input)="displayName.set($any($event.target).value)"
          [placeholder]="isExterne() ? 'Obligatoire' : 'Optionnel'"
        />
      </mat-form-field>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-member__field">
        <mat-label>Email utilisateur</mat-label>
        <input
          matInput
          [value]="email()"
          (input)="email.set($any($event.target).value)"
          [placeholder]="isExterne() ? 'Optionnel' : 'membre@example.com'"
        />
        @if (isExterne()) {
          <mat-hint>Optionnel — pour pré-lier un compte HatCast existant.</mat-hint>
        }
      </mat-form-field>
      @if (isExterne()) {
        <p class="add-member__role-hint">
          Rôle : Externe
          <button type="button" mat-button (click)="baselineRole.set('MEMBER')">Ajouter un membre à la place</button>
        </p>
      } @else {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="add-member__field">
          <mat-label>Rôle de base</mat-label>
          <mat-select [value]="baselineRole()" (selectionChange)="baselineRole.set($event.value)">
            <mat-option value="MEMBER">Membre</mat-option>
            <mat-option value="TROUPE_ADMIN">Administrateur·ice de troupe</mat-option>
            <mat-option value="EXTERNE">Externe</mat-option>
          </mat-select>
        </mat-form-field>
      }
      @if (error()) {
        <p class="add-member__error" role="alert">{{ error() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Annuler</button>
      <button type="button" mat-flat-button color="primary" [disabled]="saving()" (click)="submit()">
        Ajouter
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host mat-dialog-content {
        overflow: visible;
        max-height: none;
      }

      .add-member {
        display: grid;
        gap: 0.75rem;
        min-width: min(28rem, calc(100vw - 2rem));
        padding-top: 0.5rem;
      }
      .add-member__field {
        width: 100%;
      }
      .add-member__error {
        margin: 0;
        color: var(--mat-sys-error);
        font-size: 0.875rem;
      }
      .add-member__role-hint {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }
    `,
  ],
})
export class AddMemberDialog {
  private readonly api = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<AddMemberDialog, boolean>)
  protected readonly data = inject<AddMemberDialogData>(MAT_DIALOG_DATA)

  protected readonly email = signal('')
  protected readonly displayName = signal('')
  protected readonly baselineRole = signal<TroupeBaselineRole>('MEMBER')
  protected readonly saving = signal(false)
  protected readonly error = signal('')

  protected readonly isExterne = computed(() => this.baselineRole() === 'EXTERNE')
  protected readonly dialogTitle = computed(() =>
    this.isExterne() ? 'Ajouter un externe' : 'Ajouter un membre',
  )

  async submit(): Promise<void> {
    if (this.isExterne()) {
      await this.submitExterne()
      return
    }
    const trimmed = this.email().trim()
    if (!trimmed) {
      this.error.set('Saisissez un email.')
      return
    }
    this.saving.set(true)
    this.error.set('')
    try {
      const r = await this.api.addMember(this.data.troupeId, {
        email: trimmed,
        displayName: this.displayName(),
        baselineRole: this.baselineRole(),
      })
      if (!r.ok) {
        this.error.set(this.errorMessage(r.status))
        return
      }
      this.ref.close(true)
    } finally {
      this.saving.set(false)
    }
  }

  private async submitExterne(): Promise<void> {
    const name = this.displayName().trim()
    if (!name) {
      this.error.set('Saisissez un nom affiché.')
      return
    }
    this.saving.set(true)
    this.error.set('')
    try {
      const r = await this.api.addExterne(this.data.troupeId, {
        displayName: name,
        email: this.email().trim() || undefined,
      })
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
    if (status === 409) return 'Conflit : cet utilisateur a déjà une adhésion active.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    return 'Ajout impossible.'
  }
}
