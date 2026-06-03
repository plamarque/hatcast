import { Component, ElementRef, inject, OnDestroy, signal, viewChild } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

import { environment } from '../../../../environments/environment'
import {
  userMessageForAccountDeletionFailure,
  userMessageForAccountDeletionReAuth,
} from '../../../core/auth/auth-user-message'
import { AuthApiService } from '../../../core/auth/auth-api.service'
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service'
import { hasPasswordProvider } from '../../../core/auth/firebase-auth-providers'

export interface AccountDeleteDialogData {
  accountEmail: string
  hasGoogleAccount: boolean
}

const CONFIRM_PHRASE = 'SUPPRIMER'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: {
            client_id: string
            callback: (resp: { credential: string }) => void
          }) => void
          renderButton: (
            el: HTMLElement,
            opts: {
              theme?: string
              size?: string
              type?: string
              shape?: string
              text?: string
              width?: number
              locale?: string
            },
          ) => void
        }
      }
    }
  }
}

@Component({
  selector: 'app-account-delete-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-delete-dialog.html',
  styleUrl: './account-delete-dialog.scss',
})
export class AccountDeleteDialog implements OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly authApi = inject(AuthApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly router = inject(Router)
  private readonly dialogRef = inject(MatDialogRef<AccountDeleteDialog>)
  protected readonly data = inject<AccountDeleteDialogData>(MAT_DIALOG_DATA)

  private readonly googleHost = viewChild<ElementRef<HTMLDivElement>>('googleReauthHost')
  private gsiPollIntervalId: ReturnType<typeof setInterval> | null = null

  protected readonly step = signal<1 | 2>(1)
  protected readonly submitting = signal(false)
  protected readonly hasPassword = signal(false)
  protected readonly googleReauthReady = signal(false)

  protected readonly form = this.fb.nonNullable.group({
    confirmPhrase: ['', [Validators.required, Validators.pattern(new RegExp(`^${CONFIRM_PHRASE}$`))]],
    password: [''],
  })

  constructor() {
    const auth = this.firebaseAuth.getAuthOrNull()
    if (auth?.currentUser) {
      this.hasPassword.set(hasPasswordProvider(auth))
    }
  }

  ngOnDestroy(): void {
    this.clearGsiPoll()
  }

  protected goToStep2(): void {
    this.step.set(2)
  }

  protected confirmPhraseValid(): boolean {
    return this.form.controls.confirmPhrase.valid
  }

  protected onConfirmPhraseInput(): void {
    if (!this.hasPassword() && this.data.hasGoogleAccount && this.confirmPhraseValid()) {
      // Host appears after @if (confirmPhraseValid()) renders on the next CD cycle.
      setTimeout(() => this.initGoogleReauth(), 0)
      return
    }
    if (!this.confirmPhraseValid()) {
      this.clearGsiPoll()
      this.googleReauthReady.set(false)
      this.googleHost()?.nativeElement.replaceChildren()
    }
  }

  protected backToStep1(): void {
    this.step.set(1)
    this.clearGsiPoll()
    this.googleReauthReady.set(false)
  }

  protected confirmEnabled(): boolean {
    if (this.submitting()) {
      return false
    }
    const phraseOk = this.form.controls.confirmPhrase.valid
    if (!phraseOk) {
      return false
    }
    if (this.hasPassword()) {
      return this.form.controls.password.value.trim().length > 0
    }
    return true
  }

  protected async confirmDelete(): Promise<void> {
    this.form.markAllAsTouched()
    if (!this.confirmEnabled()) {
      return
    }

    this.submitting.set(true)
    try {
      const idToken = await this.obtainFreshIdToken()
      const result = await this.authApi.deleteAccount(idToken)
      if (result.ok) {
        await this.authApi.logout()
        this.dialogRef.close(true)
        this.snack.open('Votre compte a été supprimé.', 'OK', { duration: 6000 })
        await this.router.navigate(['/connexion'])
        return
      }
      this.snack.open(
        userMessageForAccountDeletionFailure(result.status, result.message),
        'OK',
        { duration: 10_000 },
      )
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForAccountDeletionReAuth(code), 'OK', { duration: 8000 })
    } finally {
      this.submitting.set(false)
    }
  }

  protected async onGoogleReauthCredential(credential: string): Promise<void> {
    if (this.submitting()) {
      return
    }
    if (!this.confirmPhraseValid()) {
      this.snack.open('Saisissez exactement « SUPPRIMER » avant de continuer.', 'OK', {
        duration: 8000,
      })
      return
    }

    this.submitting.set(true)
    try {
      const result = await this.authApi.deleteAccount(credential)
      if (result.ok) {
        await this.authApi.logout()
        this.dialogRef.close(true)
        this.snack.open('Votre compte a été supprimé.', 'OK', { duration: 6000 })
        await this.router.navigate(['/connexion'])
        return
      }
      this.snack.open(
        userMessageForAccountDeletionFailure(result.status, result.message),
        'OK',
        { duration: 10_000 },
      )
    } catch (e: unknown) {
      const code =
        typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForAccountDeletionReAuth(code), 'OK', { duration: 8000 })
    } finally {
      this.submitting.set(false)
    }
  }

  private async obtainFreshIdToken(): Promise<string> {
    const auth = this.firebaseAuth.getAuthOrNull()
    const user = auth?.currentUser
    if (!auth || !user) {
      throw { code: 'auth/requires-recent-login' }
    }

    if (this.hasPassword()) {
      const password = this.form.controls.password.value
      const email = user.email?.trim() || this.data.accountEmail.trim()
      const credential = EmailAuthProvider.credential(email, password)
      await reauthenticateWithCredential(user, credential)
      return user.getIdToken(true)
    }

    throw { code: 'auth/requires-recent-login' }
  }

  private initGoogleReauth(): void {
    const clientId = environment.googleOAuthWebClientId
    if (!clientId) {
      this.snack.open(
        'Connexion Google indisponible (configuration manquante).',
        'OK',
        { duration: 8000 },
      )
      return
    }

    const tryInit = () => {
      const g = window.google?.accounts?.id
      const host = this.googleHost()?.nativeElement
      if (!g || !host) {
        return
      }
      g.initialize({
        client_id: clientId,
        callback: (resp) => void this.onGoogleReauthCredential(resp.credential),
      })
      const stack = host.parentElement
      const rawW = stack?.getBoundingClientRect().width ?? 0
      const w = Math.max(Math.floor(rawW), 280)
      host.replaceChildren()
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      g.renderButton(host, {
        theme: dark ? 'filled_black' : 'outline',
        type: 'standard',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: w,
        locale: 'fr',
      })
      this.googleReauthReady.set(true)
    }

    if (window.google?.accounts?.id && this.googleHost()?.nativeElement) {
      tryInit()
      return
    }

    this.gsiPollIntervalId = window.setInterval(() => {
      if (window.google?.accounts?.id && this.googleHost()?.nativeElement) {
        this.clearGsiPoll()
        tryInit()
      }
    }, 100)
  }

  private clearGsiPoll(): void {
    if (this.gsiPollIntervalId !== null) {
      window.clearInterval(this.gsiPollIntervalId)
      this.gsiPollIntervalId = null
    }
  }
}
