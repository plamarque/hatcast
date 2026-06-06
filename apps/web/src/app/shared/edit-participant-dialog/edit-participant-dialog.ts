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
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import { ParticipantGenderToggleField } from '../participant-add/participant-gender-toggle-field'

export type EditParticipantDialogData =
  | {
      scope: 'season'
      seasonId: string
      participantId: string
      displayName: string
      email: string | null
      userId?: string | null
      genderManagedOnAccount?: boolean
      participantGender?: MemberGender | null
    }
  | {
      scope: 'event'
      seasonId: string
      eventId: string
      participantId: string
      displayName: string
      email: string | null
      userId?: string | null
      genderManagedOnAccount?: boolean
      participantGender?: MemberGender | null
    }

@Component({
  selector: 'app-edit-participant-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ParticipantGenderToggleField,
  ],
  template: `
    <h2 mat-dialog-title>Modifier le participant</h2>
    <mat-dialog-content>
      <div class="participant-form-dialog">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="participant-form-dialog__field">
          <mat-label>Nom affiché</mat-label>
          <input
            matInput
            autofocus
            [value]="displayName()"
            (input)="displayName.set($any($event.target).value)"
          />
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="participant-form-dialog__field">
          <mat-label>Email (optionnel)</mat-label>
          <input
            matInput
            [value]="email()"
            (input)="email.set($any($event.target).value)"
            placeholder="participant@example.com"
          />
        </mat-form-field>
        @if (showGenderField()) {
          <app-participant-gender-toggle-field
            [value]="gender()"
            (valueChange)="gender.set($event)"
            [readOnlyManagedOnAccount]="genderManagedOnAccount()"
          />
        }
        <p class="participant-form-dialog__hint">
          Si l'email correspond à un compte HatCast, le participant sera lié et pourra devenir
          organisateur·ice.
        </p>
        @if (error()) {
          <p class="participant-form-dialog__error" role="alert">{{ error() }}</p>
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
        overflow: visible;
        max-height: none;
      }

      .participant-form-dialog {
        display: grid;
        gap: 0.75rem;
        min-width: min(24rem, calc(100vw - 3rem));
        padding-top: 0.5rem;
      }

      .participant-form-dialog__field {
        width: 100%;
      }

      .participant-form-dialog__hint {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
      }

      .participant-form-dialog__error {
        margin: 0;
        color: var(--mat-sys-error);
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
  protected readonly gender = signal<MemberGender>(this.initialGender())
  protected readonly saving = signal(false)
  protected readonly error = signal('')

  protected readonly genderManagedOnAccount = computed(
    () => this.data.genderManagedOnAccount === true,
  )

  protected readonly showGenderField = computed(() => true)

  async submit(): Promise<void> {
    const name = this.displayName().trim()
    if (!name) {
      this.error.set('Saisissez un nom.')
      return
    }
    this.saving.set(true)
    this.error.set('')
    try {
      const body: { displayName: string; email?: string; gender?: MemberGender } = {
        displayName: name,
        email: this.email().trim() || undefined,
      }
      if (!this.genderManagedOnAccount()) {
        body.gender = this.gender()
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

  private initialGender(): MemberGender {
    const stored = this.data.participantGender
    if (stored != null) {
      return effectiveMemberGender(stored)
    }
    return 'non_specified'
  }

  private errorMessage(status: number): string {
    if (status === 409) return 'Un participant avec ce nom existe déjà.'
    if (status === 403) return 'Accès non autorisé.'
    if (status === 400) return 'Modification impossible pour ce participant.'
    return 'Enregistrement impossible.'
  }
}
