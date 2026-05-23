import { Component, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import type { MonthEventGroup } from './season-events.utils'
import { getEventTypeIcon } from '../../core/events/event-types'

@Component({
  selector: 'app-season-agenda',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './season-agenda.html',
  styleUrl: './season-agenda.scss',
})
export class SeasonAgenda {
  readonly monthGroups = input.required<MonthEventGroup[]>()
  readonly loading = input(false)
  readonly truncated = input(false)
  readonly totalElements = input(0)
  readonly loadedEventsCount = input(0)

  readonly eventClick = output<string>()
  readonly editClick = output<string>()
  readonly archiveClick = output<string>()
  readonly createClick = output<void>()
  readonly loadMoreClick = output<void>()

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

  protected typeIcon(templateType: string): string {
    return getEventTypeIcon(templateType)
  }
}
