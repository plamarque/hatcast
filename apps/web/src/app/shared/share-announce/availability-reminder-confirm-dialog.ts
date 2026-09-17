import { Component, computed, inject, signal } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'

export interface AvailabilityReminderConfirmData {
  recipients: Array<{
    participantId: string
    displayName: string
    channels: {
      email: { eligible: boolean; unavailableReason?: string | null }
      push: { eligible: boolean; unavailableReason?: string | null }
    }
  }>
  messageText: string
}

@Component({
  selector: 'app-availability-reminder-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule, MatChipsModule, MatIconModule],
  templateUrl: './availability-reminder-confirm-dialog.html',
  styleUrl: './availability-reminder-confirm-dialog.scss',
})
export class AvailabilityReminderConfirmDialog {
  readonly ref = inject(MatDialogRef<AvailabilityReminderConfirmDialog, string[] | false>)
  readonly data = inject<AvailabilityReminderConfirmData>(MAT_DIALOG_DATA)
  readonly notifications = this.data.recipients.filter((r) => r.channels.email.eligible || r.channels.push.eligible)
  readonly optedOut = this.data.recipients.filter(
    (r) =>
      !r.channels.email.eligible &&
      !r.channels.push.eligible &&
      r.channels.email.unavailableReason === 'preference_disabled' &&
      r.channels.push.unavailableReason === 'preference_disabled',
  )
  readonly manual = this.data.recipients.filter(
    (r) =>
      !r.channels.email.eligible &&
      !r.channels.push.eligible &&
      !this.optedOut.includes(r),
  )
  readonly selectedParticipantIds = signal(new Set(this.notifications.map((recipient) => recipient.participantId)))
  readonly selectedCount = computed(() => this.selectedParticipantIds().size)
  readonly allSelected = computed(() => this.selectedCount() === this.notifications.length)
  readonly someSelected = computed(() => this.selectedCount() > 0 && !this.allSelected())

  toggleAll(checked: boolean): void {
    this.selectedParticipantIds.set(checked ? new Set(this.notifications.map((recipient) => recipient.participantId)) : new Set())
  }

  toggleRecipient(participantId: string, checked: boolean): void {
    const selected = new Set(this.selectedParticipantIds())
    if (checked) selected.add(participantId)
    else selected.delete(participantId)
    this.selectedParticipantIds.set(selected)
  }

  confirm(): void {
    this.ref.close([...this.selectedParticipantIds()])
  }

  initials(displayName: string): string {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('')
  }
}
