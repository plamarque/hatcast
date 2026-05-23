import { Component, inject, signal } from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

import {
  AvailabilityApiService,
} from '../../core/availability/availability-api.service'
import {
  type AvailabilityStatus,
} from '../../core/availability/availability-status'
import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'

export interface AvailabilityDialogData {
  seasonId: string
  eventId: string
  eventTitle: string
  eventStartsAt: string
  subjectDisplayName: string
  initialStatus: AvailabilityStatus
}

export interface AvailabilityDialogResult {
  status: AvailabilityStatus
}

@Component({
  selector: 'app-availability-dialog',
  imports: [A11yModule, MatButtonModule, MatDialogModule],
  templateUrl: './availability-dialog.html',
  styleUrl: './availability-dialog.scss',
})
export class AvailabilityDialog {
  private readonly api = inject(AvailabilityApiService)
  private readonly dialogRef = inject(MatDialogRef<AvailabilityDialog, AvailabilityDialogResult>)
  private readonly snack = inject(MatSnackBar)
  readonly data = inject<AvailabilityDialogData>(MAT_DIALOG_DATA)

  protected readonly selected = signal<AvailabilityStatus>(this.data.initialStatus)
  protected readonly saving = signal(false)

  protected readonly formattedDate = formatEventDate(this.data.eventStartsAt)

  protected isSelected(status: AvailabilityStatus): boolean {
    return this.selected() === status
  }

  protected feedbackText(): string | null {
    const s = this.selected()
    if (s === 'unknown') {
      return 'Tu n\'as pas renseigné de dispo.'
    }
    if (s === 'unavailable') {
      return 'Tu n\'es pas disponible pour cet événement.'
    }
    return null
  }

  protected async choose(status: AvailabilityStatus): Promise<void> {
    if (this.saving()) {
      return
    }
    this.selected.set(status)
    this.saving.set(true)
    const r = await this.api.setMyAvailability(this.data.seasonId, this.data.eventId, { status })
    this.saving.set(false)
    if (!r.ok || !r.data) {
      this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
      return
    }
    this.dialogRef.close({ status: r.data.status })
  }
}

function formatEventDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: AGENDA_TIME_ZONE,
  }).format(d)
}
