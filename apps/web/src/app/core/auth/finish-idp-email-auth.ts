import { WritableSignal } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import { PostLoginNavigationService } from '../navigation/post-login-navigation.service'
import { AuthApiService } from './auth-api.service'
import { showAuthSuccess } from './auth-success-feedback'
import {
  userMessageForIdpApiFailure,
  userMessageForSignupIdpRecovery,
} from './auth-user-message'
import { setHatcastRememberMePreference } from './hatcast-remember-me-storage'
import { isTransientIdpFailure } from './idp-transient-retry'

const RECOVERY_SNACKBAR_DURATION_MS = 8000

export interface FinishIdpEmailAuthContext {
  auth: AuthApiService
  snack: MatSnackBar
  router: Router
  postLoginNav: PostLoginNavigationService
  isDev: boolean
  devLog: WritableSignal<string | null>
  showSuccess: () => void
  showError: (message: string) => void
}

export interface FinishIdpEmailAuthOptions {
  idToken: string
  rememberMe: boolean
  /** Signup only: retry transient IdP API failures before giving up. */
  enableIdpRetry?: boolean
  /** Signup only: redirect to /connexion after persistent transient failure. */
  recoveryRedirectOnPersistentFailure?: boolean
  /** Query params for recovery redirect (preserves returnUrl). */
  loginQueryParams?: { returnUrl?: string }
}

export async function finishIdpSignInAfterEmailAuth(
  ctx: FinishIdpEmailAuthContext,
  options: FinishIdpEmailAuthOptions,
): Promise<void> {
  const {
    idToken,
    rememberMe,
    enableIdpRetry = false,
    recoveryRedirectOnPersistentFailure = false,
    loginQueryParams = {},
  } = options

  ctx.devLog.set(null)

  const r = enableIdpRetry
    ? await ctx.auth.signInWithIdentityPlatformIdTokenWithRetry(idToken, rememberMe)
    : await ctx.auth.signInWithIdentityPlatformIdToken(idToken, rememberMe)

  if (r.ok) {
    setHatcastRememberMePreference(rememberMe)
    await showAuthSuccess(ctx.showSuccess)
    await ctx.postLoginNav.navigateAfterSignIn(ctx.router)
    return
  }

  if (recoveryRedirectOnPersistentFailure && isTransientIdpFailure(r.status)) {
    ctx.snack.open(userMessageForSignupIdpRecovery(), 'OK', { duration: RECOVERY_SNACKBAR_DURATION_MS })
    await ctx.router.navigate(['/connexion'], { queryParams: loginQueryParams })
    if (ctx.isDev) {
      ctx.devLog.set(JSON.stringify({ status: r.status, recovery: true }, null, 2))
    }
    return
  }

  const msg = r.status === 401
    ? 'Email ou mot de passe incorrect. Vérifiez-les ou essayez de vous connecter avec Google.'
    : r.status === 0
      ? 'Connexion au serveur impossible. Vérifiez votre réseau et réessayez.'
      : r.status === 400
        ? 'Données de connexion invalides. Vérifiez-les et réessayez.'
        : userMessageForIdpApiFailure(r.status)
  ctx.showError(msg)
  if (ctx.isDev) {
    ctx.devLog.set(JSON.stringify({ status: r.status }, null, 2))
  }
}
