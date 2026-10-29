import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'

import { rememberCurrentUrlForPostLogin } from '../navigation/auth-redirect.helper'
import { rememberPendingPostLoginRedirect } from '../navigation/post-login-redirect-storage'
import { MemberShellBootstrapService } from './member-shell-bootstrap.service'

export const memberShellBootstrapGuard: CanActivateFn = async (_route, state) => {
  const bootstrap = inject(MemberShellBootstrapService)
  const router = inject(Router)

  const result = await bootstrap.ensureReady()
  if (result.ok) {
    return true
  }

  if (state.url.split(/[?#]/)[0] === '/avent-test') {
    rememberPendingPostLoginRedirect(state.url)
  } else {
    rememberCurrentUrlForPostLogin(router)
  }
  return router.createUrlTree(['/connexion'])
}
