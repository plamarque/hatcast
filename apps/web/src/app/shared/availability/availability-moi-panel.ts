import { Component, input, output, viewChild } from '@angular/core'

import type { SummaryParticipant } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import type { RoleSlots } from '../../core/events/event-types'
import { AvailabilityForm } from './availability-form'

@Component({
  selector: 'app-availability-moi-panel',
  imports: [AvailabilityForm],
  templateUrl: './availability-moi-panel.html',
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

  readonly saved = output<{ status: AvailabilityStatus; roleKeys: string[] }>()

  private readonly form = viewChild(AvailabilityForm)

  syncSubject(subject: SummaryParticipant): void {
    this.form()?.syncFromParent(subject.status, subject.roleKeys)
  }
}
