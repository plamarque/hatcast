import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

import {
  type EventResponse,
  EventApiService,
} from '../../core/events/event-api.service'
import {
  applyTemplate,
  clampRoleCount,
  detectTemplateFromRoles,
  DEFAULT_CREATE_EVENT_TYPE,
  type EventTypeId,
  EVENT_TYPE_IDS,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  type RoleKey,
  ROLE_DISPLAY_ORDER,
  ROLE_EMOJIS,
  ROLE_LABELS,
  roleSlotsEqual,
  rolesWithSlots,
  TEMPLATE_DISPLAY_ORDER,
  type RoleSlots,
} from '../../core/events/event-types'
import {
  OrganizerApiService,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type EventParticipantAdmin,
} from '../../core/participants/participant-api.service'

export interface EventFormDialogData {
  mode: 'create' | 'edit'
  seasonId: string
  event?: EventResponse
  canManageEventOrganizers?: boolean
  canManageEventParticipants?: boolean
}

/** Instant ISO → valeur `datetime-local` (heure locale). */
function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

@Component({
  selector: 'app-event-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './event-form-dialog.html',
  styleUrl: './event-form-dialog.scss',
})
export class EventFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder)
  private readonly api = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly ref = inject(MatDialogRef<EventFormDialog, boolean>)
  protected readonly data = inject<EventFormDialogData>(MAT_DIALOG_DATA)

  protected saving = false
  protected organizerSaving = false
  protected participantSaving = false
  protected organizerEmail = ''
  protected participantDisplayName = ''
  protected participantEmail = ''
  protected organizerMessage = ''
  protected participantMessage = ''
  protected showRoleInputs = false
  protected showTemplateChangeConfirmation = false
  protected pendingTemplateId: EventTypeId | null = null

  protected readonly templateOrder = TEMPLATE_DISPLAY_ORDER
  protected readonly roleDisplayOrder = ROLE_DISPLAY_ORDER
  protected readonly roleLabels = ROLE_LABELS
  protected readonly roleEmojis = ROLE_EMOJIS
  protected readonly getEventTypeIcon = getEventTypeIcon
  protected readonly getEventTypeLabel = getEventTypeLabel

  protected selectedTemplateType: EventTypeId = DEFAULT_CREATE_EVENT_TYPE
  protected roleSlots: RoleSlots = applyTemplate(DEFAULT_CREATE_EVENT_TYPE)
  protected readonly eventOrganizers = signal<OrganizerResponse[]>([])
  protected readonly eventParticipants = signal<EventParticipantAdmin[]>([])

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    startsAtLocal: ['', [Validators.required]],
    location: [''],
    description: [''],
    templateType: [DEFAULT_CREATE_EVENT_TYPE as EventTypeId, [Validators.required]],
  })

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.event) {
      const e = this.data.event
      this.roleSlots = normalizeRoleSlots(e.roleSlots)
      const fromApi = e.templateType as EventTypeId
      this.selectedTemplateType =
        EVENT_TYPE_IDS.includes(fromApi) ? fromApi : detectTemplateFromRoles(this.roleSlots)
      this.form.patchValue({
        title: e.title,
        startsAtLocal: toDatetimeLocalValue(e.startsAt),
        location: e.location ?? '',
        description: e.description ?? '',
        templateType: this.selectedTemplateType,
      })
      if (this.canManageEventOrganizers()) {
        void this.loadEventOrganizers()
      }
      if (this.canManageEventParticipants()) {
        void this.loadEventParticipants()
      }
    } else {
      this.selectedTemplateType = DEFAULT_CREATE_EVENT_TYPE
      this.roleSlots = applyTemplate(DEFAULT_CREATE_EVENT_TYPE)
      this.form.patchValue({ templateType: DEFAULT_CREATE_EVENT_TYPE })
    }
  }

  protected async addEventOrganizer(): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventOrganizers()) return
    const email = this.organizerEmail.trim()
    if (!email) {
      this.organizerMessage = 'Saisissez un email.'
      return
    }
    this.organizerSaving = true
    try {
      const r = await this.organizerApi.addEventOrganizer(
        this.data.seasonId,
        this.data.event.id,
        email,
      )
      if (!r.ok) {
        this.organizerMessage =
          r.status === 404 ? 'Utilisateur introuvable.' : 'Ajout impossible.'
        return
      }
      this.organizerEmail = ''
      this.organizerMessage = 'Organisateur·ice ajouté·e.'
      await this.loadEventOrganizers()
    } finally {
      this.organizerSaving = false
    }
  }

  protected async removeEventOrganizer(userId: string): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventOrganizers()) return
    this.organizerSaving = true
    try {
      const r = await this.organizerApi.removeEventOrganizer(
        this.data.seasonId,
        this.data.event.id,
        userId,
      )
      if (!r.ok) {
        this.organizerMessage = 'Retrait impossible.'
        return
      }
      this.organizerMessage = 'Organisateur·ice retiré·e.'
      await this.loadEventOrganizers()
    } finally {
      this.organizerSaving = false
    }
  }

  private async loadEventOrganizers(): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventOrganizers()) return
    const r = await this.organizerApi.listEventOrganizers(this.data.seasonId, this.data.event.id)
    if (r.ok && r.data) {
      this.eventOrganizers.set(r.data)
    }
  }

  protected canManageEventOrganizers(): boolean {
    return this.data.canManageEventOrganizers === true
  }

  protected canManageEventParticipants(): boolean {
    return this.data.canManageEventParticipants === true
  }

  protected async addEventParticipant(): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventParticipants()) return
    const displayName = this.participantDisplayName.trim()
    if (!displayName) {
      this.participantMessage = 'Saisissez un nom.'
      return
    }
    this.participantSaving = true
    try {
      const email = this.participantEmail.trim()
      const r = await this.participantApi.createEventParticipant(
        this.data.seasonId,
        this.data.event.id,
        { displayName, email: email || undefined },
      )
      if (!r.ok) {
        this.participantMessage = r.status === 403 ? 'Accès non autorisé.' : 'Ajout impossible.'
        return
      }
      this.participantDisplayName = ''
      this.participantEmail = ''
      this.participantMessage = 'Participant ajouté.'
      await this.loadEventParticipants()
    } finally {
      this.participantSaving = false
    }
  }

  protected async removeEventParticipant(participantId: string): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventParticipants()) return
    this.participantSaving = true
    try {
      const r = await this.participantApi.removeEventParticipant(
        this.data.seasonId,
        this.data.event.id,
        participantId,
      )
      if (!r.ok) {
        this.participantMessage = 'Retrait impossible.'
        return
      }
      this.participantMessage = 'Participant retiré.'
      await this.loadEventParticipants()
    } finally {
      this.participantSaving = false
    }
  }

  private async loadEventParticipants(): Promise<void> {
    if (this.data.mode !== 'edit' || !this.data.event || !this.canManageEventParticipants()) return
    const r = await this.participantApi.listEventParticipants(this.data.seasonId, this.data.event.id)
    if (r.ok && r.data) {
      this.eventParticipants.set(r.data)
    }
  }

  protected summaryRoles(): RoleKey[] {
    return rolesWithSlots(this.roleSlots)
  }

  protected onTemplateSelected(typeId: EventTypeId): void {
    const templateSlots = applyTemplate(typeId)
    if (roleSlotsEqual(this.roleSlots, templateSlots)) {
      this.selectedTemplateType = typeId
      this.showTemplateChangeConfirmation = false
      this.pendingTemplateId = null
      return
    }
    this.pendingTemplateId = typeId
    this.showTemplateChangeConfirmation = true
    this.form.controls.templateType.setValue(this.selectedTemplateType, { emitEvent: false })
  }

  protected confirmTemplateChange(): void {
    if (!this.pendingTemplateId) return
    this.selectedTemplateType = this.pendingTemplateId
    this.roleSlots = applyTemplate(this.pendingTemplateId)
    this.form.controls.templateType.setValue(this.pendingTemplateId, { emitEvent: false })
    this.showTemplateChangeConfirmation = false
    this.pendingTemplateId = null
    this.showRoleInputs = false
  }

  protected cancelTemplateChange(): void {
    this.showTemplateChangeConfirmation = false
    this.pendingTemplateId = null
  }

  protected enableCustomization(): void {
    this.showRoleInputs = true
  }

  protected hideCustomization(): void {
    this.showRoleInputs = false
  }

  protected onRoleCountChange(role: RoleKey, raw: string): void {
    const n = clampRoleCount(Number(raw))
    this.roleSlots = { ...this.roleSlots, [role]: n }
    this.selectedTemplateType = detectTemplateFromRoles(this.roleSlots)
  }

  protected roleCount(role: RoleKey): number {
    return this.roleSlots[role] ?? 0
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const v = this.form.getRawValue()
    const startsAt = new Date(v.startsAtLocal).toISOString()
    const payload = {
      title: v.title.trim(),
      startsAt,
      location: v.location.trim() || null,
      description: v.description.trim() || null,
      templateType: this.selectedTemplateType,
      roleSlots: normalizeRoleSlots(this.roleSlots),
    }
    this.saving = true
    try {
      if (this.data.mode === 'create') {
        const r = await this.api.createEvent(this.data.seasonId, payload)
        this.ref.close(r.ok)
      } else if (this.data.event) {
        const r = await this.api.updateEvent(this.data.seasonId, this.data.event.id, payload)
        this.ref.close(r.ok)
      }
    } finally {
      this.saving = false
    }
  }
}
