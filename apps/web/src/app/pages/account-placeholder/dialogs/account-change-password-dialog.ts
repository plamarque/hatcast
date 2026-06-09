import { Component, inject, signal, ViewEncapsulation } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { sendPasswordResetEmail } from 'firebase/auth'

import { passwordResetEmailSettings } from '../../../core/auth/auth-action-code-settings'
import {
  userMessageForMissingFirebaseConfig,
  userMessageForPasswordResetRequestFailure,
} from '../../../core/auth/auth-user-message'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'

export interface AccountChangePasswordDialogData {
  hasPasswordProvider: boolean
  accountEmail: string
}

@Component({
  selector: 'app-account-change-password-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-change-password-dialog.html',
  styleUrl: './account-security-dialog.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AccountChangePasswordDialog {
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly snack = inject(MatSnackBar)
  protected readonly data = inject<AccountChangePasswordDialogData>(MAT_DIALOG_DATA)

  protected readonly submitting = signal(false)
  protected readonly sent = signal(false)
  protected readonly sentToEmail = signal('')

  protected readonly title = this.data.hasPasswordProvider
    ? 'Changer le mot de passe'
    : 'Définir un mot de passe'

  protected readonly introCopy = this.data.hasPasswordProvider
    ? 'Un email vous sera envoyé pour choisir un nouveau mot de passe. Ce parcours est distinct du « Mot de passe oublié » sur la page de connexion.'
    : 'Un email vous sera envoyé pour définir un mot de passe HatCast en plus de votre connexion Google. Vous pourrez ensuite vous connecter avec Google ou avec votre e-mail et ce mot de passe.'

  protected readonly helpCopy = this.data.hasPasswordProvider
    ? 'Le lien dans l’email mène à la page de réinitialisation HatCast. Utilisez au moins 8 caractères.'
    : 'La connexion Google restera disponible. Le mot de passe sert de secours si vous perdez l’accès à Google.'

  protected successMessage(): string {
    const email = this.sentToEmail()
    return email
      ? `Email de réinitialisation envoyé à ${email} ! Si vous ne recevez pas l’email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.`
      : 'Email de réinitialisation envoyé ! Vérifiez vos spams si besoin.'
  }

  protected async confirm(): Promise<void> {
    if (this.submitting()) {
      return
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    if (!auth) {
      this.snack.open(userMessageForMissingFirebaseConfig(), 'OK', { duration: 10_000 })
      return
    }
    const email = auth.currentUser?.email?.trim() || this.data.accountEmail.trim()
    if (!email) {
      this.snack.open('Adresse e-mail non disponible. Veuillez vous reconnecter.', 'OK', {
        duration: 8000,
      })
      return
    }

    this.submitting.set(true)
    try {
      await sendPasswordResetEmail(auth, email, passwordResetEmailSettings())
      this.sentToEmail.set(email)
      this.sent.set(true)
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForPasswordResetRequestFailure(code), 'OK', { duration: 8000 })
    } finally {
      this.submitting.set(false)
    }
  }
}
