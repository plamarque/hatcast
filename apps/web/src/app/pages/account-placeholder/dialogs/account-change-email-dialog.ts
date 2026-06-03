import { Component, inject, signal } from '@angular/core'
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
  userMessageForRequiresRecentLogin,
} from '../../../core/auth/auth-user-message'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'

export interface AccountChangeEmailDialogData {
  currentEmail: string
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
  template: `
    <h2 mat-dialog-title>Changer l’adresse e-mail</h2>
    <mat-dialog-content>
      @if (requiresRecentLogin()) {
        <p class="account-change-email-dialog__message">
          {{ recentLoginMessage }}
        </p>
        <p class="account-change-email-dialog__help">
          Déconnectez-vous puis reconnectez-vous avant de modifier votre adresse e-mail.
        </p>
      } @else if (sent()) {
        <p class="account-change-email-dialog__message">{{ successMessage() }}</p>
      } @else {
        <form [formGroup]="form" class="account-change-email-dialog">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="account-change-email-dialog__field">
            <mat-label>Adresse e-mail actuelle</mat-label>
            <input matInput [value]="data.currentEmail" readonly />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="account-change-email-dialog__field">
            <mat-label>Nouvelle adresse e-mail</mat-label>
            <input matInput type="email" formControlName="newEmail" autocomplete="email" />
            @if (form.controls.newEmail.hasError('required')) {
              <mat-error>Adresse e-mail requise.</mat-error>
            } @else if (form.controls.newEmail.hasError('email')) {
              <mat-error>Adresse e-mail invalide.</mat-error>
            } @else if (form.controls.newEmail.hasError('sameEmail')) {
              <mat-error>La nouvelle adresse doit être différente de l’actuelle.</mat-error>
            }
          </mat-form-field>
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="account-change-email-dialog__actions">
      @if (requiresRecentLogin()) {
        <button type="button" mat-button mat-dialog-close>Fermer</button>
        <button type="button" mat-flat-button color="primary" (click)="goToLogin()">
          Se reconnecter
        </button>
      } @else if (sent()) {
        <button type="button" mat-flat-button color="primary" mat-dialog-close>Fermer</button>
      } @else {
        <button type="button" mat-button mat-dialog-close [disabled]="submitting()">Annuler</button>
        <button
          type="button"
          mat-flat-button
          color="primary"
          [disabled]="submitting() || form.invalid"
          (click)="submit()"
        >
          @if (submitting()) {
            <mat-spinner diameter="20" />
          } @else {
            Envoyer la vérification
          }
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .account-change-email-dialog {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: min(100vw - 4rem, 24rem);
      padding-top: 0.25rem;
    }
    .account-change-email-dialog__field {
      width: 100%;
    }
    .account-change-email-dialog__message {
      margin: 0;
      line-height: 1.5;
    }
    .account-change-email-dialog__help {
      margin: 0.75rem 0 0;
      font-size: 0.875rem;
      opacity: 0.85;
    }
    @media (max-width: 480px) {
      .account-change-email-dialog__actions {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .account-change-email-dialog__actions button {
        min-height: 3rem;
      }
    }
  `,
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
    const user = auth?.currentUser
    if (!auth || !user) {
      this.snack.open(
        'Configuration Identity Platform absente (firebase dans environment).',
        'OK',
        { duration: 10_000 },
      )
      return
    }

    const newEmail = this.form.controls.newEmail.value.trim()
    this.submitting.set(true)
    try {
      await verifyBeforeUpdateEmail(user, newEmail, verifyBeforeUpdateEmailSettings())
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
