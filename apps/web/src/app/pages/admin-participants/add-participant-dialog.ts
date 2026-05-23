import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { ParticipantApiService } from '../../core/participants/participant-api.service'

export interface AddParticipantDialogData {
  seasonId: string
}

@Component({
  selector: 'app-add-participant-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Ajouter un participant</h2>
    <mat-dialog-content class="add-participant">
      <mat-form-field appearance="outline">
        <mat-label>Nom affiché</mat-label>
        <input
          matInput
          autofocus
          [value]="displayName()"
          (input)="displayName.set($any($event.target).value)"
        />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Email (optionnel)</mat-label>
        <input
          matInput
          [value]="email()"
          (input)="email.set($any($event.target).value)"
          placeholder="participant@example.com"
        />
        <mat-hint>Si l'email correspond à un compte HatCast, le participant sera lié automatiquement.</mat-hint>
      </mat-form-field>
      @if (error()) {
        <p class="add-participant__error" role="alert">{{ error() }}</p>
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
      .add-participant {
        display: grid;
        gap: 0.5rem;
        min-width: min(24rem, calc(100vw - 3rem));
      }
      .add-participant__error {
        margin: 0;
        color: #b71c1c;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AddParticipantDialog {
  private readonly api = inject(ParticipantApiService)
  private readonly ref = inject(MatDialogRef<AddParticipantDialog, boolean>)
  protected readonly data = inject<AddParticipantDialogData>(MAT_DIALOG_DATA)

  protected readonly displayName = signal('')
  protected readonly email = signal('')
  protected readonly saving = signal(false)
  protected readonly error = signal('')

  async submit(): Promise<void> {
    const name = this.displayName().trim()
    if (!name) {
      this.error.set('Saisissez un nom.')
      return
    }
    this.saving.set(true)
    this.error.set('')
    try {
      const email = this.email().trim()
      const r = await this.api.createSeasonParticipant(this.data.seasonId, {
        displayName: name,
        email: email || undefined,
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
    if (status === 409) return 'Un participant avec ce nom existe déjà.'
    if (status === 403) return 'Accès non autorisé.'
    return 'Ajout impossible.'
  }
}
