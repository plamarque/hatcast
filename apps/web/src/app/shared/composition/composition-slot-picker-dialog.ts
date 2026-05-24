import { Component, inject, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import type { CompositionCandidate } from '../../core/composition/composition-api.service'

export interface CompositionSlotPickerDialogData {
  roleLabel: string
  candidates: CompositionCandidate[]
  loading: boolean
  error: string | null
}

export interface CompositionSlotPickerDialogResult {
  participantId: string
}

@Component({
  selector: 'app-composition-slot-picker-dialog',
  imports: [MatButtonModule, MatDialogModule, MatProgressSpinnerModule],
  templateUrl: './composition-slot-picker-dialog.html',
  styleUrl: './composition-slot-picker-dialog.scss',
})
export class CompositionSlotPickerDialog {
  private readonly ref =
    inject(MatDialogRef<CompositionSlotPickerDialog, CompositionSlotPickerDialogResult | undefined>)
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

  protected initial(name: string): string {
    return name.charAt(0).toUpperCase()
  }

  protected assignedElsewhereLabel(roleKeys: string[] | null | undefined): string | null {
    if (!roleKeys?.length) {
      return null
    }
    return `Déjà : ${roleKeys.join(', ')}`
  }
}
