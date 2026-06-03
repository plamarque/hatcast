import { Component, inject, signal, ViewEncapsulation } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { verifyBeforeUpdateEmail } from 'firebase/auth'

import { verifyBeforeUpdateEmailSettings } from '../../../core/auth/auth-action-code-settings'
import {
  userMessageForEmailUpdateRequest,
  userMessageForGoogleReauthFailure,
  userMessageForMissingFirebaseConfig,
  userMessageForMissingFirebaseSession,
  userMessageForRequiresRecentLogin,
} from '../../../core/auth/auth-user-message'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { ensureFirebaseCurrentUser } from '../../../core/auth/firebase-auth-session'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'

export interface AccountChangeEmailDialogData {
  currentEmail: string
  hasGoogleAccount?: boolean
}

function emailMustDifferFrom(currentEmail: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim().toLowerCase()
    if (!value) {
      return null
    }
    return value === currentEmail.trim().toLowerCase() ? { sameEmail: true } : null
  }
}

@Component({
  selector: 'app-account-change-email-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-change-email-dialog.html',
  styleUrl: './account-security-dialog.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountChangeEmailDialog {
  private readonly fb = inject(FormBuilder)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly authApi = inject(AuthApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly router = inject(Router)
  private readonly dialogRef = inject(MatDialogRef<AccountChangeEmailDialog>)
  protected readonly data = inject<AccountChangeEmailDialogData>(MAT_DIALOG_DATA)

  protected readonly submitting = signal(false)
  protected readonly sent = signal(false)
  protected readonly requiresRecentLogin = signal(false)
  protected readonly successMessage = signal('')
  protected readonly recentLoginMessage = userMessageForRequiresRecentLogin()
  protected readonly sessionHelpMessage = userMessageForMissingFirebaseSession()

  protected readonly form = this.fb.nonNullable.group({
    newEmail: [
      '',
      [Validators.required, Validators.email, emailMustDifferFrom(this.data.currentEmail)],
    ],
  })

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid || this.submitting()) {
      return
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.snack.open(userMessageForMissingFirebaseConfig(), 'OK', { duration: 10_000 })
      return
    }

    this.submitting.set(true)
    try {
      const firebaseUser = await ensureFirebaseCurrentUser(auth, {
        allowGoogleReauth: this.data.hasGoogleAccount === true,
      })
      if (!firebaseUser) {
        if (this.data.hasGoogleAccount === true) {
          this.snack.open(userMessageForGoogleReauthFailure(), 'OK', { duration: 10_000 })
        }
        this.requiresRecentLogin.set(true)
        return
      }

      const idToken = await firebaseUser.getIdToken(true)
      await this.authApi.signInWithIdentityPlatformIdToken(idToken)

      const newEmail = this.form.controls.newEmail.value.trim()
      await verifyBeforeUpdateEmail(firebaseUser, newEmail, verifyBeforeUpdateEmailSettings())
      this.successMessage.set(
        `Un email de vérification a été envoyé à ${newEmail}. Cliquez sur le lien pour confirmer le changement. Vérifiez vos spams si besoin.`,
      )
      this.sent.set(true)
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      if (code === 'auth/requires-recent-login') {
        this.requiresRecentLogin.set(true)
        return
      }
      this.snack.open(userMessageForEmailUpdateRequest(code), 'OK', { duration: 8000 })
    } finally {
      this.submitting.set(false)
    }
  }

  protected async goToLogin(): Promise<void> {
    await this.authApi.logout()
    this.dialogRef.close()
    await this.router.navigate(['/connexion'])
  }
}
