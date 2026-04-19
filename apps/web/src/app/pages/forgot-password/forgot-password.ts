import { Component, inject, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'
import { RouterLink } from '@angular/router'
import { sendPasswordResetEmail } from 'firebase/auth'

import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { userMessageForPasswordResetRequestFailure } from '../../core/auth/auth-user-message'

@Component({
  selector: 'app-forgot-password',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly snack = inject(MatSnackBar)

  protected readonly sending = signal(false)
  protected readonly sent = signal(false)

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  })

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    if (this.form.invalid) return
    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.snack.open(
        'Configuration Identity Platform absente (firebase dans environment).',
        'OK',
        { duration: 10_000 },
      )
      return
    }
    const { email } = this.form.getRawValue()
    this.sending.set(true)
    try {
      const continueUrl = `${globalThis.location.origin}/reinitialiser-mot-de-passe`
      await sendPasswordResetEmail(auth, email, {
        url: continueUrl,
        handleCodeInApp: false,
      })
      this.sent.set(true)
    } catch {
      this.snack.open(userMessageForPasswordResetRequestFailure(), 'OK', { duration: 8000 })
    } finally {
      this.sending.set(false)
    }
  }
}
