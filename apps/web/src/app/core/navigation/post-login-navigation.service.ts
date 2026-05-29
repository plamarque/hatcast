import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'

import { AuthApiService } from '../auth/auth-api.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import {
  clearLastMemberEntryPath,
  getLastMemberEntryPath,
  isPersistableMemberEntryPath,
  memberStatsSlugFromMemberEntryPath,
  seasonSlugFromMemberEntryPath,
} from './last-member-entry-path-storage'
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
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)

  private navigateAfterSignInInFlight: Promise<boolean> | null = null

  async resolveAuthenticatedEntryUrl(): Promise<PostLoginNavigationTarget> {
    const pending = getPendingPostLoginRedirect()
    if (pending) {
      if (isValidInternalRedirectPath(pending)) {
        return pending
      }
      clearPendingPostLoginRedirect()
    }

    const entryPath = getLastMemberEntryPath()
    if (entryPath) {
      const entryTarget = await this.resolveMemberEntryPath(entryPath)
      if (entryTarget) {
        return entryTarget
      }
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
    this.clearMemberEntryPathForSeasonSlug(slug)
    return ['/agenda']
  }

  private async resolveMemberEntryPath(
    path: string,
  ): Promise<PostLoginNavigationTarget | null> {
    if (!isPersistableMemberEntryPath(path)) {
      clearLastMemberEntryPath()
      return null
    }

    if (path === '/accueil') {
      return ['/accueil']
    }
    if (path === '/agenda') {
      return ['/agenda']
    }

    const seasonSlug = seasonSlugFromMemberEntryPath(path)
    if (seasonSlug) {
      try {
        const resolved = await this.resolver.resolveSeasonSlug(seasonSlug)
        if (resolved.kind === 'resolved') {
          return saisonWorkspacePath(seasonSlug)
        }
      } catch {
        // Network/server error — clear stale entry and fall through
      }
      if (getLastVisitedSeasonSlug() === seasonSlug) {
        clearLastVisitedSeasonSlug()
      }
      if (getLastMemberEntryPath() === path) {
        clearLastMemberEntryPath()
      }
      return null
    }

    const membreSlug = memberStatsSlugFromMemberEntryPath(path)
    if (membreSlug) {
      const session = await this.auth.ensureHatcastSession()
      const ownSlug = session.data?.user.slug?.trim()
      if (ownSlug && membreSlug === ownSlug) {
        return ['/membre', ownSlug]
      }
      clearLastMemberEntryPath()
      return null
    }

    clearLastMemberEntryPath()
    return null
  }

  private clearMemberEntryPathForSeasonSlug(slug: string): void {
    if (getLastMemberEntryPath() === `/saison/${slug}`) {
      clearLastMemberEntryPath()
    }
  }

  async navigateAfterSignIn(router: Router = this.router): Promise<boolean> {
    if (this.navigateAfterSignInInFlight) {
      return this.navigateAfterSignInInFlight
    }
    const flight = this.executeNavigateAfterSignIn(router)
    this.navigateAfterSignInInFlight = flight
    try {
      return await flight
    } finally {
      this.navigateAfterSignInInFlight = null
    }
  }

  private async executeNavigateAfterSignIn(router: Router): Promise<boolean> {
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
