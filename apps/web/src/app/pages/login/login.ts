import {
  AfterViewInit,
  Component,
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
import { MatInputModule } from '@angular/material/input'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { AuthApiService } from '../../core/auth/auth-api.service'
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
    MatInputModule,
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

  protected get signupQueryParams(): { returnUrl?: string } {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl')?.trim()
    if (returnUrl && isValidInternalRedirectPath(returnUrl)) {
      return { returnUrl }
    }
    return {}
  }

  ngOnInit(): void {
    this.ingestReturnUrlFromQuery()
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

  /** Widget GSI superposé au bouton Material (voir template) : largeur = pile parent. */
  private renderGoogleSignInButton(): void {
    const g = window.google?.accounts?.id
    const host = this.googleHost()?.nativeElement
    if (!g || !host) return
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
      text: 'continue_with',
      width: w,
      locale: 'fr',
    })
  }

  private async onGoogleCredential(idToken: string): Promise<void> {
    this.devLog.set(null)
    const r = await this.auth.signInWithGoogleIdToken(idToken, this.rememberMe())
    if (r.ok && r.data) {
      setHatcastRememberMePreference(this.rememberMe())
      await this.maybePromptGoogleAvatarImport(r.data)
      this.snack.open('Connexion réussie.', 'OK', { duration: 3500 })
      await this.postLoginNav.navigateAfterSignIn(this.router)
      return
    }
    const msg = userMessageForGoogleSignInFailure(r.status)
    this.snack.open(msg, 'OK', { duration: 8000 })
    if (this.isDev) {
      this.devLog.set(JSON.stringify({ status: r.status, hint: 'voir logs API pour le détail' }, null, 2))
    }
  }

  protected async signInWithEmail(): Promise<void> {
    this.emailForm.markAllAsTouched()
    if (this.emailForm.invalid) return
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
      this.snack.open(
        'Connexion email indisponible (Firebase non configuré). Utilisez Google ou un compte seed @seed.improbots.test en dev.',
        'OK',
        { duration: 10_000 },
      )
      return
    }
    if (password.length < 8) {
      this.snack.open('Le mot de passe doit contenir au moins 8 caractères.', 'OK', { duration: 6000 })
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
        },
        {
          idToken,
          rememberMe: this.rememberMe(),
        },
      )
    } catch (e: unknown) {
      const code = typeof e === 'object' && e && 'code' in e ? String((e as { code: string }).code) : ''
      this.snack.open(userMessageForIdentityPlatformAuth(code), 'OK', { duration: 8000 })
      if (this.isDev) {
        this.devLog.set(code || String(e))
      }
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
