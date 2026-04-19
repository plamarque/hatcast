import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  type Auth,
} from 'firebase/auth'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  userMessageForGoogleSignInFailure,
  userMessageForIdpApiFailure,
  userMessageForIdentityPlatformAuth,
} from '../../core/auth/auth-user-message'
import { environment } from '../../../environments/environment'

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
            opts: { theme?: string; size?: string; type?: string },
          ) => void
        }
      }
    }
  }
}

@Component({
  selector: 'app-oauth-demo',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './oauth-demo.html',
  styleUrl: './oauth-demo.scss',
})
export class OauthDemo implements AfterViewInit {
  private readonly googleHost = viewChild<ElementRef<HTMLDivElement>>('googleButtonHost')
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly fb = inject(FormBuilder)

  protected readonly isDev = !environment.production
  /** Journal technique réservé au dev local (pas affiché en production). */
  protected readonly devLog = signal<string | null>(null)

  protected readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  })

  /** Identity Platform : config Web présente (apiKey + authDomain + projectId). */
  protected readonly hasEmailAuth = signal(this.computeHasEmailAuth())

  ngAfterViewInit(): void {
    const clientId = environment.googleOAuthWebClientId
    if (!clientId) {
      this.snack.open(
        'Configurez googleOAuthWebClientId dans environment.development.ts (voir README).',
        'OK',
        { duration: 12_000 },
      )
      this.devLog.set('googleOAuthWebClientId manquant.')
      return
    }

    const tryInit = () => {
      const g = window.google?.accounts?.id
      const host = this.googleHost()?.nativeElement
      if (!g || !host) return
      g.initialize({
        client_id: clientId,
        callback: (resp) => void this.onGoogleCredential(resp.credential),
      })
      g.renderButton(host, { theme: 'outline', size: 'large', type: 'standard' })
    }

    const id = window.setInterval(() => {
      if (window.google?.accounts?.id && this.googleHost()?.nativeElement) {
        window.clearInterval(id)
        tryInit()
      }
    }, 100)
    window.setTimeout(() => {
      window.clearInterval(id)
      if (!window.google?.accounts?.id) {
        this.snack.open(
          'Le script Google Identity Services n’a pas pu être chargé (réseau ou bloqueur).',
          'OK',
          { duration: 8000 },
        )
      }
    }, 12_000)
  }

  private computeHasEmailAuth(): boolean {
    const f = environment.firebase
    return Boolean(f?.apiKey && f.authDomain && f.projectId)
  }

  private getFirebaseAuth(): Auth | null {
    const f = environment.firebase
    if (!f?.apiKey || !f.authDomain || !f.projectId) {
      return null
    }
    let app: FirebaseApp
    if (getApps().length > 0) {
      app = getApp()
    } else {
      app = initializeApp(f)
    }
    return getAuth(app)
  }

  private async onGoogleCredential(idToken: string): Promise<void> {
    this.devLog.set(null)
    const r = await this.auth.signInWithGoogleIdToken(idToken)
    if (r.ok) {
      this.snack.open('Connexion réussie.', 'OK', { duration: 3500 })
      await this.router.navigate(['/accueil'])
      return
    }
    const msg = userMessageForGoogleSignInFailure(r.status)
    this.snack.open(msg, 'OK', { duration: 8000 })
    if (this.isDev) {
      this.devLog.set(JSON.stringify({ status: r.status, hint: 'voir logs API pour le détail' }, null, 2))
    }
  }

  protected async registerWithEmail(): Promise<void> {
    this.emailForm.markAllAsTouched()
    if (this.emailForm.invalid) return
    const auth = this.getFirebaseAuth()
    if (!auth) return
    const { email, password } = this.emailForm.getRawValue()
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()
      await this.finishIdpSignIn(idToken)
    } catch (e: unknown) {
      const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForIdentityPlatformAuth(code), 'OK', { duration: 8000 })
      if (this.isDev) {
        this.devLog.set(code || String(e))
      }
    }
  }

  protected async signInWithEmail(): Promise<void> {
    this.emailForm.markAllAsTouched()
    if (this.emailForm.invalid) return
    const auth = this.getFirebaseAuth()
    if (!auth) return
    const { email, password } = this.emailForm.getRawValue()
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await cred.user.getIdToken()
      await this.finishIdpSignIn(idToken)
    } catch (e: unknown) {
      const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForIdentityPlatformAuth(code), 'OK', { duration: 8000 })
      if (this.isDev) {
        this.devLog.set(code || String(e))
      }
    }
  }

  private async finishIdpSignIn(idToken: string): Promise<void> {
    this.devLog.set(null)
    const r = await this.auth.signInWithIdentityPlatformIdToken(idToken)
    if (r.ok) {
      this.snack.open('Connexion réussie.', 'OK', { duration: 3500 })
      await this.router.navigate(['/accueil'])
      return
    }
    const msg = userMessageForIdpApiFailure(r.status)
    this.snack.open(msg, 'OK', { duration: 8000 })
    if (this.isDev) {
      this.devLog.set(JSON.stringify({ status: r.status }, null, 2))
    }
  }
}
