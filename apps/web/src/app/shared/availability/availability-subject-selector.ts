import { Component, input, output } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'

import type { ParticipantSelector } from '../../core/participants/participant-api.service'

@Component({
  selector: 'app-availability-subject-selector',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './availability-subject-selector.html',
  styleUrl: './availability-subject-selector.scss',
})
export class AvailabilitySubjectSelector {
  readonly participants = input.required<ParticipantSelector[]>()
  readonly selectedParticipantId = input.required<string>()
  readonly disabled = input(false)

  readonly selectedParticipantIdChange = output<string>()

  protected emitSelection(participantId: string): void {
    if (participantId === this.selectedParticipantId()) return
    this.selectedParticipantIdChange.emit(participantId)
  }
}
