import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import {
  confirmPasswordReset,
  signInWithEmailAndPassword,
  verifyPasswordResetCode,
} from 'firebase/auth'

import { readFirebaseActionLinkParams } from '../../core/auth/auth-action-code-settings'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { setHatcastRememberMePreference } from '../../core/auth/hatcast-remember-me-storage'
import {
  userMessageForIdpApiFailure,
  userMessageForPasswordResetConfirm,
} from '../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'
import { environment } from '../../../environments/environment'

type ResetPhase = 'loading' | 'reconnect' | 'no-config' | 'invalid' | 'ready'

@Component({
  selector: 'app-reset-password',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly postLoginNav = inject(PostLoginNavigationService)
  private readonly fb = inject(FormBuilder)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly authApi = inject(AuthApiService)
  private readonly snack = inject(MatSnackBar)

  protected readonly isDev = !environment.production
  protected readonly phase = signal<ResetPhase>('loading')
  /** Email issu de verifyPasswordResetCode (affichage masqué partiel possible plus tard). */
  protected readonly email = signal<string | null>(null)
  private oobCodeValue: string | null = null

  protected readonly form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  })

  async ngOnInit(): Promise<void> {
    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.phase.set('no-config')
      return
    }
    const oobCode = this.readOobCode()
    if (!oobCode) {
      // IdP hosted handler → redirect continueUrl sans oobCode (mot de passe déjà changé côté Google).
      this.phase.set('reconnect')
      return
    }
    this.oobCodeValue = oobCode
    try {
      const mail = await verifyPasswordResetCode(auth, oobCode)
      this.email.set(mail)
      this.phase.set('ready')
    } catch {
      this.phase.set('invalid')
    }
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid) return
    const auth = this.firebaseAuth.getAuthOrNull()
    const oob = this.oobCodeValue
    const mail = this.email()
    if (!auth || !oob || !mail) return

    const { password, confirmPassword } = this.form.getRawValue()
    if (password !== confirmPassword) {
      this.snack.open('Les deux mots de passe ne correspondent pas.', 'OK', { duration: 6000 })
      return
    }

    try {
      await confirmPasswordReset(auth, oob, password)
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForPasswordResetConfirm(code), 'OK', { duration: 10_000 })
      return
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, mail, password)
      const idToken = await cred.user.getIdToken()
      const r = await this.authApi.signInWithIdentityPlatformIdToken(idToken, true)
      if (r.ok) {
        setHatcastRememberMePreference(true)
        this.snack.open('Mot de passe mis à jour. Connexion réussie.', 'OK', { duration: 3500 })
        await this.postLoginNav.navigateAfterSignIn(this.router)
        return
      }
      this.snack.open(userMessageForIdpApiFailure(r.status), 'OK', { duration: 10_000 })
      await this.router.navigate(['/connexion'])
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      if (this.isDev) {
        console.warn('reset-password sign-in', code, e)
      }
      this.snack.open(
        'Mot de passe mis à jour. Connectez-vous avec votre nouvel identifiant.',
        'OK',
        { duration: 8000 },
      )
      await this.router.navigate(['/connexion'])
    }
  }

  private readOobCode(): string | null {
    const fromHref = readFirebaseActionLinkParams(globalThis.location.href)
    if (fromHref.oobCode) {
      return fromHref.oobCode
    }
    return this.route.snapshot.queryParamMap.get('oobCode')?.trim() || null
  }
}
