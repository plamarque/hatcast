import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'

import { rememberCurrentUrlForPostLogin } from '../navigation/auth-redirect.helper'
import { MemberShellBootstrapService } from './member-shell-bootstrap.service'

export const memberShellBootstrapGuard: CanActivateFn = async () => {
  const bootstrap = inject(MemberShellBootstrapService)
  const router = inject(Router)

  const result = await bootstrap.ensureReady()
  if (result.ok) {
    return true
  }

  rememberCurrentUrlForPostLogin(router)
  return router.createUrlTree(['/connexion'])
}
