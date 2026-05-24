import { Component, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import {
  availabilityBadgeLabel,
  availabilityBadgeModifier,
  type AvailabilityStatus,
} from '../../core/availability/availability-status'
import type { MonthEventGroup } from './season-events.utils'
import { getEventTypeIcon } from '../../core/events/event-types'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'

@Component({
  selector: 'app-season-agenda',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, CompositionStatusBadge],
  templateUrl: './season-agenda.html',
  styleUrl: './season-agenda.scss',
})
export class SeasonAgenda {
  readonly monthGroups = input.required<MonthEventGroup[]>()
  readonly loading = input(false)
  readonly truncated = input(false)
  readonly totalElements = input(0)
  readonly loadedEventsCount = input(0)
  readonly canManageEvents = input(false)
  readonly canEditAvailability = input(false)

  readonly eventClick = output<string>()
  readonly editClick = output<string>()
  readonly archiveClick = output<string>()
  readonly createClick = output<void>()
  readonly loadMoreClick = output<void>()
  readonly availabilityClick = output<{ eventId: string; status: AvailabilityStatus }>()

  protected openEvent(id: string): void {
    this.eventClick.emit(id)
  }

  protected onEdit(id: string, event: Event): void {
    event.stopPropagation()
    this.editClick.emit(id)
  }

  protected onArchive(id: string, event: Event): void {
    event.stopPropagation()
    this.archiveClick.emit(id)
  }

  protected onAvailabilityClick(
    eventId: string,
    status: AvailabilityStatus,
    event: Event,
  ): void {
    event.stopPropagation()
    this.availabilityClick.emit({ eventId, status })
  }

  protected dispoStatus(ev: { myAvailabilityStatus?: AvailabilityStatus }): AvailabilityStatus {
    return ev.myAvailabilityStatus ?? 'unknown'
  }

  protected dispoLabel(status: AvailabilityStatus): string {
    return availabilityBadgeLabel(status)
  }

  protected dispoModifier(status: AvailabilityStatus): string {
    return availabilityBadgeModifier(status)
  }

  protected typeIcon(templateType: string): string {
    return getEventTypeIcon(templateType)
  }
}
