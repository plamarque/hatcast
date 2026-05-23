import { Component, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
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
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

/** Placeholder story 1.6 — paramètres de compte (email, mot de passe connecté). Story 2.5 — pseudo par troupe. Story 2.6 — avatar. */
@Component({
  selector: 'app-account-placeholder',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly memberProfileApi = inject(MemberProfileApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly loadError = signal(false)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly troupes = signal<TroupeListItem[]>([])
  protected readonly pseudoByTroupeId = signal<Record<string, string>>({})
  protected readonly savingTroupeId = signal<string | null>(null)
  protected readonly validationErrorByTroupeId = signal<Record<string, boolean>>({})
  protected readonly avatarSaving = signal(false)
  protected readonly roleKeys = orderedRoleKeys()
  protected readonly preferredRolesByTroupeId = signal<Record<string, string[]>>({})
  protected readonly preferredRolesLoading = signal(false)
  protected readonly savingPreferredRolesTroupeId = signal<string | null>(null)

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.user.set(session.data.user)

    const loaded = await this.troupeContext.load()
    this.loading.set(false)
    if (!loaded) {
      this.loadError.set(true)
      return
    }

    const active = this.troupeContext.activeTroupes()
    this.troupes.set(active)
    this.pseudoByTroupeId.set(
      Object.fromEntries(active.map((troupe) => [troupe.id, troupe.membership.displayName])),
    )
    await this.loadPreferredRoles(active)
  }

  protected avatarDisplayName(): string {
    const u = this.user()
    if (!u) return '?'
    return this.troupeContext.currentUserDisplayLabel(u)
  }

  protected async onAvatarFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    if (file.size > MAX_AVATAR_BYTES) {
      this.snack.open('Fichier trop volumineux (2 Mo max.)', 'OK', { duration: 5000 })
      return
    }

    this.avatarSaving.set(true)
    try {
      const result = await this.auth.uploadAvatar(file)
      if (!result.ok || !result.data) {
        this.snack.open('Format non pris en charge ou erreur serveur', 'OK', { duration: 5000 })
        return
      }
      this.user.set(result.data.user)
      this.snack.open('Photo enregistrée', 'OK', { duration: 3000 })
    } finally {
      this.avatarSaving.set(false)
    }
  }

  protected async importGoogleAvatar(): Promise<void> {
    this.avatarSaving.set(true)
    try {
      const result = await this.auth.importGoogleAvatar()
      if (!result.ok || !result.data) {
        this.snack.open('Impossible d’importer la photo Google', 'OK', { duration: 5000 })
        return
      }
      this.user.set(result.data.user)
      this.snack.open('Photo enregistrée', 'OK', { duration: 3000 })
    } finally {
      this.avatarSaving.set(false)
    }
  }

  protected async deleteAvatar(): Promise<void> {
    this.avatarSaving.set(true)
    try {
      const result = await this.auth.deleteAvatar()
      if (!result.ok || !result.data) {
        this.snack.open('Suppression impossible', 'OK', { duration: 5000 })
        return
      }
      this.user.set(result.data.user)
      this.snack.open('Photo supprimée', 'OK', { duration: 3000 })
    } finally {
      this.avatarSaving.set(false)
    }
  }

  protected onPseudoInput(troupeId: string, value: string): void {
    this.pseudoByTroupeId.update((current) => ({ ...current, [troupeId]: value }))
    if (value.trim()) {
      this.validationErrorByTroupeId.update((current) => {
        const next = { ...current }
        delete next[troupeId]
        return next
      })
    }
  }

  protected async savePseudo(troupe: TroupeListItem): Promise<void> {
    const next = this.pseudoByTroupeId()[troupe.id]?.trim() ?? ''
    if (!next) {
      this.validationErrorByTroupeId.update((current) => ({ ...current, [troupe.id]: true }))
      return
    }
    if (next === troupe.membership.displayName) {
      return
    }

    this.savingTroupeId.set(troupe.id)
    try {
      const result = await this.troupeApi.updateMyMembership(troupe.id, { displayName: next })
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement impossible', 'OK', { duration: 5000 })
        return
      }

      this.troupeContext.patchMembershipDisplayName(troupe.id, result.data.displayName)
      this.pseudoByTroupeId.update((current) => ({
        ...current,
        [troupe.id]: result.data!.displayName,
      }))
      this.troupes.set(this.troupeContext.activeTroupes())
      this.snack.open('Pseudo enregistré', 'OK', { duration: 3000 })
    } finally {
      this.savingTroupeId.set(null)
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

  protected isPreferredRoleSelected(
    troupeId: string,
    key: RoleKey,
  ): boolean {
    return this.preferredRolesByTroupeId()[troupeId]?.includes(key) ?? false
  }

  protected togglePreferredRole(
    troupeId: string,
    key: RoleKey,
    checked: boolean,
  ): void {
    if (!canDisablePreferredRole(key)) {
      return
    }
    const current = new Set(this.preferredRolesByTroupeId()[troupeId] ?? [])
    if (checked) {
      current.add(key)
    } else {
      current.delete(key)
    }
    current.add('volunteer')
    this.preferredRolesByTroupeId.update((roles) => ({
      ...roles,
      [troupeId]: [...current],
    }))
  }

  protected async savePreferredRoles(troupe: TroupeListItem): Promise<void> {
    const keys = this.preferredRolesByTroupeId()[troupe.id]
    if (!keys) {
      return
    }
    this.savingPreferredRolesTroupeId.set(troupe.id)
    try {
      const result = await this.memberProfileApi.updatePreferredRoles(troupe.id, keys)
      if (!result.ok || !result.data) {
        this.snack.open('Enregistrement des rôles impossible', 'OK', { duration: 5000 })
        return
      }
      this.preferredRolesByTroupeId.update((roles) => ({
        ...roles,
        [troupe.id]: result.data!.preferredRoleKeys,
      }))
      this.snack.open('Rôles préférés enregistrés', 'OK', { duration: 3000 })
    } finally {
      this.savingPreferredRolesTroupeId.set(null)
    }
  }

  private async loadPreferredRoles(troupes: TroupeListItem[]): Promise<void> {
    this.preferredRolesLoading.set(true)
    try {
      const entries = await Promise.all(
        troupes.map(async (troupe) => {
          const result = await this.memberProfileApi.getPreferredRoles(troupe.id)
          return [troupe.id, result.ok && result.data ? result.data.preferredRoleKeys : []] as const
        }),
      )
      this.preferredRolesByTroupeId.set(Object.fromEntries(entries))
    } finally {
      this.preferredRolesLoading.set(false)
    }
  }
}
