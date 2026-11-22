import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { showAuthSuccess } from '../../core/auth/auth-success-feedback'
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service'
import { setHatcastRememberMePreference } from '../../core/auth/hatcast-remember-me-storage'
import { PostLoginNavigationService } from '../../core/navigation/post-login-navigation.service'
import {
  clearPendingPostLoginRedirect,
  isValidInternalRedirectPath,
  rememberPendingPostLoginRedirect,
} from '../../core/navigation/post-login-redirect-storage'
import {
  buildDevSeedIdpToken,
  isDevSeedImprobotsEmail,
  isDevSeedLoginRuntime,
  isLocalDevRuntime,
} from '../../core/auth/dev-seed-auth'
import { finishIdpSignInAfterEmailAuth } from '../../core/auth/finish-idp-email-auth'
import {
  userMessageForGoogleSignInFailure,
  userMessageForIdentityPlatformAuth,
} from '../../core/auth/auth-user-message'
import { firstValueFrom } from 'rxjs'

import { environment } from '../../../environments/environment'
import { guidesFromEnvironment } from '../../core/onboarding/onboarding-video-guides'
import { GoogleAvatarPromptDialog } from './google-avatar-prompt-dialog'

const GOOGLE_AVATAR_PROMPT_DISMISSED_KEY = 'hatcast.googleAvatarPromptDismissed'

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
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements AfterViewInit, OnDestroy, OnInit {
  private readonly googleHost = viewChild<ElementRef<HTMLDivElement>>('googleButtonHost')
  private gsiPollIntervalId: ReturnType<typeof setInterval> | null = null
  private gsiLoadTimeoutId: ReturnType<typeof setTimeout> | null = null
  private readonly auth = inject(AuthApiService)
  private readonly firebaseAuth = inject(FirebaseAuthService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly postLoginNav = inject(PostLoginNavigationService)
  private readonly snack = inject(MatSnackBar)
  private readonly fb = inject(FormBuilder)
  private readonly dialog = inject(MatDialog)

  protected readonly isDev = !environment.production || isLocalDevRuntime()
  protected readonly showDevSeedHint = isDevSeedLoginRuntime()
  /** Journal technique réservé au dev local (pas affiché en production). */
  protected readonly devLog = signal<string | null>(null)

  protected readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]],
  })

  /** Identity Platform : config Web présente (apiKey + authDomain + projectId). */
  protected readonly hasEmailAuth = signal(this.firebaseAuth.hasFirebaseWebConfig())

  /** Parité V1 : coché par défaut (session longue côté API). */
  protected readonly rememberMe = signal(true)

  /** Bloque les soumissions répétées pendant qu’une connexion est en cours. */
  protected readonly submitting = signal(false)
  protected readonly submittingMethod = signal<'email' | 'google' | null>(null)
  protected readonly authSucceeded = signal(false)
  protected readonly emailError = signal<string | null>(null)
  protected readonly googleError = signal<string | null>(null)
  protected readonly videoGuides = computed(() => guidesFromEnvironment(environment))

  protected get signupQueryParams(): { returnUrl?: string } {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')?.trim()
    if (returnUrl && isValidInternalRedirectPath(returnUrl)) {
      return { returnUrl }
    }
    return {}
  }

  async ngOnInit(): Promise<void> {
    this.ingestReturnUrlFromQuery()
    const session = await this.auth.ensureHatcastSession()
    if (session.ok) {
      await this.postLoginNav.navigateAfterSignIn(this.router)
    }
  }

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
      const render = () =>
        requestAnimationFrame(() => requestAnimationFrame(() => this.renderGoogleSignInButton()))
      render()
    }

    this.gsiPollIntervalId = window.setInterval(() => {
      if (window.google?.accounts?.id && this.googleHost()?.nativeElement) {
        this.clearGsiPollInterval()
        tryInit()
      }
    }, 100)
    this.gsiLoadTimeoutId = window.setTimeout(() => {
      this.clearGsiPollInterval()
      if (!window.google?.accounts?.id) {
        this.snack.open(
          'Le script Google Identity Services n’a pas pu être chargé (réseau ou bloqueur).',
          'OK',
          { duration: 8000 },
        )
      }
    }, 12_000)
  }

  ngOnDestroy(): void {
    this.clearGsiPollInterval()
    if (this.gsiLoadTimeoutId !== null) {
      window.clearTimeout(this.gsiLoadTimeoutId)
      this.gsiLoadTimeoutId = null
    }
  }

  private clearGsiPollInterval(): void {
    if (this.gsiPollIntervalId !== null) {
      window.clearInterval(this.gsiPollIntervalId)
      this.gsiPollIntervalId = null
    }
  }

  private ingestReturnUrlFromQuery(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')?.trim()
    if (!returnUrl) return
    if (isValidInternalRedirectPath(returnUrl)) {
      rememberPendingPostLoginRedirect(returnUrl)
      return
    }
    clearPendingPostLoginRedirect()
  }

  /** Widget Google : largeur adaptée au conteneur. */
  private renderGoogleSignInButton(): void {
    const g = window.google?.accounts?.id
    const host = this.googleHost()?.nativeElement
    if (!g || !host) return
    const stack = host.parentElement
    const rawW = stack?.getBoundingClientRect().width ?? 0
    const w = Math.max(Math.floor(rawW), 280)
    host.replaceChildren()
    g.renderButton(host, {
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'outline_dark' : 'filled_blue',
      type: 'standard',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: w,
      locale: 'fr',
    })
  }

  private async onGoogleCredential(idToken: string): Promise<void> {
    if (this.submitting()) return
    this.submitting.set(true)
    this.googleError.set(null)
    this.emailError.set(null)
    this.submittingMethod.set('google')
    try {
      this.devLog.set(null)
      const r = await this.auth.signInWithGoogleIdToken(idToken, this.rememberMe())
      if (r.ok && r.data) {
        setHatcastRememberMePreference(this.rememberMe())
        await this.maybePromptGoogleAvatarImport(r.data)
        await showAuthSuccess(() => this.authSucceeded.set(true))
        await this.postLoginNav.navigateAfterSignIn(this.router)
        return
      }
      const msg = userMessageForGoogleSignInFailure(r.status)
      this.googleError.set(msg)
      if (this.isDev) {
        this.devLog.set(JSON.stringify({ status: r.status, hint: 'voir logs API pour le détail' }, null, 2))
      }
    } finally {
      this.submittingMethod.set(null)
      this.submitting.set(false)
    }
  }

  protected async signInWithEmail(): Promise<void> {
    if (this.submitting()) return
    this.emailError.set(null)
    this.googleError.set(null)
    this.emailForm.markAllAsTouched()
    if (this.emailForm.invalid) {
      this.emailError.set('Vérifiez les champs renseignés et réessayez.')
      return
    }
    this.submitting.set(true)
    this.submittingMethod.set('email')
    try {
      const { email, password } = this.emailForm.getRawValue()
      if (isDevSeedImprobotsEmail(email)) {
        const idToken = buildDevSeedIdpToken(email, password)
        await finishIdpSignInAfterEmailAuth(
          {
            auth: this.auth,
            snack: this.snack,
            router: this.router,
            postLoginNav: this.postLoginNav,
            isDev: this.isDev,
            devLog: this.devLog,
            showSuccess: () => this.authSucceeded.set(true),
            showError: (message) => this.emailError.set(message),
          },
          {
            idToken,
            rememberMe: this.rememberMe(),
          },
        )
        return
      }
      const auth = this.firebaseAuth.getAuthOrNull()
      if (!auth) {
        this.emailError.set('Connexion email indisponible. Réessayez ou utilisez Google.')
        return
      }
      if (password.length < 8) {
        this.emailError.set('Le mot de passe doit contenir au moins 8 caractères.')
        return
      }
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const idToken = await cred.user.getIdToken()
        await finishIdpSignInAfterEmailAuth(
          {
            auth: this.auth,
            snack: this.snack,
            router: this.router,
            postLoginNav: this.postLoginNav,
            isDev: this.isDev,
            devLog: this.devLog,
            showSuccess: () => this.authSucceeded.set(true),
            showError: (message) => this.emailError.set(message),
          },
          {
            idToken,
            rememberMe: this.rememberMe(),
          },
        )
      } catch (e: unknown) {
        const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
        const message = userMessageForIdentityPlatformAuth(code)
      this.emailError.set(code === 'auth/wrong-password' || code === 'auth/invalid-credential'
        ? 'Email ou mot de passe incorrect. Vérifiez-les ou essayez de vous connecter avec Google.'
        : message)
        if (this.isDev) {
          this.devLog.set(code || String(e))
        }
      }
    } finally {
      this.submittingMethod.set(null)
      this.submitting.set(false)
    }
  }

  private async maybePromptGoogleAvatarImport(data: {
    user: { id: string; avatarUrl?: string | null }
    googlePictureUrl?: string | null
  }): Promise<void> {
    if (data.user.avatarUrl) return
    if (!data.googlePictureUrl) return
    const dismissedKey = `${GOOGLE_AVATAR_PROMPT_DISMISSED_KEY}.${data.user.id}`
    if (localStorage.getItem(dismissedKey)) return

    const accepted = await firstValueFrom(
      this.dialog.open(GoogleAvatarPromptDialog, { width: '22rem', disableClose: false }).afterClosed(),
    )

    if (accepted) {
      await this.auth.importGoogleAvatar(data.googlePictureUrl)
    } else {
      localStorage.setItem(dismissedKey, '1')
    }
  }
}
