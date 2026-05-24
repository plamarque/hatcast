import { Component, input } from '@angular/core'

import {
  teamStatusBadgeAriaLabel,
  teamStatusBadgeShortLabel,
  type TeamStatusBadge,
} from '../../core/composition/composition-lifecycle'

@Component({
  selector: 'app-composition-status-badge',
  imports: [],
  templateUrl: './composition-status-badge.html',
  styleUrl: './composition-status-badge.scss',
})
export class CompositionStatusBadge {
  readonly badge = input<TeamStatusBadge | undefined>(undefined)
  readonly short = input(true)

  protected label(): string {
    const b = this.badge()
    if (!b) {
      return 'Collecte'
    }
    return this.short() ? teamStatusBadgeShortLabel(b) : b.label
  }

  protected cssClasses(): string {
    const tone = this.badge()?.tone ?? 'collecting'
    return `composition-status-badge composition-status-badge--${tone}`
  }

  protected ariaLabel(): string {
    return teamStatusBadgeAriaLabel(this.badge())
  }
}
