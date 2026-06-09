import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'

import { AuthApiService } from '../auth/auth-api.service'
import { MemberShellBootstrapService } from '../member-shell/member-shell-bootstrap.service'
import { TroupeContextService } from '../troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import {
  clearLastMemberEntryPath,
  getLastMemberEntryPath,
  isPersistableMemberEntryPath,
  memberStatsSlugFromMemberEntryPath,
  seasonSlugFromMemberEntryPath,
  troupeSlugFromMemberEntryPath,
} from './last-member-entry-path-storage'
import {
  parseCanonicalSaisonScopedPath,
  parseSaisonMemberEntryPath,
  saisonWorkspacePath,
} from './troupe-routes'
import {
  clearLastVisitedSeasonSlug,
  getLastVisitedSeasonSlug,
} from './last-visited-season-storage'
import {
  clearPendingPostLoginRedirect,
  getPendingPostLoginRedirect,
  isValidInternalRedirectPath,
} from './post-login-redirect-storage'
import {
  clearStaleSeasonNavigation,
  seasonSlugFromPathname,
} from './unreachable-season-navigation'

export type PostLoginNavigationTarget = string | string[]

@Injectable({ providedIn: 'root' })
export class PostLoginNavigationService {
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly auth = inject(AuthApiService)
  private readonly memberBootstrap = inject(MemberShellBootstrapService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly router = inject(Router)

  private navigateAfterSignInInFlight: Promise<boolean> | null = null

  async resolveAuthenticatedEntryUrl(): Promise<PostLoginNavigationTarget> {
    const pending = getPendingPostLoginRedirect()
    if (pending) {
      if (isValidInternalRedirectPath(pending)) {
        const validatedPending = await this.validatePendingRedirect(pending)
        if (validatedPending) {
          return validatedPending
        }
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
        return saisonWorkspacePath(resolved.troupe.slug, slug)
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

    if (path.startsWith('/troupes/')) {
      const hasMemberTroupe = await this.hasActiveMemberTroupe()
      if (!hasMemberTroupe) {
        clearLastMemberEntryPath()
        return null
      }
    }

    const seasonSlug = seasonSlugFromMemberEntryPath(path)
    if (seasonSlug) {
      const canonical = parseSaisonMemberEntryPath(path)
      if (canonical) {
        const resolved = await this.resolver.resolveSeasonInTroupe(
          canonical.troupeSlug,
          canonical.seasonSlug,
        )
        if (resolved.kind === 'resolved') {
          if ((resolved.season.guestSeasonWorkspaceMode ?? 'FULL') === 'NONE') {
            clearLastMemberEntryPath()
            return null
          }
          return saisonWorkspacePath(canonical.troupeSlug, canonical.seasonSlug)
        }
        if (resolved.kind === 'error') {
          return null
        }
      }
      try {
        const resolved = await this.resolver.resolveSeasonSlug(seasonSlug)
        if (resolved.kind === 'resolved') {
          if ((resolved.season.guestSeasonWorkspaceMode ?? 'FULL') === 'NONE') {
            clearLastMemberEntryPath()
            return null
          }
          return saisonWorkspacePath(resolved.troupe.slug, resolved.season.slug)
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

  private async hasActiveMemberTroupe(): Promise<boolean> {
    const loaded = await this.troupeContext.load()
    if (!loaded) {
      return false
    }
    return this.troupeContext.activeTroupes().some(
      (troupe) =>
        troupe.membership.baselineRole === 'MEMBER' ||
        troupe.membership.baselineRole === 'TROUPE_ADMIN',
    )
  }

  private clearMemberEntryPathForSeasonSlug(slug: string): void {
    const entryPath = getLastMemberEntryPath()
    if (entryPath && seasonSlugFromMemberEntryPath(entryPath) === slug.trim()) {
      clearLastMemberEntryPath()
    }
  }

  private async validatePendingRedirect(pending: string): Promise<string | null> {
    const pathname = pending.split(/[?#]/)[0] ?? pending
    const canonical = parseCanonicalSaisonScopedPath(pathname)
    if (canonical) {
      const resolved = await this.resolver.resolveSeasonInTroupe(
        canonical.troupeSlug,
        canonical.seasonSlug,
      )
      if (resolved.kind === 'resolved') {
        if ((resolved.season.guestSeasonWorkspaceMode ?? 'FULL') === 'NONE') {
          return null
        }
        return pending
      }
      if (resolved.kind === 'no-membership' || resolved.kind === 'not-found') {
        return null
      }
      if (resolved.kind === 'error') {
        return null
      }
    }
    const seasonSlug = seasonSlugFromPathname(pathname)
    if (!seasonSlug) {
      return pending
    }

    try {
      const resolved = await this.resolver.resolveSeasonSlug(seasonSlug)
      if (resolved.kind === 'resolved') {
        return pending
      }
    } catch {
      // Network/server error — treat as unreachable and fall through
    }

    clearStaleSeasonNavigation(seasonSlug)
    return null
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
    this.memberBootstrap.invalidate()
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
