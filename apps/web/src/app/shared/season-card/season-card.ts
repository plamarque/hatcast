import { Component, computed, inject, input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterLink } from '@angular/router'

import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import { legacySaisonWorkspacePath, saisonWorkspacePath } from '../../core/navigation/troupe-routes'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { formatSeasonPeriod } from '../format-season-period'

@Component({
  selector: 'app-season-card',
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
  private readonly router = inject(Router)
  private readonly troupeContext = inject(TroupeContextService)

  readonly title = input.required<string>()
  readonly slug = input.required<string>()
  readonly eventCount = input.required<number>()
  readonly participantCount = input.required<number>()
  readonly archived = input(false)
  readonly startDate = input<string | null>(null)
  readonly endDate = input<string | null>(null)
  /** Troupe slug for canonical `/saison/:troupeSlug/:seasonSlug` navigation. */
  readonly troupeSlug = input<string | null>(null)

  protected readonly periodLabel = computed(() =>
    formatSeasonPeriod(this.startDate(), this.endDate()),
  )

  protected readonly useScopedNavigation = computed(() => !!this.troupeSlug()?.trim())

  protected workspaceLink(troupeSlug: string, seasonSlug: string): string[] {
    return saisonWorkspacePath(troupeSlug, seasonSlug)
  }

  protected legacyWorkspaceLink(seasonSlug: string): string[] {
    return legacySaisonWorkspacePath(seasonSlug)
  }

  protected openSeason(event: Event): void {
    event.preventDefault()
    const seasonSlug = this.slug().trim()
    const troupeSlug = this.troupeSlug()?.trim()
    if (!seasonSlug || !troupeSlug) {
      return
    }
    const troupe = this.troupeContext.findTroupeBySlug(troupeSlug)
    if (troupe) {
      this.troupeContext.selectTroupe(troupe.id)
      rememberLastVisitedSeasonSlug(seasonSlug, troupe.id)
    }
    void this.router.navigate(saisonWorkspacePath(troupeSlug, seasonSlug))
  }

  protected openAriaLabel(): string {
    return `Ouvrir ${this.title()}`
  }

  protected spectacleLabel(count: number): string {
    return count === 1 ? '1 spectacle' : `${count} spectacles`
  }

  protected participantLabel(count: number): string {
    return count === 1 ? '1 participant' : `${count} participants`
  }
}
