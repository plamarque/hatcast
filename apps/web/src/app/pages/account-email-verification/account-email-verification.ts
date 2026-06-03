import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { applyActionCode } from 'firebase/auth'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { userMessageForEmailVerificationComplete } from '../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'

type VerificationPhase = 'loading' | 'missing' | 'no-config' | 'invalid' | 'success'

@Component({
  selector: 'app-account-email-verification',
  imports: [MatCardModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './account-email-verification.html',
  styleUrl: './account-email-verification.scss',
})
export class AccountEmailVerification implements OnInit {
  private readonly route = inject(ActivatedRoute)
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

    const oobCode = this.route.snapshot.queryParamMap.get('oobCode')?.trim()
    const mode = this.route.snapshot.queryParamMap.get('mode')?.trim()
    if (!oobCode) {
      this.phase.set('missing')
      return
    }
    if (mode && mode !== 'verifyAndChangeEmail' && mode !== 'verifyEmail') {
      this.phase.set('invalid')
      return
    }

    try {
      await applyActionCode(auth, oobCode)
      const user = auth.currentUser
      if (user) {
        await user.reload()
        const idToken = await user.getIdToken(true)
        await this.authApi.signInWithIdentityPlatformIdToken(idToken)
        await this.authApi.getMe()
      }
      this.phase.set('success')
      this.snack.open('Votre adresse email a été mise à jour.', 'OK', { duration: 5000 })
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForEmailVerificationComplete(code), 'OK', { duration: 10_000 })
      this.phase.set('invalid')
    }
  }

  protected async goToAccount(): Promise<void> {
    await this.router.navigate(['/compte'])
  }
}
