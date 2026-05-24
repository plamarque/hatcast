import { Component, inject, viewChild } from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'

import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'
import { AvailabilityForm } from './availability-form'
import type { AvailabilityDialogData, AvailabilityDialogResult } from './availability-dialog.types'

export type { AvailabilityDialogData, AvailabilityDialogResult } from './availability-dialog.types'

@Component({
  selector: 'app-availability-dialog',
  imports: [A11yModule, MatButtonModule, MatDialogModule, AvailabilityForm],
  templateUrl: './availability-dialog.html',
  styleUrl: './availability-dialog.scss',
})
export class AvailabilityDialog {
  private readonly dialogRef = inject(MatDialogRef<AvailabilityDialog, AvailabilityDialogResult>)
  readonly data = inject<AvailabilityDialogData>(MAT_DIALOG_DATA)
  private readonly form = viewChild(AvailabilityForm)

  protected readonly formattedDate = formatEventDate(this.data.eventStartsAt)

  protected close(): void {
    const state = this.form()?.currentState() ?? {
      status: this.data.initialStatus,
      roleKeys: this.data.initialRoleKeys ?? [],
    }
    this.dialogRef.close(state)
  }

  protected onSaved(result: AvailabilityDialogResult): void {
    this.dialogRef.close(result)
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
