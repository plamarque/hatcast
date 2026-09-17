import { Component, computed, input, output } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import type { MemberGender } from '../../core/account/member-gender'
import { isEventDraft } from '../../core/events/event-draft'
import { formatEventDateParts } from '../../pages/season-home/season-events.utils'
import { CompositionStatusBadge } from '../composition/composition-status-badge'
import { AgendaParticipationStatus } from './agenda-participation-status'

@Component({
  selector: 'app-agenda-event-card',
  imports: [MatIconModule, CompositionStatusBadge, AgendaParticipationStatus],
  templateUrl: './agenda-event-card.html',
  styleUrl: './agenda-event-card.scss',
})
export class AgendaEventCard {
  readonly item = input.required<UserAgendaItem>()
  readonly featured = input(false)
  readonly viewerGender = input<MemberGender | undefined>()
  readonly canEditAvailability = input(false)
  readonly canConfirmParticipation = input(false)
  readonly openEvent = output<void>()
  readonly availabilityClick = output<void>()
  readonly participationClick = output<void>()
  protected readonly date = computed(() => formatEventDateParts(this.item().startsAt))
  protected readonly time = computed(() => new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  }).format(new Date(this.item().startsAt)))
  protected readonly isEventDraft = isEventDraft
}
