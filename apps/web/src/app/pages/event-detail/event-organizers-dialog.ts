import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import {
  type TroupeMemberAdmin,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'

export interface EventOrganizersDialogData {
  seasonId: string
  eventId: string
  troupeId: string
}

@Component({
  selector: 'app-event-organizers-dialog',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './event-organizers-dialog.html',
  styleUrl: './event-organizers-dialog.scss',
})
export class EventOrganizersDialog implements OnInit {
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly ref = inject(MatDialogRef<EventOrganizersDialog, boolean | undefined>)
  protected readonly data = inject<EventOrganizersDialogData>(MAT_DIALOG_DATA)

  protected readonly pickerQuery = signal('')
  protected readonly members = signal<TroupeMemberAdmin[]>([])
  protected readonly assignedUserIds = signal<Set<string>>(new Set())
  protected readonly saving = signal(false)
  protected readonly errorMessage = signal('')
  private changed = false

  protected readonly filteredMembers = computed(() => {
    const assigned = this.assignedUserIds()
    const q = this.pickerQuery().trim().toLowerCase()
    const active = this.members().filter(
      (m) => m.status === 'ACTIVE' && m.userId != null && !assigned.has(m.userId) && m.email,
    )
    if (!q) {
      return active.slice(0, 8)
    }
    return active
      .filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false),
      )
      .slice(0, 8)
  })

  ngOnInit(): void {
    void this.loadMembers()
    void this.loadAssignedUserIds()
  }

  protected onPickerInput(value: string): void {
    this.pickerQuery.set(value)
    this.errorMessage.set('')
  }

  protected onMemberSelected(email: string): void {
    this.pickerQuery.set(email)
  }

  protected async submit(): Promise<void> {
    const email = this.pickerQuery().trim()
    if (!email) {
      this.errorMessage.set('Choisissez un membre ou saisissez un email.')
      return
    }
    this.saving.set(true)
    this.errorMessage.set('')
    try {
      const r = await this.organizerApi.addEventOrganizer(
        this.data.seasonId,
        this.data.eventId,
        email,
      )
      if (!r.ok) {
        this.errorMessage.set(
          r.status === 404 ? 'Utilisateur introuvable.' : 'Ajout impossible.',
        )
        return
      }
      this.changed = true
      this.pickerQuery.set('')
      await this.loadAssignedUserIds()
    } finally {
      this.saving.set(false)
    }
  }

  protected close(): void {
    this.ref.close(this.changed ? true : undefined)
  }

  private async loadMembers(): Promise<void> {
    const r = await this.troupeApi.listMembers(this.data.troupeId, 0, 100)
    if (r.ok && r.data) {
      this.members.set(r.data.content)
    }
  }

  private async loadAssignedUserIds(): Promise<void> {
    const r = await this.organizerApi.listEventOrganizers(this.data.seasonId, this.data.eventId)
    if (r.ok && r.data) {
      this.assignedUserIds.set(new Set(r.data.map((o) => o.userId)))
    }
  }
}
