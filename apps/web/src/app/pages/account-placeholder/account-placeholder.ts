import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const COMING_SOON_TOOLTIP = 'Fonctionnalité à venir (prochaine livraison).'
const PASSWORD_COMING_SOON_TOOLTIP =
  'Fonctionnalité à venir. Pour un mot de passe oublié, utilise le parcours de réinitialisation depuis la connexion.'

/** Mon compte — identité et sécurité globale (story 17.24). */
@Component({
  selector: 'app-account-placeholder',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly avatarSaving = signal(false)

  protected readonly emailComingSoonTooltip = COMING_SOON_TOOLTIP
  protected readonly passwordComingSoonTooltip = PASSWORD_COMING_SOON_TOOLTIP
  protected readonly deleteComingSoonTooltip = COMING_SOON_TOOLTIP

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      await this.redirectToLogin()
      return
    }
    this.user.set(session.data.user)
    this.loading.set(false)
  }

  protected avatarDisplayName(): string {
    const u = this.user()
    if (!u) return '?'
    return u.displayName?.trim() || u.email || 'Compte'
  }

  protected accountDisplayName(): string | null {
    const name = this.user()?.displayName?.trim()
    return name || null
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

  protected async logout(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }

  private async redirectToLogin(): Promise<void> {
    this.loading.set(false)
    this.snack.open('Votre session a expiré ou vous n’êtes pas connecté.', 'OK', {
      duration: 6000,
    })
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
