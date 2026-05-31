import { Component, computed, input } from '@angular/core'
import { MatTooltipModule } from '@angular/material/tooltip'

import {
  participationChartModifier,
  resolveParticipationChartStatus,
} from '../../core/participation/participation-status'
import type { StatisticsEventCell } from '../../core/seasons/season-statistics-api.service'
import { roleEmoji, type RoleKey } from '../event-roles/event-roles'

@Component({
  selector: 'app-participation-event-cell',
  imports: [MatTooltipModule],
  templateUrl: './participation-event-cell.html',
  styleUrl: './participation-event-cell.scss',
  host: {
    class: 'participation-event-cell-host',
    '[class.participation-event-cell-host--square]': 'square()',
  },
})
export class ParticipationEventCell {
  readonly cell = input.required<StatisticsEventCell>()
  /** Fixed square size for agenda cards (inherits --agenda-participation-cell-size). */
  readonly square = input(false)

  protected readonly resolvedStatus = computed(() =>
    resolveParticipationChartStatus(this.cell().status, this.cell().roleKey),
  )

  protected readonly modifierClass = computed(() => {
    const suffix = participationChartModifier(this.resolvedStatus())
    return `participation-event-cell participation-event-cell${suffix}`
  })

  protected readonly tooltip = computed(
    () => this.cell().tooltip?.trim() || this.cell().label,
  )

  protected readonly emoji = computed((): string | null => {
    const status = this.resolvedStatus()
    if (status === 'pending') {
      return '⏳'
    }
    const roleKey = this.cell().roleKey
    if (roleKey && (status === 'selected' || status === 'declined')) {
      return roleEmoji(roleKey as RoleKey)
    }
    return null
  })
}
