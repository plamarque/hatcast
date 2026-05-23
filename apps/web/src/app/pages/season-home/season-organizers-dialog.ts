import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import {
  OrganizerApiService,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'

export interface SeasonOrganizersDialogData {
  seasonId: string
}

@Component({
  selector: 'app-season-organizers-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Organisateur·ices de saison</h2>
    <mat-dialog-content class="organizers">
      <p class="organizers__help">
        Les organisateur·ices de saison peuvent préparer les tirages, valider
        et annoncer les compositions. Ce rôle ne donne pas les droits admin complets.
      </p>

      @if (loading()) {
        <mat-spinner diameter="28" />
      } @else {
        @if (organizers().length === 0) {
          <p class="organizers__empty">Aucun·e organisateur·ice pour cette saison.</p>
        } @else {
          <div class="organizers__list">
            @for (organizer of organizers(); track organizer.userId) {
              <div class="organizers__row">
                <span>
                  <strong>{{ organizer.displayName || organizer.email }}</strong>
                  @if (organizer.displayName) {
                    <small>{{ organizer.email }}</small>
                  }
                </span>
                <button type="button" mat-button color="warn" (click)="removeOrganizer(organizer.userId)">
                  Retirer
                </button>
              </div>
            }
          </div>
        }
      }

      <div class="organizers__add">
        <mat-form-field appearance="outline">
          <mat-label>Email utilisateur</mat-label>
          <input
            matInput
            [value]="organizerEmail"
            (input)="organizerEmail = $any($event.target).value"
            placeholder="orga@example.com"
          />
        </mat-form-field>
        <button type="button" mat-flat-button color="primary" [disabled]="saving()" (click)="addOrganizer()">
          Ajouter
        </button>
      </div>

      @if (message()) {
        <p class="organizers__message" role="status">{{ message() }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .organizers {
        display: grid;
        gap: 1rem;
        min-width: min(32rem, calc(100vw - 3rem));
      }
      .organizers__help,
      .organizers__empty,
      .organizers__message {
        color: rgba(0, 0, 0, 0.65);
        margin: 0;
      }
      .organizers__list {
        display: grid;
        gap: 0.5rem;
      }
      .organizers__row {
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 0.75rem;
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
      }
      .organizers__row small {
        display: block;
        font-size: 0.78rem;
        opacity: 0.75;
      }
      .organizers__add {
        align-items: start;
        display: grid;
        gap: 0.75rem;
        grid-template-columns: minmax(0, 1fr) auto;
      }
    `,
  ],
})
export class SeasonOrganizersDialog implements OnInit {
  private readonly api = inject(OrganizerApiService)
  private readonly ref = inject(MatDialogRef<SeasonOrganizersDialog, boolean>)
  protected readonly data = inject<SeasonOrganizersDialogData>(MAT_DIALOG_DATA)

  protected readonly organizers = signal<OrganizerResponse[]>([])
  protected readonly loading = signal(false)
  protected readonly saving = signal(false)
  protected readonly message = signal('')
  organizerEmail = ''

  ngOnInit(): void {
    void this.reload()
  }

  async addOrganizer(): Promise<void> {
    const email = this.organizerEmail.trim()
    if (!email) {
      this.message.set('Saisissez un email.')
      return
    }
    this.saving.set(true)
    try {
      const r = await this.api.addSeasonOrganizer(this.data.seasonId, email)
      if (!r.ok) {
        this.message.set(r.status === 404 ? 'Utilisateur introuvable.' : 'Ajout impossible.')
        return
      }
      this.organizerEmail = ''
      this.message.set('Organisateur·ice ajouté·e.')
      await this.reload()
      this.ref.disableClose = false
    } finally {
      this.saving.set(false)
    }
  }

  async removeOrganizer(userId: string): Promise<void> {
    this.saving.set(true)
    try {
      const r = await this.api.removeSeasonOrganizer(this.data.seasonId, userId)
      if (!r.ok) {
        this.message.set('Retrait impossible.')
        return
      }
      this.message.set('Organisateur·ice retiré·e.')
      await this.reload()
    } finally {
      this.saving.set(false)
    }
  }

  private async reload(): Promise<void> {
    this.loading.set(true)
    try {
      const r = await this.api.listSeasonOrganizers(this.data.seasonId)
      if (r.ok && r.data) {
        this.organizers.set(r.data)
      } else {
        this.message.set('Chargement impossible.')
      }
    } finally {
      this.loading.set(false)
    }
  }
}
