import type { Router } from '@angular/router'

import {
  isValidInternalRedirectPath,
  rememberPendingPostLoginRedirect,
} from './post-login-redirect-storage'

/** Persists the current internal URL before redirecting an unauthenticated user to login. */
export function rememberCurrentUrlForPostLogin(router: Router): void {
  const url = router.url?.trim()
  if (!url || url === '/' || url.startsWith('/connexion')) return
  if (!isValidInternalRedirectPath(url)) return
  rememberPendingPostLoginRedirect(url)
}
