import { Component, inject, signal } from '@angular/core'
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
    <h2 mat-dialog-title>Ajouter un membre</h2>
    <mat-dialog-content class="add-member">
      <mat-form-field appearance="outline">
        <mat-label>Email utilisateur</mat-label>
        <input
          matInput
          autofocus
          [value]="email()"
          (input)="email.set($any($event.target).value)"
          placeholder="membre@example.com"
        />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Nom affiché</mat-label>
        <input
          matInput
          [value]="displayName()"
          (input)="displayName.set($any($event.target).value)"
          placeholder="Optionnel"
        />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Rôle de base</mat-label>
        <mat-select [value]="baselineRole()" (selectionChange)="baselineRole.set($event.value)">
          <mat-option value="MEMBER">Membre</mat-option>
          <mat-option value="TROUPE_ADMIN">Administrateur·ice de troupe</mat-option>
        </mat-select>
      </mat-form-field>
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
      .add-member {
        display: grid;
        gap: 0.5rem;
        min-width: min(24rem, calc(100vw - 3rem));
      }
      .add-member__error {
        margin: 0;
        color: #b71c1c;
        font-size: 0.875rem;
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

  async submit(): Promise<void> {
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

  private errorMessage(status: number): string {
    if (status === 404) return 'Ressource introuvable.'
    if (status === 409) return 'La troupe doit conserver au moins un administrateur actif.'
    if (status === 403) return 'Vous ne pouvez pas administrer les membres de cette troupe.'
    return 'Ajout impossible.'
  }
}
