import { Component, input, output } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import type { EventResponse } from '../../core/events/event-api.service'
import { compositionStatusHint } from '../../core/composition/composition-status-hint'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'

@Component({
  selector: 'app-event-infos-tab',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, CompositionStatusBadge],
  templateUrl: './event-infos-tab.html',
  styleUrl: './event-infos-tab.scss',
})
export class EventInfosTab {
  readonly event = input.required<EventResponse>()
  readonly canManageEvents = input(false)

  readonly editRequested = output<void>()
  readonly archiveRequested = output<void>()

  protected compositionStatusHint(ev: EventResponse): string | null {
    return compositionStatusHint(ev.compositionLifecycle)
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: AGENDA_TIME_ZONE,
    }).format(new Date(iso))
  }

  protected showKebab(): boolean {
    return this.canManageEvents() && !this.event().archived
  }
}
