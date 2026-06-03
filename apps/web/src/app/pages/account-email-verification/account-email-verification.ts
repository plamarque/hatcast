import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'
import { applyActionCode, type Auth } from 'firebase/auth'

import { readFirebaseActionLinkParams } from '../../core/auth/auth-action-code-settings'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { userMessageForEmailVerificationComplete } from '../../core/auth/auth-user-message'
import { waitForFirebaseAuthReady } from '../../core/auth/firebase-auth-session'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { rememberPendingPostLoginRedirect } from '../../core/navigation/post-login-redirect-storage'

type VerificationPhase = 'loading' | 'reconnect' | 'no-config' | 'invalid' | 'success'

const EMAIL_CHANGE_MODES = new Set(['verifyAndChangeEmail', 'verifyEmail'])

@Component({
  selector: 'app-account-email-verification',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './account-email-verification.html',
  styleUrl: './account-email-verification.scss',
})
export class AccountEmailVerification implements OnInit {
  private readonly router = inject(Router)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly authApi = inject(AuthApiService)
  private readonly snack = inject(MatSnackBar)

  protected readonly phase = signal<VerificationPhase>('loading')

  async ngOnInit(): Promise<void> {
    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.phase.set('no-config')
      return
    }

    const { oobCode, mode } = readFirebaseActionLinkParams(globalThis.location.href)

    if (!oobCode) {
      // Sans oobCode : pas de succès automatique (évite faux positif si l’URL est visitée hors lien).
      // Flux page hébergée IdP → continueUrl sans code : inviter la reconnexion pour sync HatCast.
      this.phase.set('reconnect')
      return
    }

    if (mode && !EMAIL_CHANGE_MODES.has(mode)) {
      this.phase.set('invalid')
      return
    }

    try {
      await applyActionCode(auth, oobCode)
      if (await this.syncHatcastSessionFromFirebase(auth)) {
        this.finishSuccess()
        return
      }
      this.phase.set('reconnect')
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForEmailVerificationComplete(code), 'OK', { duration: 10_000 })
      this.phase.set('invalid')
    }
  }

  private async syncHatcastSessionFromFirebase(auth: Auth): Promise<boolean> {
    await waitForFirebaseAuthReady(auth)
    const user = auth.currentUser
    if (!user) {
      return false
    }
    await user.reload()
    const idToken = await user.getIdToken(true)
    const exchanged = await this.authApi.signInWithIdentityPlatformIdToken(idToken)
    if (!exchanged.ok) {
      return false
    }
    const me = await this.authApi.getMe()
    return me.ok
  }

  private finishSuccess(): void {
    this.phase.set('success')
    this.snack.open('Votre adresse email a été mise à jour.', 'OK', { duration: 5000 })
  }

  protected async goToAccount(): Promise<void> {
    await this.router.navigate(['/compte'])
  }

  protected async goToLogin(): Promise<void> {
    rememberPendingPostLoginRedirect('/compte')
    await this.router.navigate(['/connexion'])
  }
}
