import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import type { MemberGender } from '../../core/account/member-gender'
import { RoleToggleChipSet } from '../event-roles/role-toggle-chip-set/role-toggle-chip-set'

@Component({
  selector: 'app-member-preferences-form',
  imports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RoleToggleChipSet,
  ],
  template: `
    <div class="member-preferences-form">
      <h3 class="member-preferences-form__roles-heading">Rôles préférés</h3>
      <p class="member-preferences-form__hint">
        Pré-cochés par défaut à la saisie de disponibilité.
      </p>
      @if (preferredRolesLoading()) {
        <mat-spinner diameter="24" role="status" aria-label="Chargement des rôles" />
      } @else {
        <app-role-toggle-chip-set
          class="member-preferences-form__roles"
          ariaLabel="Rôles préférés"
          [selectedKeys]="preferredRoles()"
          [gender]="viewerGender()"
          [disabled]="saving()"
          (selectionChange)="onRolesChange($event)"
        />
      }

      <button
        mat-flat-button
        color="primary"
        type="button"
        class="member-preferences-form__save"
        data-testid="member-preferences-save"
        [disabled]="saving() || preferredRolesLoading() || loadFailed() || !canSave()"
        (click)="save()"
      >
        @if (saving()) {
          <mat-spinner diameter="20" />
        } @else {
          Enregistrer
        }
      </button>
    </div>
  `,
  styles: `
    .member-preferences-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .member-preferences-form__hint {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.85;
      line-height: 1.4;
    }
    .member-preferences-form__roles-heading {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .member-preferences-form__roles {
      display: block;
    }
    .member-preferences-form__save {
      align-self: flex-start;
      min-height: 3rem;
      width: 100%;
    }
    @media (min-width: 481px) {
      .member-preferences-form__save {
        width: auto;
      }
    }
  `,
})
export class MemberPreferencesForm implements OnInit {
  private readonly mePreferencesApi = inject(MePreferencesApiService)
  private readonly snack = inject(MatSnackBar)

  protected readonly preferredRoles = signal<string[]>([])
  protected readonly preferredRolesLoading = signal(true)
  protected readonly saving = signal(false)
  protected readonly loadFailed = signal(false)
  protected readonly viewerGender = signal<MemberGender>('non_specified')

  private initialRoles: string[] = []

  protected readonly canSave = computed(() => {
    const rolesChanged =
      [...this.preferredRoles()].sort().join(',') !== [...this.initialRoles].sort().join(',')
    return rolesChanged
  })

  async ngOnInit(): Promise<void> {
    await this.loadPreferences()
  }

  protected onRolesChange(keys: readonly string[]): void {
    this.preferredRoles.set([...keys])
  }

  protected async save(): Promise<void> {
    const rolesChanged =
      [...this.preferredRoles()].sort().join(',') !== [...this.initialRoles].sort().join(',')
    if (!rolesChanged) {
      return
    }

    this.saving.set(true)
    try {
      const result = await this.mePreferencesApi.patchPreferences({
        preferredRoleKeys: this.preferredRoles(),
      })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }

      this.initialRoles = [...result.data.preferredRoleKeys]
      this.preferredRoles.set(result.data.preferredRoleKeys)

      this.snack.open('Préférences enregistrées', 'OK', { duration: 3000 })
    } finally {
      this.saving.set(false)
    }
  }

  private async loadPreferences(): Promise<void> {
    this.preferredRolesLoading.set(true)
    this.loadFailed.set(false)
    try {
      const result = await this.mePreferencesApi.getPreferences()
      if (!result.ok || !result.data) {
        this.loadFailed.set(true)
        this.snack.open('Impossible de charger vos préférences.', 'OK', { duration: 5000 })
        return
      }
      this.preferredRoles.set(result.data.preferredRoleKeys)
      this.initialRoles = [...result.data.preferredRoleKeys]
      this.viewerGender.set(result.data.gender)
    } finally {
      this.preferredRolesLoading.set(false)
    }
  }
}
