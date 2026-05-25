import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import {
  ParticipantApiService,
  type EventParticipantAdmin,
} from '../../core/participants/participant-api.service'

export interface EventParticipantsDialogData {
  seasonId: string
  eventId: string
}

@Component({
  selector: 'app-event-participants-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './event-participants-dialog.html',
  styleUrl: './event-participants-dialog.scss',
})
export class EventParticipantsDialog implements OnInit {
  private readonly participantApi = inject(ParticipantApiService)
  private readonly ref = inject(MatDialogRef<EventParticipantsDialog, boolean | undefined>)
  protected readonly data = inject<EventParticipantsDialogData>(MAT_DIALOG_DATA)

  protected saving = false
  protected participantDisplayName = ''
  protected participantEmail = ''
  protected participantMessage = ''
  protected readonly eventParticipants = signal<EventParticipantAdmin[]>([])
  private changed = false

  ngOnInit(): void {
    void this.loadEventParticipants()
  }

  protected async addEventParticipant(): Promise<void> {
    const displayName = this.participantDisplayName.trim()
    if (!displayName) {
      this.participantMessage = 'Saisissez un nom.'
      return
    }
    this.saving = true
    try {
      const email = this.participantEmail.trim()
      const r = await this.participantApi.createEventParticipant(
        this.data.seasonId,
        this.data.eventId,
        { displayName, email: email || undefined },
      )
      if (!r.ok) {
        this.participantMessage = r.status === 403 ? 'Accès non autorisé.' : 'Ajout impossible.'
        return
      }
      this.participantDisplayName = ''
      this.participantEmail = ''
      this.participantMessage = 'Participant ajouté.'
      this.changed = true
      await this.loadEventParticipants()
    } finally {
      this.saving = false
    }
  }

  protected async removeEventParticipant(participantId: string): Promise<void> {
    this.saving = true
    try {
      const r = await this.participantApi.removeEventParticipant(
        this.data.seasonId,
        this.data.eventId,
        participantId,
      )
      if (!r.ok) {
        this.participantMessage = 'Retrait impossible.'
        return
      }
      this.participantMessage = 'Participant retiré.'
      this.changed = true
      await this.loadEventParticipants()
    } finally {
      this.saving = false
    }
  }

  protected close(): void {
    this.ref.close(this.changed ? true : undefined)
  }

  private async loadEventParticipants(): Promise<void> {
    const r = await this.participantApi.listEventParticipants(this.data.seasonId, this.data.eventId)
    if (r.ok && r.data) {
      this.eventParticipants.set(r.data)
    }
  }
}
