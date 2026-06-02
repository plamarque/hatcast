import { Component, input, output } from '@angular/core'

import type { AvailabilityStatus } from '../../core/availability/availability-status'
import {
  agendaParticipationStatusAriaLabel,
  agendaParticipationStatusFromEvent,
  type AgendaParticipationStatusView,
} from './agenda-participation-status.utils'
import type { ParticipantFocusSummary } from '../../pages/season-home/season-participant-focus'
import { ParticipationEventCell } from './participation-event-cell'

@Component({
  selector: 'app-agenda-participation-status',
  imports: [ParticipationEventCell],
  templateUrl: './agenda-participation-status.html',
  styleUrl: './agenda-participation-status.scss',
})
export class AgendaParticipationStatus {
  readonly myAvailabilityStatus = input<AvailabilityStatus | null | undefined>(undefined)
  readonly participantFocus = input<ParticipantFocusSummary | null | undefined>(undefined)
  readonly canEditAvailability = input(false)

  readonly availabilityClick = output<{ status: AvailabilityStatus }>()

  protected statusView(): AgendaParticipationStatusView {
    return agendaParticipationStatusFromEvent(
      {
        myAvailabilityStatus: this.myAvailabilityStatus(),
        participantFocus: this.participantFocus(),
      },
      this.canEditAvailability(),
    )
  }

  protected ariaLabel(): string {
    return agendaParticipationStatusAriaLabel(this.statusView())
  }

  protected onActivate(event: Event): void {
    event.stopPropagation()
    const view = this.statusView()
    if (!view.availabilityEditable) {
      return
    }
    const status = this.myAvailabilityStatus() ?? 'unknown'
    this.availabilityClick.emit({ status })
  }
}
