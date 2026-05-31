import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  canDisablePreferredRole,
  orderedRoleKeys,
  roleEmoji,
  roleLabelSingular,
  type RoleKey,
} from '../../shared/event-roles/event-roles'

@Component({
  selector: 'app-member-preferences-form',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="member-preferences-form">
      @if (pseudoDiffersAcrossTroupes()) {
        <p class="member-preferences-form__hint member-preferences-form__hint--warn">
          Vos pseudos diffèrent selon les troupes ; l’enregistrement les harmonisera.
        </p>
      }

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="member-preferences-form__field">
        <mat-label>Pseudo</mat-label>
        <input
          matInput
          maxlength="255"
          [ngModel]="pseudo()"
          (ngModelChange)="onPseudoInput($event)"
        />
        @if (pseudoError()) {
          <mat-error>Le pseudo ne peut pas être vide.</mat-error>
        }
      </mat-form-field>
      <p class="member-preferences-form__hint">Nom affiché dans toutes vos troupes.</p>

      <h3 class="member-preferences-form__roles-heading">Rôles préférés</h3>
      <p class="member-preferences-form__hint">
        Rôles pré-cochés par défaut lors de la saisie de disponibilité.
      </p>
      @if (preferredRolesLoading()) {
        <mat-spinner diameter="24" role="status" aria-label="Chargement des rôles" />
      } @else {
        <div class="member-preferences-form__roles-grid">
          @for (key of roleKeys; track key) {
            <label class="member-preferences-form__role-option">
              <mat-checkbox
                [checked]="isPreferredRoleSelected(key)"
                [disabled]="!canToggleRole(key)"
                (change)="togglePreferredRole(key, $event.checked)"
              />
              <span class="member-preferences-form__role-label">
                <span aria-hidden="true">{{ roleEmoji(key) }}</span>
                {{ roleLabel(key) }}
              </span>
            </label>
          }
        </div>
      }

      <button
        mat-flat-button
        color="primary"
        type="button"
        class="member-preferences-form__save"
        data-testid="member-preferences-save"
        [disabled]="saving() || preferredRolesLoading() || !canSave()"
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
    .member-preferences-form__field {
      width: 100%;
    }
    .member-preferences-form__hint {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.85;
      line-height: 1.4;
    }
    .member-preferences-form__hint--warn {
      color: var(--mat-sys-error);
      opacity: 1;
    }
    .member-preferences-form__roles-heading {
      margin: 0.25rem 0 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .member-preferences-form__roles-grid {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .member-preferences-form__role-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      min-height: 3rem;
    }
    .member-preferences-form__role-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .member-preferences-form__save {
      align-self: flex-start;
      min-height: 3rem;
    }
  `,
})
export class MemberPreferencesForm implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly snack = inject(MatSnackBar)

  protected readonly roleKeys = orderedRoleKeys()
  protected readonly pseudo = signal('')
  protected readonly pseudoError = signal(false)
  protected readonly preferredRoles = signal<string[]>([])
  protected readonly preferredRolesLoading = signal(true)
  protected readonly saving = signal(false)

  private initialPseudo = ''
  private initialRoles: string[] = []

  protected readonly pseudoDiffersAcrossTroupes = computed(() => {
    const names = this.troupeContext
      .activeTroupes()
      .map((t) => t.membership.displayName.trim())
      .filter(Boolean)
    return names.length > 1 && new Set(names).size > 1
  })

  protected readonly canSave = computed(() => {
    const pseudoChanged = this.pseudo().trim() !== this.initialPseudo
    const rolesChanged =
      [...this.preferredRoles()].sort().join(',') !== [...this.initialRoles].sort().join(',')
    return this.pseudo().trim().length > 0 && (pseudoChanged || rolesChanged)
  })

  async ngOnInit(): Promise<void> {
    await this.troupeContext.load()
    const troupes = this.troupeContext.activeTroupes()
    const first = troupes[0]
    if (first) {
      this.initialPseudo = first.membership.displayName.trim()
      this.pseudo.set(this.initialPseudo)
    }
    await this.loadPreferredRoles(first?.id)
  }

  protected onPseudoInput(value: string): void {
    this.pseudo.set(value)
    if (value.trim()) {
      this.pseudoError.set(false)
    }
  }

  protected roleLabel(key: RoleKey): string {
    return roleLabelSingular(key)
  }

  protected roleEmoji(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected canToggleRole(key: RoleKey): boolean {
    return canDisablePreferredRole(key) && !this.saving()
  }

  protected isPreferredRoleSelected(key: RoleKey): boolean {
    return this.preferredRoles().includes(key)
  }

  protected togglePreferredRole(key: RoleKey, checked: boolean): void {
    if (!canDisablePreferredRole(key)) {
      return
    }
    const current = new Set(this.preferredRoles())
    if (checked) {
      current.add(key)
    } else {
      current.delete(key)
    }
    current.add('volunteer')
    this.preferredRoles.set([...current])
  }

  protected async save(): Promise<void> {
    const nextPseudo = this.pseudo().trim()
    if (!nextPseudo) {
      this.pseudoError.set(true)
      return
    }
    const troupes = this.troupeContext.activeTroupes()
    if (troupes.length === 0) {
      this.snack.open('Aucune troupe active.', 'OK', { duration: 4000 })
      return
    }

    this.saving.set(true)
    try {
      const pseudoChanged = nextPseudo !== this.initialPseudo
      const rolesChanged =
        [...this.preferredRoles()].sort().join(',') !== [...this.initialRoles].sort().join(',')

      for (const troupe of troupes) {
        if (pseudoChanged) {
          const membershipResult = await this.troupeApi.updateMyMembership(troupe.id, {
            displayName: nextPseudo,
          })
          if (!membershipResult.ok || !membershipResult.data) {
            this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
            return
          }
          this.troupeContext.patchMembershipDisplayName(
            troupe.id,
            membershipResult.data.displayName,
          )
        }
        if (rolesChanged) {
          const rolesResult = await this.memberProfileApi.updatePreferredRoles(
            troupe.id,
            this.preferredRoles(),
          )
          if (!rolesResult.ok || !rolesResult.data) {
            this.snack.open('Enregistrement des rôles impossible', 'OK', { duration: 5000 })
            return
          }
        }
      }

      this.initialPseudo = nextPseudo
      this.initialRoles = [...this.preferredRoles()]
      this.pseudo.set(nextPseudo)
      this.snack.open('Préférences enregistrées', 'OK', { duration: 3000 })
    } finally {
      this.saving.set(false)
    }
  }

  private async loadPreferredRoles(troupeId: string | undefined): Promise<void> {
    this.preferredRolesLoading.set(true)
    try {
      if (!troupeId) {
        this.preferredRoles.set([])
        this.initialRoles = []
        return
      }
      const result = await this.memberProfileApi.getPreferredRoles(troupeId)
      const keys = result?.ok && result.data ? result.data.preferredRoleKeys : []
      this.preferredRoles.set(keys)
      this.initialRoles = [...keys]
    } finally {
      this.preferredRolesLoading.set(false)
    }
  }
}
