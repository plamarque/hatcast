import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'

import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import {
  clearLastVisitedSeasonSlug,
  getLastVisitedSeasonSlug,
} from './last-visited-league-storage'
import { saisonWorkspacePath } from './troupe-routes'
import {
  clearPendingPostLoginRedirect,
  getPendingPostLoginRedirect,
  isValidInternalRedirectPath,
} from './post-login-redirect-storage'

export type PostLoginNavigationTarget = string | string[]

@Injectable({ providedIn: 'root' })
export class PostLoginNavigationService {
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly router = inject(Router)

  async resolveAuthenticatedEntryUrl(): Promise<PostLoginNavigationTarget> {
    const pending = getPendingPostLoginRedirect()
    if (pending) {
      if (isValidInternalRedirectPath(pending)) {
        return pending
      }
      clearPendingPostLoginRedirect()
    }

    const slug = getLastVisitedSeasonSlug()
    if (!slug) {
      return ['/agenda']
    }

    try {
      const resolved = await this.resolver.resolveSeasonSlug(slug)
      if (resolved.kind === 'resolved') {
        return saisonWorkspacePath(slug)
      }
    } catch {
      // Network/server error — clear stale slug and fall through to /agenda
    }

    clearLastVisitedSeasonSlug()
    return ['/agenda']
  }

  async navigateAfterSignIn(router: Router = this.router): Promise<boolean> {
    const target = await this.resolveAuthenticatedEntryUrl()
    if (typeof target === 'string') {
      const navigated = await router.navigateByUrl(target, { replaceUrl: true })
      if (navigated) {
        clearPendingPostLoginRedirect()
      }
      return navigated
    }
    return router.navigate(target, { replaceUrl: true })
  }
}
