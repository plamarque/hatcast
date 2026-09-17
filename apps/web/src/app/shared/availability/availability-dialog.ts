import { Component, effect, inject, viewChild } from '@angular/core'
import { A11yModule } from '@angular/cdk/a11y'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'

import { HatcastDialogDismiss } from '../dialog-chrome/hatcast-dialog-dismiss'
import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'
import { AvailabilityForm, type AvailabilityFormSavedPayload } from './availability-form'
import type { AvailabilityDialogData, AvailabilityDialogResult } from './availability-dialog.types'

export type { AvailabilityDialogData, AvailabilityDialogResult } from './availability-dialog.types'

@Component({
  selector: 'app-availability-dialog',
  imports: [A11yModule, HatcastDialogDismiss, MatButtonModule, MatDialogModule, AvailabilityForm],
  templateUrl: './availability-dialog.html',
  styleUrl: './availability-dialog.scss',
})
export class AvailabilityDialog {
  private readonly dialogRef = inject(MatDialogRef<AvailabilityDialog, AvailabilityDialogResult>)
  readonly data = inject<AvailabilityDialogData>(MAT_DIALOG_DATA)
  protected readonly form = viewChild(AvailabilityForm)

  constructor() {
    effect(() => { this.dialogRef.disableClose = this.form()?.saving() ?? false })
  }

  protected readonly formattedDate = formatEventDate(this.data.eventStartsAt)

  protected close(): void {
    if (!this.form()?.saving()) this.dialogRef.close()
  }

  protected onSaved(result: AvailabilityFormSavedPayload): void {
    this.dialogRef.close({ status: result.status, roleKeys: result.roleKeys, comment: result.comment })
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
