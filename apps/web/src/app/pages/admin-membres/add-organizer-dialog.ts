import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import {
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export interface AddOrganizerDialogData {
  seasonId: string
  troupeId: string
}

@Component({
  selector: 'app-add-organizer-dialog',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajouter un·e organisateur·ice</h2>
    <mat-dialog-content class="add-organizer">
      <mat-form-field appearance="outline">
        <mat-label>Email utilisateur</mat-label>
        <input
          matInput
          autofocus
          [value]="email()"
          (input)="onEmailInput($any($event.target).value)"
          [matAutocomplete]="auto"
          placeholder="orga@example.com"
        />
        <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onOptionSelected($event.option.value)">
          @for (member of filteredMembers(); track member.id) {
            <mat-option [value]="member.email ?? ''">
              {{ member.displayName }} — {{ member.email }}
            </mat-option>
          }
        </mat-autocomplete>
      </mat-form-field>
      @if (error()) {
        <p class="add-organizer__error" role="alert">{{ error() }}</p>
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
      .add-organizer {
        display: grid;
        gap: 0.5rem;
        min-width: min(24rem, calc(100vw - 3rem));
      }
      .add-organizer__error {
        margin: 0;
        color: #b71c1c;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AddOrganizerDialog implements OnInit {
  private readonly api = inject(OrganizerApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<AddOrganizerDialog, boolean>)
  protected readonly data = inject<AddOrganizerDialogData>(MAT_DIALOG_DATA)

  protected readonly email = signal('')
  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly saving = signal(false)
  protected readonly error = signal('')

  protected readonly filteredMembers = computed(() => {
    const q = this.email().trim().toLowerCase()
    const active = this.members().filter((m) => m.status === 'ACTIVE')
    if (!q) {
      return active.slice(0, 8)
    }
    return active
      .filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8)
  })

  ngOnInit(): void {
    void this.loadMembers()
  }

  protected onEmailInput(value: string): void {
    this.email.set(value)
  }

  protected onOptionSelected(value: string): void {
    this.email.set(value)
  }

  async submit(): Promise<void> {
    const trimmed = this.email().trim()
    if (!trimmed) {
      this.error.set('Saisissez un email.')
      return
    }
    this.saving.set(true)
    this.error.set('')
    try {
      const r = await this.api.addSeasonOrganizer(this.data.seasonId, trimmed)
      if (!r.ok) {
        this.error.set(r.status === 404 ? 'Utilisateur introuvable.' : 'Ajout impossible.')
        return
      }
      this.ref.close(true)
    } finally {
      this.saving.set(false)
    }
  }

  private async loadMembers(): Promise<void> {
    const r = await this.troupeApi.listMembers(this.data.troupeId, 0, 100)
    if (r.ok && r.data) {
      this.members.set(r.data.content)
    }
  }
}
