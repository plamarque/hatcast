import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import { ParticipantApiService, type SeasonParticipantAdmin } from '../../core/participants/participant-api.service'
import {
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { ParticipantGenderToggleField } from '../../shared/participant-add/participant-gender-toggle-field'
import {
  buildParticipantAddSuggestions,
  findParticipantAddSuggestionByKey,
  isGuestScopeSuggestion,
  seasonParticipantIdForEventInclude,
  type ParticipantAddSuggestion,
} from '../../shared/participant-add/participant-member-suggestions'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

export interface AddEventParticipantDialogData {
  seasonId: string
  eventId: string
  troupeId: string
}

@Component({
  selector: 'app-add-event-participant-dialog',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ParticipantGenderToggleField,
    UserAvatarComponent,
  ],
  template: `
    <h2 mat-dialog-title>Ajouter un participant</h2>
    <mat-dialog-content>
      <div class="participant-form-dialog">
        @if (showEventScopeHint()) {
          <p class="participant-form-dialog__hint participant-form-dialog__scope-hint">
            {{ eventScopeHint() }}
          </p>
        }
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="participant-form-dialog__field">
          <mat-label>Nom affiché</mat-label>
          <input
            matInput
            autofocus
            [value]="displayName()"
            (input)="onDisplayNameInput($any($event.target).value)"
            [matAutocomplete]="nameAuto"
          />
          <mat-autocomplete
            #nameAuto="matAutocomplete"
            [displayWith]="displaySuggestionLabel"
            (optionSelected)="onSuggestionOptionSelected($event.option.value)"
          >
            @for (suggestion of filteredSuggestions(); track suggestion.key) {
              <mat-option [value]="suggestion.key">
                <span class="participant-form-dialog__option">
                  <app-user-avatar
                    class="participant-form-dialog__option-avatar"
                    [displayName]="suggestion.displayName"
                    [avatarUrl]="suggestion.avatarUrl ?? null"
                    [gender]="suggestion.gender ?? null"
                    [size]="24"
                  />
                  <span>{{ suggestion.displayName }}</span>
                  @if (suggestion.baselineRole === 'EXTERNE') {
                    <span class="participant-form-dialog__option-role">Externe</span>
                  }
                  @if (suggestion.email) {
                    <span class="participant-form-dialog__option-email">{{ suggestion.email }}</span>
                  }
                </span>
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="participant-form-dialog__field">
          <mat-label>Email (optionnel)</mat-label>
          <input
            matInput
            [value]="email()"
            (input)="onEmailInput($any($event.target).value)"
            placeholder="participant@example.com"
          />
        </mat-form-field>
        @if (showGenderField()) {
          <app-participant-gender-toggle-field
            [value]="gender()"
            (valueChange)="gender.set($event)"
            [readOnlyManagedOnAccount]="genderManagedOnAccount()"
            [accountGender]="selectedSuggestion()?.gender ?? null"
          />
        }
        @if (showEventOptInCheckbox()) {
          <mat-checkbox
            class="participant-form-dialog__checkbox"
            [checked]="addToSeasonRoster()"
            (change)="addToSeasonRoster.set($event.checked)"
          >
            Ajouter aussi à la saison
          </mat-checkbox>
        }
        <p class="participant-form-dialog__hint">
          Suggestions : membres, externes du carnet et participants de la saison. Si l'email
          correspond à un compte HatCast, le participant sera lié automatiquement. L'email pourra
          aussi servir aux invitations et notifications à venir.
        </p>
        @if (error()) {
          <p class="participant-form-dialog__error" role="alert">{{ error() }}</p>
        }
      </div>
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

      .participant-form-dialog {
        display: grid;
        gap: 0.75rem;
        min-width: min(24rem, calc(100vw - 3rem));
        padding-top: 0.5rem;
      }

      .participant-form-dialog__field {
        width: 100%;
      }

      .participant-form-dialog__option {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }

      .participant-form-dialog__option-avatar {
        flex-shrink: 0;
      }

      .participant-form-dialog__option-role {
        color: color-mix(in srgb, var(--mat-sys-on-surface) 55%, transparent);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .participant-form-dialog__option-email {
        color: color-mix(in srgb, var(--mat-sys-on-surface) 60%, transparent);
        font-size: 0.875rem;
      }

      .participant-form-dialog__hint {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.45;
        color: color-mix(in srgb, var(--mat-sys-on-surface) 72%, transparent);
      }

      .participant-form-dialog__scope-hint {
        font-weight: 500;
      }

      .participant-form-dialog__checkbox {
        min-height: 3rem;
        align-self: start;
      }

      .participant-form-dialog__error {
        margin: 0;
        color: var(--mat-sys-error);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AddEventParticipantDialog implements OnInit {
  private readonly api = inject(ParticipantApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<AddEventParticipantDialog, boolean>)
  protected readonly data = inject<AddEventParticipantDialogData>(MAT_DIALOG_DATA)

  protected readonly displayName = signal('')
  protected readonly email = signal('')
  protected readonly saving = signal(false)
  protected readonly error = signal('')
  protected readonly carnetMembers = signal<TroupeMemberAdmin[]>([])
  protected readonly seasonParticipants = signal<SeasonParticipantAdmin[]>([])
  protected readonly excludedUserIds = signal<Set<string>>(new Set())
  protected readonly excludedDisplayNames = signal<Set<string>>(new Set())
  protected readonly excludedTroupeMembershipIds = signal<Set<string>>(new Set())
  protected readonly selectedSuggestion = signal<ParticipantAddSuggestion | null>(null)
  protected readonly gender = signal<MemberGender>('non_specified')
  protected readonly addToSeasonRoster = signal(false)

  protected readonly showGenderField = computed(() => true)

  protected readonly genderManagedOnAccount = computed(() => {
    const suggestion = this.selectedSuggestion()
    if (!suggestion) {
      return false
    }
    return effectiveMemberGender(suggestion.gender) !== 'non_specified'
  })

  protected readonly filteredSuggestions = computed(() =>
    buildParticipantAddSuggestions({
      carnetMembers: this.carnetMembers(),
      seasonParticipants: this.seasonParticipants(),
      query: this.displayName(),
      excludedUserIds: this.excludedUserIds(),
      excludedDisplayNames: this.excludedDisplayNames(),
      excludedTroupeMembershipIds: this.excludedTroupeMembershipIds(),
      includeSeasonRoster: true,
    }),
  )

  protected readonly showEventOptInCheckbox = computed(() => {
    const suggestion = this.selectedSuggestion()
    if (suggestion) {
      return isGuestScopeSuggestion(suggestion)
    }
    return this.displayName().trim().length > 0
  })

  protected readonly showEventScopeHint = computed(() => {
    const suggestion = this.selectedSuggestion()
    if (suggestion) {
      return isGuestScopeSuggestion(suggestion)
    }
    return this.displayName().trim().length > 0
  })

  protected readonly eventScopeHint = computed(() => {
    if (this.addToSeasonRoster()) {
      return 'Externe spectacle — ajouté aussi au roster saison (scope spectacle)'
    }
    return 'Externe spectacle — ce spectacle seulement'
  })

  ngOnInit(): void {
    void this.initializeSuggestions()
  }

  protected onDisplayNameInput(value: string): void {
    const hadSelection = this.selectedSuggestion() !== null
    this.displayName.set(value)
    this.selectedSuggestion.set(null)
    if (hadSelection) {
      this.email.set('')
      this.gender.set('non_specified')
    }
    this.error.set('')
  }

  protected onEmailInput(value: string): void {
    this.email.set(value)
    this.error.set('')
  }

  protected readonly displaySuggestionLabel = (key: string | null): string => {
    if (!key) {
      return ''
    }
    const suggestion = findParticipantAddSuggestionByKey(
      key,
      this.carnetMembers(),
      this.seasonParticipants(),
    )
    return suggestion?.displayName ?? key
  }

  protected onSuggestionOptionSelected(key: string): void {
    const suggestion =
      findParticipantAddSuggestionByKey(
        key,
        this.carnetMembers(),
        this.seasonParticipants(),
      ) ?? this.buildAllSuggestions().find((s) => s.key === key)
    if (suggestion) {
      this.onSuggestionSelected(suggestion)
    }
  }

  /** @deprecated Test harness — prefer onSuggestionOptionSelected with suggestion key. */
  protected onMemberOptionSelected(userId: string): void {
    const suggestion = this.buildAllSuggestions().find((s) => s.userId === userId)
    if (suggestion) {
      this.onSuggestionSelected(suggestion)
    }
  }

  protected onSuggestionSelected(suggestion: ParticipantAddSuggestion): void {
    this.selectedSuggestion.set(suggestion)
    this.displayName.set(suggestion.displayName)
    this.email.set(suggestion.email ?? '')
    this.gender.set('non_specified')
    this.error.set('')
  }

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
      const selection = this.selectedSuggestion()
      if (selection) {
        const seasonParticipantId = seasonParticipantIdForEventInclude(
          selection,
          this.seasonParticipants(),
        )
        if (seasonParticipantId) {
          const includeResult = await this.api.includeSeasonParticipantOnEvent(
            this.data.seasonId,
            this.data.eventId,
            seasonParticipantId,
          )
          if (!includeResult.ok) {
            this.error.set(this.errorMessage(includeResult.status))
            return
          }
          this.ref.close(true)
          return
        }
      }
      const body: {
        displayName: string
        email?: string
        gender?: MemberGender
        addToSeasonRoster?: boolean
        troupeMembershipId?: string
      } = {
        displayName: name,
        email: email || undefined,
      }
      if (selection?.source === 'carnet' && selection.troupeMembershipId) {
        body.troupeMembershipId = selection.troupeMembershipId
      }
      if (this.showEventOptInCheckbox() && this.addToSeasonRoster()) {
        body.addToSeasonRoster = true
      }
      if (!this.genderManagedOnAccount()) {
        const selectedGender = this.gender()
        if (selectedGender !== 'non_specified') {
          body.gender = selectedGender
        }
      }
      const r = await this.api.createEventParticipant(this.data.seasonId, this.data.eventId, body)
      if (!r.ok) {
        this.error.set(this.errorMessage(r.status))
        return
      }
      this.ref.close(true)
    } finally {
      this.saving.set(false)
    }
  }

  private buildAllSuggestions(): ParticipantAddSuggestion[] {
    return buildParticipantAddSuggestions({
      carnetMembers: this.carnetMembers(),
      seasonParticipants: this.seasonParticipants(),
      query: this.displayName(),
      excludedUserIds: new Set(),
      excludedDisplayNames: new Set(),
      excludedTroupeMembershipIds: new Set(),
      includeSeasonRoster: true,
    })
  }

  private async initializeSuggestions(): Promise<void> {
    const [membersResult, rosterResult, seasonResult] = await Promise.all([
      this.troupeApi.listMembers(this.data.troupeId, 0, 100),
      this.api.listEventParticipantRoster(this.data.seasonId, this.data.eventId),
      this.api.listSeasonParticipants(this.data.seasonId),
    ])

    if (membersResult.ok && membersResult.data) {
      this.carnetMembers.set(membersResult.data.content)
    }

    if (seasonResult.ok && seasonResult.data) {
      this.seasonParticipants.set(seasonResult.data)
    }

    if (rosterResult.ok && rosterResult.data) {
      const userIds = new Set<string>()
      const displayNames = new Set<string>()
      const membershipIds = new Set<string>()
      for (const p of rosterResult.data) {
        if (p.userId) {
          userIds.add(p.userId)
        }
        displayNames.add(p.displayName.trim().toLowerCase())
      }
      this.excludedUserIds.set(userIds)
      this.excludedDisplayNames.set(displayNames)
      this.excludedTroupeMembershipIds.set(membershipIds)
    }
  }

  private errorMessage(status: number): string {
    if (status === 409) return 'Un participant avec ce nom existe déjà.'
    if (status === 403) return 'Accès non autorisé.'
    return 'Ajout impossible.'
  }
}
