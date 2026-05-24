import { Injectable, inject } from '@angular/core'
import { Router } from '@angular/router'

import { TroupeSeasonResolverService } from '../troupes/troupe-season-resolver.service'
import {
  clearLastVisitedSeasonSlug,
  getLastVisitedSeasonSlug,
} from './last-visited-league-storage'

@Injectable({ providedIn: 'root' })
export class PostLoginNavigationService {
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly router = inject(Router)

  async resolveAuthenticatedEntryUrl(): Promise<string[]> {
    const slug = getLastVisitedSeasonSlug()
    if (!slug) {
      return ['/seasons']
    }

    try {
      const resolved = await this.resolver.resolveSeasonSlug(slug)
      if (resolved.kind === 'resolved') {
        return ['/saison', slug]
      }
    } catch {
      // Network/server error — clear stale slug and fall through to /seasons
    }

    clearLastVisitedSeasonSlug()
    return ['/seasons']
  }

  async navigateAfterSignIn(router: Router = this.router): Promise<boolean> {
    const target = await this.resolveAuthenticatedEntryUrl()
    return router.navigate(target, { replaceUrl: true })
  }
}
