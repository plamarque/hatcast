import { Component, inject, OnInit } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ActivatedRoute, Router } from '@angular/router'

import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import {
  navigateAwayFromUnreachableSeason,
} from '../../core/navigation/unreachable-season-navigation'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import {
  canonicalSaisonCommands,
  legacySaisonSuffixFromPathname,
} from '../../core/navigation/troupe-routes'

/** Redirects legacy `/saison/:seasonSlug` to `/saison/:troupeSlug/:seasonSlug`. */
@Component({
  selector: 'app-saison-legacy-redirect',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="saison-legacy-redirect" role="status">
      <mat-spinner diameter="40" aria-label="Redirection" />
    </div>
  `,
  styles: `
    .saison-legacy-redirect {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }
  `,
})
export class SaisonLegacyRedirect implements OnInit {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly troupeContext = inject(TroupeContextService)

  async ngOnInit(): Promise<void> {
    const seasonSlug = this.route.snapshot.paramMap.get('seasonSlug')?.trim() ?? ''
    if (!seasonSlug) {
      await this.router.navigate(['/troupes'], { replaceUrl: true })
      return
    }

    await this.troupeContext.load()
    const pathname = this.router.url.split(/[?#]/)[0] ?? ''
    const suffix = legacySaisonSuffixFromPathname(pathname)
    const resolved = await this.resolver.resolveSeasonSlug(seasonSlug)
    if (resolved.kind === 'resolved') {
      rememberLastVisitedSeasonSlug(resolved.season.slug, resolved.troupe.id)
      await this.router.navigate(
        canonicalSaisonCommands(resolved.troupe.slug, resolved.season.slug, suffix),
        { replaceUrl: true, queryParams: this.route.snapshot.queryParams },
      )
      return
    }

    if (
      resolved.kind === 'no-membership' ||
      resolved.kind === 'ambiguous' ||
      resolved.kind === 'not-found'
    ) {
      await navigateAwayFromUnreachableSeason(
        this.router,
        resolved.kind,
        seasonSlug,
        this.troupeContext,
      )
      return
    }

    await this.router.navigate(['/agenda'], { replaceUrl: true })
  }
}
