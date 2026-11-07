import { Component, inject, OnDestroy, OnInit, output } from '@angular/core'
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
import { MatChipsModule } from '@angular/material/chips'
import { OrganizerApiService, type OrganizerResponse } from '../../core/permissions/organizer-api.service'
import { EventOrganizersDialog, type EventOrganizersDialogData } from '../event-detail/event-organizers-dialog'
import { TroupeCategoriesDialog } from '../troupe-settings/troupe-categories-dialog'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { TroupeApiService, type TroupeCategory } from '../../core/troupes/troupe-api.service'
import { applyTemplate, detectTemplateFromRoles, EVENT_TYPE_IDS, getEventTypeIcon, getEventTypeLabel, normalizeRoleSlots, roleSlotsEqual, rolesWithSlots, TEMPLATE_DISPLAY_ORDER, type EventTypeId } from '../../core/events/event-types'
import { getRoleLabel } from '../../shared/event-roles/event-roles'
import { buildEventCategoryOptions } from '../event-detail/event-category.constants'
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
  canManageEvents?: boolean
  canManageComposition?: boolean
  troupeId?: string
  troupeSlug?: string
  canManageTroupe?: boolean
  canManageEventOrganizers?: boolean
  organizers?: OrganizerResponse[] | null
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
    MatChipsModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
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
  private readonly troupeApi = inject(TroupeApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly dialog = inject(MatDialog)
  private readonly ref = inject(MatDialogRef<EventFormDialog, EventResponse | boolean | undefined>)
  protected readonly data = inject<EventFormDialogData>(MAT_DIALOG_DATA)
  readonly organizersChanged = output<void>()
  readonly categoriesChanged = output<void>()
  protected organizers: OrganizerResponse[] = []
  protected organizersLoading = false
  protected organizerSaving = false
  protected organizersError = ''

  protected readonly templateOrder = TEMPLATE_DISPLAY_ORDER
  protected readonly getEventTypeIcon = getEventTypeIcon
  protected readonly getEventTypeLabel = getEventTypeLabel
  protected selectedTemplate!: EventTypeId
  protected initialTemplate!: EventTypeId
  protected selectedCategory: string | null = null
  protected categoryOptions: ReturnType<typeof buildEventCategoryOptions> = []
  protected categoriesLoading = false
  protected categoriesError = ''
  protected selectedCategoryMissing = false
  protected get canEditDetails(): boolean { return this.data.mode === 'create' || this.data.canManageEvents !== false }
  protected get canEditFormat(): boolean { return this.data.canManageComposition === true }
  protected get formatChanged(): boolean { return this.selectedTemplate !== this.initialTemplate }
  protected get formatWarning(): boolean {
    return this.formatChanged && !!this.data.event && !roleSlotsEqual(normalizeRoleSlots(this.data.event.roleSlots), applyTemplate(this.selectedTemplate))
  }
  protected get presetSummary(): string {
    const slots = applyTemplate(this.selectedTemplate)
    return rolesWithSlots(slots).map((role) => `${getRoleLabel(role, null, slots[role] > 1)} : ${slots[role]}`).join(', ')
  }
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
      const type = e.templateType as EventTypeId
      this.initialTemplate = EVENT_TYPE_IDS.includes(type) ? type : detectTemplateFromRoles(normalizeRoleSlots(e.roleSlots))
      this.selectedTemplate = this.initialTemplate
      this.selectedCategory = e.category ?? null
      this.categoryOptions = buildEventCategoryOptions([], this.selectedCategory)
      if (this.data.canManageEventOrganizers) {
        if (this.data.organizers != null) this.organizers = this.data.organizers
        else void this.loadOrganizers()
      }
      if (this.data.troupeId) void this.loadCategories(this.data.troupeId)
      const { date, hour, minute } = parseStartsAt(e.startsAt)
      this.form.patchValue({
        title: e.title,
        startDate: date,
        startTime: startTimeForForm(hour, minute),
        location: e.location ?? '',
        description: e.description ?? '',
      })
    }

    if (!this.canEditDetails) this.form.disable()
    this.formChangeSub = this.form.valueChanges.subscribe(() => {
      this.formError = ''
    })
  }

  ngOnDestroy(): void {
    this.formChangeSub?.unsubscribe()
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.selectedCategoryMissing || this.categoriesLoading || !!this.categoriesError) {
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
    const details = {
      title: v.title.trim(),
      startsAt,
      location: v.location.trim() || null,
      description: v.description.trim() || null,
    }
    const payload = this.canEditDetails ? details : {}
    if (this.data.mode === 'edit' && this.canEditDetails && this.data.troupeId && this.selectedCategory !== (this.data.event?.category ?? null)) Object.assign(payload, { category: this.selectedCategory })
    if (this.data.mode === 'edit' && this.canEditFormat && this.formatChanged) Object.assign(payload, { templateType: this.selectedTemplate, roleSlots: normalizeRoleSlots(applyTemplate(this.selectedTemplate)) })
    this.saving = true
    try {
      if (this.data.mode === 'create') {
        const r = await this.api.createEvent(this.data.seasonId, details)
        if (!r.ok) {
          this.formError = r.errorMessage ?? 'Création impossible.'
          return
        }
        this.ref.close(r.data)
      } else if (this.data.event) {
        if (this.revertToDraft && this.data.event.availabilityOpenedAt) {
          const confirmed = await this.confirmRevertToDraft(this.data.event.title)
          if (!confirmed) return
        }
        let latest: EventResponse = this.data.event
        if (Object.keys(payload).length > 0) {
          const r = await this.api.updateEvent(this.data.seasonId, this.data.event.id, payload)
          if (!r.ok || !r.data) {
            this.formError = r.errorMessage ?? 'Mise à jour impossible.'
            return
          }
          latest = r.data
        }
        if (this.publishDraft && !this.data.event.availabilityOpenedAt) {
          const openResult = await this.api.openAvailabilityResilient(
            this.data.seasonId,
            this.data.event.id,
          )
          if (!openResult.ok || !openResult.data) {
            this.formError = openResult.errorMessage ?? 'Publication impossible.'
            return
          }
          latest = openResult.data
        }
        if (this.revertToDraft && this.data.event.availabilityOpenedAt) {
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

  protected async loadOrganizers(): Promise<void> {
    const event = this.data.event
    if (!event || !this.data.canManageEventOrganizers) return
    this.organizersLoading = true
    this.organizersError = ''
    try {
      const result = await this.organizerApi.listEventOrganizers(this.data.seasonId, event.id)
      if (!result.ok || !result.data) { this.organizersError = 'Impossible de charger les organisateur·ices.'; return }
      this.organizers = result.data
    } catch { this.organizersError = 'Impossible de charger les organisateur·ices.' }
    finally { this.organizersLoading = false }
  }

  protected async removeOrganizer(userId: string): Promise<void> {
    const event = this.data.event
    if (!event || !this.data.canManageEventOrganizers || this.organizerSaving) return
    this.organizerSaving = true
    this.ref.disableClose = true
    this.organizersError = ''
    try {
      const result = await this.organizerApi.removeEventOrganizer(this.data.seasonId, event.id, userId)
      if (!result.ok) { this.organizersError = 'Retrait impossible.'; return }
      this.organizers = this.organizers.filter((organizer) => organizer.userId !== userId)
      this.organizersChanged.emit()
    } catch { this.organizersError = 'Retrait impossible.' }
    finally { this.organizerSaving = false; this.ref.disableClose = false }
  }

  protected openOrganizersDialog(): void {
    const event = this.data.event
    if (!event || !this.data.canManageEventOrganizers || !this.data.troupeId) return
    const ref = this.dialog.open<EventOrganizersDialog, EventOrganizersDialogData, boolean | undefined>(EventOrganizersDialog, {
      data: { seasonId: this.data.seasonId, eventId: event.id, troupeId: this.data.troupeId },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((added) => {
      if (added) { this.organizersChanged.emit(); void this.loadOrganizers() }
    })
  }

  protected openCategorySettings(): void {
    if (!this.data.canManageTroupe || !this.data.troupeId || this.saving || this.organizerSaving) return
    const ref = this.dialog.open(TroupeCategoriesDialog, {
      data: { troupeId: this.data.troupeId },
      width: 'min(100vw - 2rem, 32rem)',
    })
    ref.afterClosed().subscribe(() => { this.categoriesChanged.emit(); void this.loadCategories(this.data.troupeId!, true) })
  }

  protected onCategoryChanged(slug: string | null): void {
    this.selectedCategory = slug
    this.selectedCategoryMissing = false
  }

  protected async loadCategories(troupeId: string, validateSelection = false): Promise<void> {
    this.categoriesLoading = true
    this.categoriesError = ''
    try {
      const result = await this.troupeApi.listCategories(troupeId)
      if (!result.ok || !result.data) { this.categoriesError = 'Impossible de charger les catégories.'; return }
      this.categoryOptions = buildEventCategoryOptions(result.data, this.selectedCategory)
      if (validateSelection) {
        this.selectedCategoryMissing = !!this.selectedCategory && !result.data.some((category) => category.slug === this.selectedCategory)
      }
    } catch { this.categoriesError = 'Impossible de charger les catégories.' }
    finally { this.categoriesLoading = false }
  }

  protected retryCategories(): void {
    if (this.data.troupeId) void this.loadCategories(this.data.troupeId, true)
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
