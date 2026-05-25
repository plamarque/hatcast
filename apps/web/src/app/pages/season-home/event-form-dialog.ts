import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { Subscription } from 'rxjs'
import {
  type AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
  Validators,
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import {
  NgxMatTimepickerComponent,
  NgxMatTimepickerDirective,
  NgxMatTimepickerToggleComponent,
} from 'ngx-mat-timepicker'

import {
  type EventResponse,
  EventApiService,
} from '../../core/events/event-api.service'
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

/** Instant ISO → date (midi local) + heure/minute locales. */
export function parseStartsAt(iso: string): { date: Date; hour: number; minute: number } {
  const d = new Date(iso)
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0)
  return { date, hour: d.getHours(), minute: d.getMinutes() }
}

/** Date locale + heure/minute → instant ISO. */
export function buildStartsAtIso(date: Date, hour: number, minute: number): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0).toISOString()
}

/** Heure/minute → chaîne `HH:mm` (24 h) pour ngx-mat-timepicker. */
export function formatStartTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** Minuit local : heure non précisée (comparaisons de date uniquement, non affichée). */
export const UNSPECIFIED_START_TIME_PARTS = { hour: 0, minute: 0 } as const

export function isUnspecifiedStartTime(hour: number, minute: number): boolean {
  return hour === 0 && minute === 0
}

/** Valeur du champ heure : vide si 00:00 (non précisée). */
export function startTimeForForm(hour: number, minute: number): string {
  return isUnspecifiedStartTime(hour, minute) ? '' : formatStartTime(hour, minute)
}

/** `HH:mm` (24 h) → heure/minute ; `null` si invalide. */
export function parseStartTime(value: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

/** Champ vide → 00:00 ; sinon parse (appeler seulement si le contrôle est valide). */
export function resolveStartTimeParts(value: string): { hour: number; minute: number } {
  const trimmed = value.trim()
  if (!trimmed) {
    return { ...UNSPECIFIED_START_TIME_PARTS }
  }
  const parsed = parseStartTime(trimmed)
  if (!parsed) {
    throw new Error('resolveStartTimeParts: invalid startTime')
  }
  return parsed
}

function startTimeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : ''
    if (!value) return null
    return parseStartTime(value) ? null : { invalidStartTime: true }
  }
}

@Component({
  selector: 'app-event-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgxMatTimepickerComponent,
    NgxMatTimepickerDirective,
    NgxMatTimepickerToggleComponent,
  ],
  templateUrl: './event-form-dialog.html',
  styleUrl: './event-form-dialog.scss',
})
export class EventFormDialog implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private formChangeSub?: Subscription
  private readonly api = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly ref = inject(MatDialogRef<EventFormDialog, EventResponse | boolean | undefined>)
  protected readonly data = inject<EventFormDialogData>(MAT_DIALOG_DATA)

  protected saving = false
  protected organizerSaving = false
  protected participantSaving = false
  protected organizerEmail = ''
  protected participantDisplayName = ''
  protected participantEmail = ''
  protected organizerMessage = ''
  protected participantMessage = ''
  protected readonly timepickerFormat24 = 24 as const

  protected readonly eventOrganizers = signal<OrganizerResponse[]>([])
  protected readonly eventParticipants = signal<EventParticipantAdmin[]>([])

  protected formError = ''

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    startDate: [null as Date | null, [Validators.required]],
    startTime: ['', [startTimeValidator()]],
    location: [''],
    description: [''],
  })

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.event) {
      const e = this.data.event
      const { date, hour, minute } = parseStartsAt(e.startsAt)
      this.form.patchValue({
        title: e.title,
        startDate: date,
        startTime: startTimeForForm(hour, minute),
        location: e.location ?? '',
        description: e.description ?? '',
      })
      if (this.canManageEventOrganizers()) {
        void this.loadEventOrganizers()
      }
      if (this.canManageEventParticipants()) {
        void this.loadEventParticipants()
      }
    }

    this.formChangeSub = this.form.valueChanges.subscribe(() => {
      this.formError = ''
    })
  }

  ngOnDestroy(): void {
    this.formChangeSub?.unsubscribe()
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

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.formError = ''
    const v = this.form.getRawValue()
    if (!v.startDate) {
      this.form.markAllAsTouched()
      return
    }
    if (this.form.controls.startTime.invalid) {
      this.form.markAllAsTouched()
      return
    }
    const timeParts = resolveStartTimeParts(v.startTime)
    const startsAt = buildStartsAtIso(v.startDate, timeParts.hour, timeParts.minute)
    const payload = {
      title: v.title.trim(),
      startsAt,
      location: v.location.trim() || null,
      description: v.description.trim() || null,
    }
    this.saving = true
    try {
      if (this.data.mode === 'create') {
        const r = await this.api.createEvent(this.data.seasonId, payload)
        if (!r.ok) {
          this.formError = r.errorMessage ?? 'Création impossible.'
          return
        }
        this.ref.close(r.data)
      } else if (this.data.event) {
        const r = await this.api.updateEvent(this.data.seasonId, this.data.event.id, payload)
        if (!r.ok) {
          this.formError = r.errorMessage ?? 'Mise à jour impossible.'
          return
        }
        this.ref.close(true)
      }
    } finally {
      this.saving = false
    }
  }
}
