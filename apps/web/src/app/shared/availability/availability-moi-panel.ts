import { Component, input, output, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

import type { SummaryParticipant } from '../../core/availability/availability-api.service'
import type { RoleSlots } from '../../core/events/event-types'
import { AvailabilityForm, type AvailabilityFormSavedPayload } from './availability-form'

@Component({
  selector: 'app-availability-moi-panel',
  imports: [AvailabilityForm, MatIconModule],
  templateUrl: './availability-moi-panel.html',
  styleUrl: './availability-moi-panel.scss',
})
export class AvailabilityMoiPanel {
  readonly seasonId = input.required<string>()
  readonly eventId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly roleSlots = input.required<RoleSlots>()
  readonly subject = input.required<SummaryParticipant>()
  readonly readOnly = input(false)
  readonly proxyMode = input(false)
  readonly archived = input(false)
  readonly availabilityOpenedAt = input<string | null>(null)

  readonly saved = output<AvailabilityFormSavedPayload>()

  private readonly form = viewChild(AvailabilityForm)

  syncSubject(subject: SummaryParticipant): void {
    this.form()?.syncFromParent(subject.status, subject.roleKeys, subject.comment)
  }
}
