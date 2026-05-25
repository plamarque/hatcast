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

export type EditParticipantDialogData =
  | {
      scope: 'season'
      seasonId: string
      participantId: string
      displayName: string
      email: string | null
    }
  | {
      scope: 'event'
      seasonId: string
      eventId: string
      participantId: string
      displayName: string
      email: string | null
    }

@Component({
  selector: 'app-edit-participant-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Modifier le participant</h2>
    <mat-dialog-content class="edit-participant">
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
        <mat-hint>
          Si l'email correspond à un compte HatCast, le participant sera lié et pourra devenir
          organisateur·ice.
        </mat-hint>
      </mat-form-field>
      @if (error()) {
        <p class="edit-participant__error" role="alert">{{ error() }}</p>
      }
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
      .edit-participant {
        display: grid;
        gap: 0.5rem;
        min-width: min(24rem, calc(100vw - 3rem));
      }
      .edit-participant__error {
        margin: 0;
        color: #b71c1c;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class EditParticipantDialog {
  private readonly api = inject(ParticipantApiService)
  private readonly ref = inject(MatDialogRef<EditParticipantDialog, boolean>)
  protected readonly data = inject<EditParticipantDialogData>(MAT_DIALOG_DATA)

  protected readonly displayName = signal(this.data.displayName)
  protected readonly email = signal(this.data.email ?? '')
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
      const body = {
        displayName: name,
        email: this.email().trim() || undefined,
      }
      const r =
        this.data.scope === 'season'
          ? await this.api.updateSeasonParticipant(
              this.data.seasonId,
              this.data.participantId,
              body,
            )
          : await this.api.updateEventParticipant(
              this.data.seasonId,
              this.data.eventId,
              this.data.participantId,
              body,
            )
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
    if (status === 400) return 'Modification impossible pour ce participant.'
    return 'Enregistrement impossible.'
  }
}
