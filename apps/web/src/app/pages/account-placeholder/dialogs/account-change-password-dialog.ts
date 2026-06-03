import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { sendPasswordResetEmail } from 'firebase/auth'

import { passwordResetEmailSettings } from '../../../core/auth/auth-action-code-settings'
import { userMessageForPasswordResetRequestFailure } from '../../../core/auth/auth-user-message'
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
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content>
      @if (sent()) {
        <p class="account-change-password-dialog__message">{{ successMessage }}</p>
      } @else {
        <p class="account-change-password-dialog__message">{{ introCopy }}</p>
        <p class="account-change-password-dialog__help">{{ helpCopy }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="account-change-password-dialog__actions">
      @if (sent()) {
        <button type="button" mat-flat-button color="primary" mat-dialog-close>Fermer</button>
      } @else {
        <button type="button" mat-button mat-dialog-close [disabled]="submitting()">Annuler</button>
        <button
          type="button"
          mat-flat-button
          color="primary"
          [disabled]="submitting()"
          (click)="confirm()"
        >
          @if (submitting()) {
            <mat-spinner diameter="20" />
          } @else {
            Envoyer l’email
          }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .account-change-password-dialog__message,
    .account-change-password-dialog__help {
      margin: 0;
      line-height: 1.5;
    }
    .account-change-password-dialog__help {
      margin-top: 0.75rem;
      font-size: 0.875rem;
      opacity: 0.85;
    }
    @media (max-width: 480px) {
      .account-change-password-dialog__actions {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .account-change-password-dialog__actions button {
        min-height: 3rem;
      }
    }
  `,
})
export class AccountChangePasswordDialog {
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialogRef = inject(MatDialogRef<AccountChangePasswordDialog>)
  protected readonly data = inject<AccountChangePasswordDialogData>(MAT_DIALOG_DATA)

  protected readonly submitting = signal(false)
  protected readonly sent = signal(false)

  protected readonly title = this.data.hasPasswordProvider
    ? 'Changer le mot de passe'
    : 'Définir un mot de passe'

  protected readonly introCopy = this.data.hasPasswordProvider
    ? 'Un email vous sera envoyé pour choisir un nouveau mot de passe. Ce parcours est distinct du « Mot de passe oublié » sur la page de connexion.'
    : 'Un email vous sera envoyé pour définir un mot de passe HatCast en plus de votre connexion Google. Vous pourrez ensuite vous connecter avec Google ou avec votre e-mail et ce mot de passe.'

  protected readonly helpCopy = this.data.hasPasswordProvider
    ? 'Le lien dans l’email mène à la page de réinitialisation HatCast. Utilisez au moins 8 caractères.'
    : 'La connexion Google restera disponible. Le mot de passe sert de secours si vous perdez l’accès à Google.'

  protected readonly successMessage =
    'Email de réinitialisation envoyé ! Si vous ne recevez pas l’email dans quelques minutes, vérifiez vos dossiers de spam/courrier indésirable.'

  protected async confirm(): Promise<void> {
    if (this.submitting()) {
      return
    }

    const auth = this.firebaseAuth.getAuthOrNull()
    const user = auth?.currentUser
    const email = user?.email?.trim() || this.data.accountEmail.trim()
    if (!auth || !email) {
      this.snack.open(
        'Adresse e-mail non disponible. Veuillez vous reconnecter.',
        'OK',
        { duration: 8000 },
      )
      return
    }

    this.submitting.set(true)
    try {
      await sendPasswordResetEmail(auth, email, passwordResetEmailSettings())
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
