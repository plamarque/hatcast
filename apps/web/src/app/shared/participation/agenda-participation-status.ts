import { Component, inject, input, OnInit, output, signal } from '@angular/core'

import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import type { MemberGender } from '../../core/account/member-gender'
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
export class AgendaParticipationStatus implements OnInit {
  private readonly mePreferencesApi = inject(MePreferencesApiService)

  readonly myAvailabilityStatus = input<AvailabilityStatus | null | undefined>(undefined)
  readonly participantFocus = input<ParticipantFocusSummary | null | undefined>(undefined)
  readonly canEditAvailability = input(false)
  /** Optional override when parent already has viewer gender. */
  readonly viewerGender = input<MemberGender | null | undefined>(undefined)

  readonly availabilityClick = output<{ status: AvailabilityStatus }>()

  private readonly loadedViewerGender = signal<MemberGender | undefined>(undefined)

  async ngOnInit(): Promise<void> {
    if (this.viewerGender() != null) {
      return
    }
    try {
      const result = await this.mePreferencesApi.getPreferences()
      if (result.ok && result.data) {
        this.loadedViewerGender.set(result.data.gender)
      }
    } catch {
      // Inclusive labels when preferences cannot be loaded.
    }
  }

  protected statusView(): AgendaParticipationStatusView {
    const gender = this.viewerGender() ?? this.loadedViewerGender()
    return agendaParticipationStatusFromEvent(
      {
        myAvailabilityStatus: this.myAvailabilityStatus(),
        participantFocus: this.participantFocus(),
      },
      this.canEditAvailability(),
      gender,
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
