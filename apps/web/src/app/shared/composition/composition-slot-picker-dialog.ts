import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { CompositionCandidate } from '../../core/composition/composition-api.service'
import { ChanceBreakdownService } from './chance-breakdown.service'
import { UserAvatarComponent } from '../user-avatar/user-avatar'

export interface CompositionSlotPickerDialogData {
  roleLabel: string
  roleKey: string
  seasonId: string
  eventId: string
  explainabilityEnabled: boolean
  viewerParticipantIds: string[]
  candidates: CompositionCandidate[]
  loading: boolean
  error: string | null
}

export interface CompositionSlotPickerDialogResult {
  participantId: string
}

@Component({
  selector: 'app-composition-slot-picker-dialog',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule, UserAvatarComponent],
  templateUrl: './composition-slot-picker-dialog.html',
  styleUrl: './composition-slot-picker-dialog.scss',
})
export class CompositionSlotPickerDialog {
  private readonly ref =
    inject(MatDialogRef<CompositionSlotPickerDialog, CompositionSlotPickerDialogResult | undefined>)
  private readonly chanceBreakdown = inject(ChanceBreakdownService)
  protected readonly data = inject<CompositionSlotPickerDialogData>(MAT_DIALOG_DATA)

  protected readonly candidates = signal(this.data.candidates)
  protected readonly loading = signal(this.data.loading)
  protected readonly error = signal(this.data.error)

  updateState(candidates: CompositionCandidate[], loading: boolean, error: string | null): void {
    this.candidates.set(candidates)
    this.loading.set(loading)
    this.error.set(error)
  }

  protected select(participantId: string): void {
    this.ref.close({ participantId })
  }

  protected cancel(): void {
    this.ref.close(undefined)
  }

  protected assignedElsewhereLabel(roleKeys: string[] | null | undefined): string | null {
    if (!roleKeys?.length) {
      return null
    }
    return `Déjà : ${roleKeys.join(', ')}`
  }

  protected async openBreakdown(event: Event, candidate: CompositionCandidate): Promise<void> {
    event.stopPropagation()
    if (!this.data.explainabilityEnabled || candidate.chancePercent == null) {
      return
    }
    await this.chanceBreakdown.open({
      seasonId: this.data.seasonId,
      eventId: this.data.eventId,
      roleKey: this.data.roleKey,
      participantId: candidate.participantId,
      viewerParticipantIds: this.data.viewerParticipantIds,
    })
  }

  protected breakdownAriaLabel(candidate: CompositionCandidate): string {
    return `Voir le détail de la cote : ${candidate.displayName}, ${candidate.chancePercent} pourcent`
  }
}
