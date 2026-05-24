import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'

import type { SlotParticipationUpdateStatus } from '../../core/composition/composition-api.service'

export interface CompositionParticipationDialogData {
  eventTitle: string
  eventDate: string
  roleLabel: string
  roleEmoji: string
  currentStatus: 'pending' | 'confirmed' | 'declined'
  mode?: 'self' | 'proxy'
  assigneeDisplayName?: string
}

export interface CompositionParticipationDialogResult {
  status: SlotParticipationUpdateStatus
  note?: string | null
}

@Component({
  selector: 'app-composition-participation-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './composition-participation-dialog.html',
  styleUrl: './composition-participation-dialog.scss',
})
export class CompositionParticipationDialog {
  private readonly ref =
    inject(
      MatDialogRef<
        CompositionParticipationDialog,
        CompositionParticipationDialogResult | undefined
      >,
    )
  protected readonly data = inject<CompositionParticipationDialogData>(MAT_DIALOG_DATA)

  protected readonly isProxy = this.data.mode === 'proxy'

  protected readonly dialogTitle = this.isProxy
    ? `Confirmer la participation de ${this.data.assigneeDisplayName ?? 'ce participant'}`
    : 'Confirmer ma participation'

  protected readonly proxyHint = this.isProxy
    ? `Vous agissez pour le compte de ${this.data.assigneeDisplayName ?? 'ce participant'}.`
    : null

  protected note = ''

  protected formatDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso))
    } catch {
      return iso
    }
  }

  protected respond(status: SlotParticipationUpdateStatus): void {
    const trimmed = this.note.trim()
    this.ref.close({
      status,
      note:
        status === 'declined' && trimmed.length > 0 ? trimmed.slice(0, 500) : null,
    })
  }

  protected cancel(): void {
    this.ref.close(undefined)
  }
}
