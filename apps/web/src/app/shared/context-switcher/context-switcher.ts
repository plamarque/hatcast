import { Component, effect, inject, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { Router, RouterLink } from '@angular/router'

import { ContextSwitcherDataService } from '../../core/navigation/context-switcher-data.service'
import {
  getLastVisitedSeasonSlug,
  getLastVisitedSeasonSlugForTroupe,
  rememberLastVisitedSeasonSlug,
} from '../../core/navigation/last-visited-league-storage'
import {
  saisonWorkspacePath,
  troupeHubPath,
  troupesListPath,
} from '../../core/navigation/troupe-routes'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import type { TroupeListItem } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'

@Component({
  selector: 'app-context-switcher',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './context-switcher.html',
  styleUrl: './context-switcher.scss',
})
export class ContextSwitcher {
  private readonly data = inject(ContextSwitcherDataService)
  private readonly router = inject(Router)
  private readonly resolver = inject(TroupeSeasonResolverService)
  private readonly troupeContext = inject(TroupeContextService)

  readonly troupeId = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly troupeName = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly seasonTitle = input.required<string>()
  readonly compact = input(false)

  protected readonly showSwitcher = this.data.showSwitcher
  protected readonly loading = this.data.loading
  protected readonly loadError = this.data.loadError
  protected readonly troupes = this.data.troupes
  protected readonly troupesListPath = troupesListPath
  protected readonly troupeHubPath = troupeHubPath

  constructor() {
    effect(() => {
      const troupeId = this.troupeId()
      if (troupeId) {
        void this.data.ensureReady(troupeId)
      }
    })
  }

  protected seasonsForMenu(): SeasonResponse[] {
    return this.data.seasonsForTroupe(this.troupeId())
  }

  protected menuSeasonSectionLabel(): string {
    return `Saisons — ${this.troupeName()}`
  }

  protected isCurrentTroupe(troupe: TroupeListItem): boolean {
    return troupe.id === this.troupeId()
  }

  protected isCurrentSeason(season: SeasonResponse): boolean {
    return season.slug === this.seasonSlug()
  }

  protected menuDisabled(): boolean {
    return this.loading() || this.loadError()
  }

  protected async onMenuOpen(): Promise<void> {
    if (this.menuDisabled()) {
      return
    }
    await this.data.prepareMenuOpen()
  }

  protected selectSeason(season: SeasonResponse): void {
    if (season.slug === this.seasonSlug()) {
      return
    }
    rememberLastVisitedSeasonSlug(season.slug, this.troupeId())
    void this.router.navigate(saisonWorkspacePath(season.slug))
  }

  protected async selectTroupe(troupe: TroupeListItem): Promise<void> {
    if (troupe.id === this.troupeId()) {
      return
    }
    this.troupeContext.selectTroupe(troupe.id)

    const stored =
      getLastVisitedSeasonSlugForTroupe(troupe.id) ?? getLastVisitedSeasonSlug()
    if (stored) {
      const resolution = await this.resolver.resolveSeasonSlug(stored)
      if (
        resolution.kind === 'resolved' &&
        resolution.troupe.id === troupe.id
      ) {
        rememberLastVisitedSeasonSlug(resolution.season.slug, troupe.id)
        void this.router.navigate(saisonWorkspacePath(resolution.season.slug))
        return
      }
    }

    void this.router.navigate(troupeHubPath(troupe.slug))
  }
}
