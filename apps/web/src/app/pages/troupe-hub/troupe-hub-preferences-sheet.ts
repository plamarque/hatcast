import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { MemberProfileApiService } from '../../core/member-profile/member-profile-api.service'
import { TroupeApiService, type TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  canDisablePreferredRole,
  orderedRoleKeys,
  roleEmoji,
  roleLabelSingular,
  type RoleKey,
} from '../../shared/event-roles/event-roles'

export interface TroupeHubPreferencesSheetData {
  troupe: TroupeListItem
}

@Component({
  selector: 'app-troupe-hub-preferences-sheet',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="troupe-prefs-sheet">
      <div class="troupe-prefs-sheet__header">
        <h2 class="troupe-prefs-sheet__title">Préférences dans cette troupe</h2>
        <button
          type="button"
          mat-icon-button
          aria-label="Fermer"
          (click)="close()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <p class="troupe-prefs-sheet__troupe">{{ data.troupe.name }}</p>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="troupe-prefs-sheet__field">
        <mat-label>Pseudo</mat-label>
        <input
          matInput
          maxlength="255"
          [ngModel]="pseudo()"
          (ngModelChange)="onPseudoInput($event)"
          (keydown.enter)="savePseudo()"
        />
        @if (pseudoError()) {
          <mat-error>Le pseudo ne peut pas être vide.</mat-error>
        }
      </mat-form-field>
      <button
        mat-stroked-button
        type="button"
        [disabled]="savingPseudo() || !canSavePseudo()"
        (click)="savePseudo()"
      >
        @if (savingPseudo()) {
          <mat-spinner diameter="20" />
        } @else {
          Enregistrer le pseudo
        }
      </button>

      <h3 class="troupe-prefs-sheet__roles-heading">Rôles préférés</h3>
      <p class="troupe-prefs-sheet__roles-hint">
        Rôles pré-cochés par défaut lors de la saisie de disponibilité.
      </p>
      @if (preferredRolesLoading()) {
        <mat-spinner diameter="24" role="status" />
      } @else {
        <div class="troupe-prefs-sheet__roles-grid">
          @for (key of roleKeys; track key) {
            <label class="troupe-prefs-sheet__role-option">
              <mat-checkbox
                [checked]="isPreferredRoleSelected(key)"
                [disabled]="!canToggleRole(key) || savingRoles()"
                (change)="togglePreferredRole(key, $event.checked)"
              />
              <span class="troupe-prefs-sheet__role-label">
                <span aria-hidden="true">{{ roleEmoji(key) }}</span>
                {{ roleLabel(key) }}
              </span>
            </label>
          }
        </div>
        <button
          mat-stroked-button
          type="button"
          [disabled]="savingRoles()"
          (click)="savePreferredRoles()"
        >
          @if (savingRoles()) {
            <mat-spinner diameter="20" />
          } @else {
            Enregistrer les rôles
          }
        </button>
      }
    </div>
  `,
  styles: `
    .troupe-prefs-sheet {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem 0 1rem;
      max-width: 28rem;
    }
    .troupe-prefs-sheet__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .troupe-prefs-sheet__title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .troupe-prefs-sheet__troupe {
      margin: 0;
      opacity: 0.85;
      font-size: 0.9rem;
    }
    .troupe-prefs-sheet__field {
      width: 100%;
    }
    .troupe-prefs-sheet__roles-heading {
      margin: 0.5rem 0 0;
      font-size: 1rem;
      font-weight: 600;
    }
    .troupe-prefs-sheet__roles-hint {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.85;
    }
    .troupe-prefs-sheet__roles-grid {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .troupe-prefs-sheet__role-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    .troupe-prefs-sheet__role-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  `,
})
export class TroupeHubPreferencesSheet implements OnInit {
  private readonly troupeApi = inject(TroupeApiService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly snack = inject(MatSnackBar)
  private readonly sheetRef = inject(MatBottomSheetRef<TroupeHubPreferencesSheet>)
  protected readonly data = inject<TroupeHubPreferencesSheetData>(MAT_BOTTOM_SHEET_DATA)

  protected readonly roleKeys = orderedRoleKeys()
  protected readonly pseudo = signal('')
  protected readonly pseudoError = signal(false)
  protected readonly savingPseudo = signal(false)
  protected readonly preferredRoles = signal<string[]>([])
  protected readonly preferredRolesLoading = signal(true)
  protected readonly savingRoles = signal(false)

  protected readonly canSavePseudo = computed(() => this.pseudo().trim().length > 0)

  async ngOnInit(): Promise<void> {
    this.pseudo.set(this.data.troupe.membership.displayName)
    await this.loadPreferredRoles()
  }

  protected close(): void {
    this.sheetRef.dismiss()
  }

  protected onPseudoInput(value: string): void {
    this.pseudo.set(value)
    if (value.trim()) {
      this.pseudoError.set(false)
    }
  }

  protected async savePseudo(): Promise<void> {
    const next = this.pseudo().trim()
    if (!next) {
      this.pseudoError.set(true)
      return
    }
    const troupe = this.data.troupe
    if (next === troupe.membership.displayName) {
      return
    }
    this.savingPseudo.set(true)
    try {
      const result = await this.troupeApi.updateMyMembership(troupe.id, { displayName: next })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }
      this.troupeContext.patchMembershipDisplayName(troupe.id, result.data.displayName)
      this.pseudo.set(result.data.displayName)
      this.snack.open('Pseudo enregistré', 'OK', { duration: 3000 })
    } finally {
      this.savingPseudo.set(false)
    }
  }

  protected roleLabel(key: RoleKey): string {
    return roleLabelSingular(key)
  }

  protected roleEmoji(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected canToggleRole(key: RoleKey): boolean {
    return canDisablePreferredRole(key)
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

  protected async savePreferredRoles(): Promise<void> {
    const keys = this.preferredRoles()
    this.savingRoles.set(true)
    try {
      const result = await this.memberProfileApi.updatePreferredRoles(
        this.data.troupe.id,
        keys,
      )
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement des rôles impossible', 'OK', { duration: 5000 })
        return
      }
      this.preferredRoles.set(result.data.preferredRoleKeys)
      this.snack.open('Rôles préférés enregistrés', 'OK', { duration: 3000 })
    } finally {
      this.savingRoles.set(false)
    }
  }

  private async loadPreferredRoles(): Promise<void> {
    this.preferredRolesLoading.set(true)
    try {
      const result = await this.memberProfileApi.getPreferredRoles(this.data.troupe.id)
      this.preferredRoles.set(
        result?.ok && result.data ? result.data.preferredRoleKeys : [],
      )
    } finally {
      this.preferredRolesLoading.set(false)
    }
  }
}
