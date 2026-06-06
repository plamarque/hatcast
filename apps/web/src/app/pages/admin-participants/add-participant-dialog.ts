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

import {
  effectiveMemberGender,
  type MemberGender,
} from '../../core/account/member-gender'
import { ParticipantApiService } from '../../core/participants/participant-api.service'
import {
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { ParticipantGenderToggleField } from '../../shared/participant-add/participant-gender-toggle-field'
import { filterTroupeMemberSuggestions } from '../../shared/participant-add/participant-member-suggestions'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

export interface AddParticipantDialogData {
  seasonId: string
  troupeId: string
}

@Component({
  selector: 'app-add-participant-dialog',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
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
            (optionSelected)="onMemberOptionSelected($event.option.value)"
          >
            @for (member of filteredSuggestions(); track member.id) {
              <mat-option [value]="member.userId">
                <span class="participant-form-dialog__option">
                  <app-user-avatar
                    class="participant-form-dialog__option-avatar"
                    [displayName]="member.displayName"
                    [avatarUrl]="member.avatarUrl ?? null"
                    [gender]="member.gender ?? null"
                    [size]="24"
                  />
                  <span>{{ member.displayName }}</span>
                  @if (member.email) {
                    <span class="participant-form-dialog__option-email">{{ member.email }}</span>
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
            [accountGender]="selectedMember()?.gender ?? null"
          />
        }
        @if (showSeasonScopeHint()) {
          <p class="participant-form-dialog__hint participant-form-dialog__scope-hint">
            Externe saison — disponibilités sur toute la saison
          </p>
        }
        <p class="participant-form-dialog__hint">
          Suggestions : membres actifs de la troupe. Si l'email correspond à un compte HatCast, le
          participant sera lié automatiquement. L'email pourra aussi servir aux invitations et
          notifications à venir.
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

      .participant-form-dialog__error {
        margin: 0;
        color: var(--mat-sys-error);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class AddParticipantDialog implements OnInit {
  private readonly api = inject(ParticipantApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<AddParticipantDialog, boolean>)
  protected readonly data = inject<AddParticipantDialogData>(MAT_DIALOG_DATA)

  protected readonly displayName = signal('')
  protected readonly email = signal('')
  protected readonly saving = signal(false)
  protected readonly error = signal('')
  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly excludedUserIds = signal<Set<string>>(new Set())
  protected readonly excludedDisplayNames = signal<Set<string>>(new Set())
  protected readonly selectedMember = signal<TroupeMemberAdmin | null>(null)
  protected readonly gender = signal<MemberGender>('non_specified')

  protected readonly showGenderField = computed(() => {
    const member = this.selectedMember()
    if (!member) {
      return true
    }
    return true
  })

  protected readonly genderManagedOnAccount = computed(() => {
    const member = this.selectedMember()
    if (!member) {
      return false
    }
    return effectiveMemberGender(member.gender) !== 'non_specified'
  })

  protected readonly filteredSuggestions = computed(() =>
    filterTroupeMemberSuggestions(
      this.members(),
      this.displayName(),
      this.excludedUserIds(),
      this.excludedDisplayNames(),
    ),
  )

  protected readonly showSeasonScopeHint = computed(() => {
    const member = this.selectedMember()
    if (member) {
      return member.baselineRole !== 'MEMBER' && member.baselineRole !== 'TROUPE_ADMIN'
    }
    return this.displayName().trim().length > 0
  })

  ngOnInit(): void {
    void this.initializeSuggestions()
  }

  protected onDisplayNameInput(value: string): void {
    const hadSelection = this.selectedMember() !== null
    this.displayName.set(value)
    this.selectedMember.set(null)
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

  protected onMemberOptionSelected(userId: string): void {
    const member = this.members().find((m) => m.userId === userId)
    if (member) {
      this.onMemberSelected(member)
    }
  }

  protected onMemberSelected(member: TroupeMemberAdmin): void {
    this.selectedMember.set(member)
    this.displayName.set(member.displayName)
    this.email.set(member.email ?? '')
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
      const body: { displayName: string; email?: string; gender?: MemberGender } = {
        displayName: name,
        email: email || undefined,
      }
      if (!this.genderManagedOnAccount()) {
        const selectedGender = this.gender()
        if (selectedGender !== 'non_specified') {
          body.gender = selectedGender
        }
      }
      const r = await this.api.createSeasonParticipant(this.data.seasonId, body)
      if (!r.ok) {
        this.error.set(this.errorMessage(r.status))
        return
      }
      this.ref.close(true)
    } finally {
      this.saving.set(false)
    }
  }

  private async initializeSuggestions(): Promise<void> {
    const [membersResult, participantsResult] = await Promise.all([
      this.troupeApi.listMembers(this.data.troupeId, 0, 100),
      this.api.listSeasonParticipants(this.data.seasonId),
    ])

    if (membersResult.ok && membersResult.data) {
      this.members.set(membersResult.data.content)
    }

    if (participantsResult.ok && participantsResult.data) {
      const userIds = new Set<string>()
      const displayNames = new Set<string>()
      for (const p of participantsResult.data) {
        if (p.status !== 'ACTIVE') {
          continue
        }
        if (p.userId) {
          userIds.add(p.userId)
        }
        displayNames.add(p.displayName.trim().toLowerCase())
      }
      this.excludedUserIds.set(userIds)
      this.excludedDisplayNames.set(displayNames)
    }
  }

  private errorMessage(status: number): string {
    if (status === 409) return 'Un participant avec ce nom existe déjà.'
    if (status === 403) return 'Accès non autorisé.'
    return 'Ajout impossible.'
  }
}
