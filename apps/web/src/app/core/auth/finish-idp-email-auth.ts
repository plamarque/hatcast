import { WritableSignal } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import { PostLoginNavigationService } from '../navigation/post-login-navigation.service'
import { AuthApiService } from './auth-api.service'
import {
  userMessageForIdpApiFailure,
  userMessageForSignupIdpRecovery,
} from './auth-user-message'
import { setHatcastRememberMePreference } from './hatcast-remember-me-storage'
import { isTransientIdpFailure } from './idp-transient-retry'

const RECOVERY_SNACKBAR_DURATION_MS = 8000
const SUCCESS_SNACKBAR_DURATION_MS = 3500

export interface FinishIdpEmailAuthContext {
  auth: AuthApiService
  snack: MatSnackBar
  router: Router
  postLoginNav: PostLoginNavigationService
  isDev: boolean
  devLog: WritableSignal<string | null>
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
    ctx.snack.open('Connexion réussie.', 'OK', { duration: SUCCESS_SNACKBAR_DURATION_MS })
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

  const msg = userMessageForIdpApiFailure(r.status)
  ctx.snack.open(msg, 'OK', { duration: RECOVERY_SNACKBAR_DURATION_MS })
  if (ctx.isDev) {
    ctx.devLog.set(JSON.stringify({ status: r.status }, null, 2))
  }
}
