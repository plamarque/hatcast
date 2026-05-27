import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router } from '@angular/router'
import { sendPasswordResetEmail } from 'firebase/auth'

import { userMessageForPasswordResetRequestFailure } from '../../core/auth/auth-user-message'
import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

const COMING_SOON_TOOLTIP = 'Fonctionnalité à venir (prochaine livraison).'

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
    UserAvatarComponent,
  ],
  templateUrl: './account-placeholder.html',
  styleUrl: './account-placeholder.scss',
})
export class AccountPlaceholder implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loading = signal(true)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly avatarSaving = signal(false)
  protected readonly passwordResetSending = signal(false)

  protected readonly emailComingSoonTooltip = COMING_SOON_TOOLTIP
  protected readonly notificationsComingSoonTooltip = COMING_SOON_TOOLTIP

  /** Aligné sur les préférences V1 (`PreferencesModal`) — backend Epic 8. */
  protected readonly notificationPlaceholders = [
    { id: 'availability-email', label: 'E-mails pour les appels à disponibilité' },
    { id: 'selection-email', label: 'E-mails pour les compositions' },
    { id: 'reminders-email', label: 'Rappels avant les spectacles' },
    { id: 'push', label: 'Notifications push sur cet appareil' },
  ] as const

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

  protected async requestPasswordReset(): Promise<void> {
    const email = this.user()?.email?.trim()
    if (!email) {
      this.snack.open('Aucune adresse e-mail associée à ce compte.', 'OK', { duration: 5000 })
      return
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.snack.open(
        'Configuration Identity Platform absente (firebase dans environment).',
        'OK',
        { duration: 10_000 },
      )
      return
    }

    this.passwordResetSending.set(true)
    try {
      const continueUrl = `${globalThis.location.origin}/reinitialiser-mot-de-passe`
      await sendPasswordResetEmail(auth, email, {
        url: continueUrl,
        handleCodeInApp: false,
      })
      this.snack.open(
        `Un e-mail de réinitialisation a été envoyé à ${email}.`,
        'OK',
        { duration: 8000 },
      )
    } catch {
      this.snack.open(userMessageForPasswordResetRequestFailure(), 'OK', { duration: 8000 })
    } finally {
      this.passwordResetSending.set(false)
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
