import { Component, computed, input } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { RouterLink } from '@angular/router'

import { saisonWorkspacePath } from '../../core/navigation/troupe-routes'
import { formatSeasonPeriod } from '../format-season-period'

@Component({
  selector: 'app-season-card',
  imports: [MatCardModule, MatIconModule, RouterLink],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
})
export class SeasonCard {
  readonly title = input.required<string>()
  readonly slug = input.required<string>()
  readonly eventCount = input.required<number>()
  readonly participantCount = input.required<number>()
  readonly archived = input(false)
  readonly startDate = input<string | null>(null)
  readonly endDate = input<string | null>(null)

  protected readonly periodLabel = computed(() =>
    formatSeasonPeriod(this.startDate(), this.endDate()),
  )

  protected workspaceLink(slug: string): string[] {
    return saisonWorkspacePath(slug)
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
