import { Component, inject, OnDestroy, OnInit } from '@angular/core'
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
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
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'
import { MatDialog } from '@angular/material/dialog'

export interface EventFormDialogData {
  mode: 'create' | 'edit'
  seasonId: string
  event?: EventResponse
  /** Peut publier / remettre en brouillon (organisateur spectacle ou admin). */
  canManagePublication?: boolean
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
    MatSlideToggleModule,
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
  private readonly dialog = inject(MatDialog)
  private readonly ref = inject(MatDialogRef<EventFormDialog, EventResponse | boolean | undefined>)
  protected readonly data = inject<EventFormDialogData>(MAT_DIALOG_DATA)

  protected saving = false
  protected formError = ''
  protected readonly timepickerFormat24 = 24 as const
  protected revertToDraft = false
  protected publishDraft = false

  protected readonly showRevertToDraftToggle = (): boolean =>
    this.data.mode === 'edit' &&
    !!this.data.event?.availabilityOpenedAt &&
    this.data.canManagePublication === true

  protected readonly showPublishDraftToggle = (): boolean =>
    this.data.mode === 'edit' &&
    !this.data.event?.availabilityOpenedAt &&
    this.data.canManagePublication === true

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
    }

    this.formChangeSub = this.form.valueChanges.subscribe(() => {
      this.formError = ''
    })
  }

  ngOnDestroy(): void {
    this.formChangeSub?.unsubscribe()
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
        if (!r.ok || !r.data) {
          this.formError = r.errorMessage ?? 'Mise à jour impossible.'
          return
        }
        let latest: EventResponse = r.data
        if (this.publishDraft && !this.data.event.availabilityOpenedAt) {
          const openResult = await this.api.openAvailability(this.data.seasonId, this.data.event.id)
          if (!openResult.ok || !openResult.data) {
            this.formError = openResult.errorMessage ?? 'Publication impossible.'
            return
          }
          latest = openResult.data
        }
        if (this.revertToDraft && this.data.event.availabilityOpenedAt) {
          const confirmed = await this.confirmRevertToDraft(this.data.event.title)
          if (!confirmed) {
            return
          }
          const closeResult = await this.api.closeAvailability(
            this.data.seasonId,
            this.data.event.id,
          )
          if (!closeResult.ok || !closeResult.data) {
            this.formError = closeResult.errorMessage ?? 'Remise en brouillon impossible.'
            return
          }
          latest = closeResult.data
        }
        this.ref.close(latest)
      }
    } finally {
      this.saving = false
    }
  }

  private confirmRevertToDraft(title: string): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Remettre en brouillon',
        message:
          `Remettre « ${title} » en brouillon ? Il disparaîtra de l’agenda des membres et la collecte des disponibilités sera fermée. Les personnes avec le lien pourront encore consulter la fiche.`,
        confirmLabel: 'Remettre en brouillon',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    return new Promise((resolve) => {
      ref.afterClosed().subscribe((ok) => resolve(ok === true))
    })
  }
}
