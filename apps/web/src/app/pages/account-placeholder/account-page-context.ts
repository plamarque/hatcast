import { inject, Injectable, signal } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

/** Shared Mon compte state (session user, avatar actions) — provided by account shell. */
@Injectable()
export class AccountPageContext {
  private readonly auth = inject(AuthApiService)
  private readonly snack = inject(MatSnackBar)

  readonly user = signal<UserSummary | null>(null)
  readonly avatarSaving = signal(false)

  setUser(user: UserSummary | null): void {
    this.user.set(user)
  }

  avatarDisplayName(): string {
    const u = this.user()
    if (!u) return '?'
    return u.displayName?.trim() || u.email || 'Compte'
  }

  accountDisplayName(): string | null {
    const name = this.user()?.displayName?.trim()
    return name || null
  }

  async onAvatarFileSelected(event: Event): Promise<void> {
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

  async importGoogleAvatar(): Promise<void> {
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

  async deleteAvatar(): Promise<void> {
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
}
