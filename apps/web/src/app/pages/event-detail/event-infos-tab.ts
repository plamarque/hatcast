import { Component, input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

import type { EventResponse } from '../../core/events/event-api.service'
import { compositionStatusHint } from '../../core/composition/composition-status-hint'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'

@Component({
  selector: 'app-event-infos-tab',
  imports: [MatIconModule, CompositionStatusBadge, ScopeAdminMenu],
  templateUrl: './event-infos-tab.html',
  styleUrl: './event-infos-tab.scss',
})
export class EventInfosTab {
  readonly event = input.required<EventResponse>()
  readonly canManageComposition = input(false)
  readonly adminItems = input<ScopeAdminMenuItem[]>([])

  protected compositionStatusHint(ev: EventResponse): string | null {
    return compositionStatusHint(ev.compositionLifecycle, {
      canManageComposition: this.canManageComposition(),
      compositionPublishedAt: ev.compositionPublishedAt,
    })
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
}
