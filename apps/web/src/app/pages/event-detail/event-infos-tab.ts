import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import type { EventResponse } from '../../core/events/event-api.service'
import { EventApiService } from '../../core/events/event-api.service'
import {
  buildGoogleCalendarUrl,
  buildIcsContent,
  buildOutlookCalendarUrl,
  CALENDAR_SNACKBAR_DURATION_MS,
  CALENDAR_SNACKBAR_MESSAGES,
  isCalendarStartsAtValid,
  isEventPastForCalendar,
  sanitizeIcsFilename,
  triggerIcsDownload,
  type CalendarExportContext,
} from '../../core/events/event-calendar-export'
import { buildGoogleMapsSearchUrl, buildWazeUrl } from '../../core/events/event-maps'
import {
  type EventTypeId,
  getEventTypeIcon,
  getEventTypeLabel,
  normalizeRoleSlots,
  type RoleKey,
  rolesWithSlots,
} from '../../core/events/event-types'
import {
  roleDisplayChipItems,
  roleSlotCountSuffix,
} from '../../shared/event-roles/role-display-chip-set/role-display-chip-item'
import { RoleDisplayChipSet } from '../../shared/event-roles/role-display-chip-set/role-display-chip-set'
import { getPwaBrowserInfo } from '../../core/pwa/pwa-browser-info'
import {
  type TroupeCategory,
  TroupeApiService,
} from '../../core/troupes/troupe-api.service'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'
import {
  CATEGORY_HELP,
  EventCategoryDialog,
  type EventCategoryDialogData,
  type EventCategoryDialogResult,
} from './event-category-dialog'
import {
  OrganizerApiService,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  EventOrganizersDialog,
  type EventOrganizersDialogData,
} from './event-organizers-dialog'
import {
  EventTypeRolesDialog,
  type EventTypeRolesDialogData,
  type EventTypeRolesDialogResult,
} from './event-type-roles-dialog'

@Component({
  selector: 'app-event-infos-tab',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RoleDisplayChipSet,
  ],
  templateUrl: './event-infos-tab.html',
  styleUrl: './event-infos-tab.scss',
})
export class EventInfosTab {
  private readonly eventsApi = inject(EventApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly doc = inject(DOCUMENT)

  readonly event = input.required<EventResponse>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly canManageEvents = input(false)
  readonly canManageEventOrganizers = input(false)
  readonly canManageComposition = input(false)
  /** Incremented by parent when organizers change via admin menu dialog. */
  readonly organizersReloadTrigger = input(0)

  readonly eventUpdated = output<EventResponse>()

  protected readonly glossary = signal<TroupeCategory[]>([])
  protected readonly organizers = signal<OrganizerResponse[]>([])
  protected readonly saving = signal(false)
  /** Format et besoins — spinner from dialog close until PATCH + parent refresh. */
  protected readonly savingTypeRoles = signal(false)
  protected readonly calendarMenuOpen = signal(false)
  protected readonly mapsMenuOpen = signal(false)

  protected readonly categoryHelp = CATEGORY_HELP

  protected readonly showCategorySection = computed(
    () => this.canManageEvents() || this.event().category != null,
  )

  protected readonly showOrganizersSection = computed(
    () => this.canManageEventOrganizers() || this.organizers().length > 0,
  )

  protected readonly typeIcon = computed(() => getEventTypeIcon(this.event().templateType))
  protected readonly typeLabel = computed(() => getEventTypeLabel(this.event().templateType))
  protected readonly summaryRoleKeys = computed((): RoleKey[] =>
    rolesWithSlots(normalizeRoleSlots(this.event().roleSlots)),
  )
  protected readonly summaryRoleChipItems = computed(() =>
    roleDisplayChipItems(this.summaryRoleKeys(), (key) =>
      roleSlotCountSuffix(this.roleCount(key)),
    ),
  )

  protected readonly categoryLabel = computed(() => {
    const slug = this.event().category
    if (!slug) {
      return null
    }
    return this.glossary().find((t) => t.slug === slug)?.label ?? slug
  })

  protected readonly dateExportEnabled = computed(() => {
    const ev = this.event()
    if (!ev.slug?.trim()) {
      return false
    }
    return isCalendarStartsAtValid(ev.startsAt)
  })

  protected readonly locationInteractive = computed(() => !!this.event().location?.trim())

  protected readonly isPastEvent = computed(() =>
    isEventPastForCalendar(this.event().startsAt),
  )

  constructor() {
    effect(() => {
      const troupeId = this.troupeId()
      if (troupeId) {
        void this.loadGlossary(troupeId)
      }
    })
    effect(() => {
      const seasonId = this.seasonId()
      const eventId = this.event().id
      const _trigger = this.organizersReloadTrigger()
      if (seasonId && eventId) {
        void this.loadOrganizers(seasonId, eventId)
      }
    })
  }

  protected formatDate(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) {
      return 'Date invalide'
    }
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: AGENDA_TIME_ZONE,
    }).format(new Date(iso))
  }

  protected onCalendarMenuOpened(): void {
    this.calendarMenuOpen.set(true)
  }

  protected onCalendarMenuClosed(): void {
    this.calendarMenuOpen.set(false)
  }

  protected onMapsMenuOpened(): void {
    this.mapsMenuOpen.set(true)
  }

  protected onMapsMenuClosed(): void {
    this.mapsMenuOpen.set(false)
  }

  protected exportToGoogleCalendar(): void {
    this.runCalendarExport(() => {
      const url = buildGoogleCalendarUrl(this.event(), this.exportContext())
      return { kind: 'window' as const, url, successMessage: CALENDAR_SNACKBAR_MESSAGES.google }
    })
  }

  protected exportToOutlook(): void {
    this.runCalendarExport(() => {
      const url = buildOutlookCalendarUrl(this.event(), this.exportContext())
      return { kind: 'window' as const, url, successMessage: CALENDAR_SNACKBAR_MESSAGES.outlook }
    })
  }

  protected exportToAppleCalendar(): void {
    this.runCalendarExport(() => {
      const ev = this.event()
      const ics = buildIcsContent(ev, this.exportContext())
      const filename = sanitizeIcsFilename(ev.title, ev.startsAt)
      triggerIcsDownload(ics, filename, this.doc)
      const ua = this.doc.defaultView?.navigator.userAgent ?? ''
      const browser = getPwaBrowserInfo(ua)
      const isIosSafari = browser.isIOS && (browser.isSafari || browser.isSafariMobile)
      return {
        kind: 'download' as const,
        successMessage: isIosSafari
          ? CALENDAR_SNACKBAR_MESSAGES.icsIos
          : CALENDAR_SNACKBAR_MESSAGES.icsDownload,
      }
    })
  }

  protected openGoogleMaps(): void {
    const location = this.event().location?.trim()
    if (!location) {
      return
    }
    if (this.openExternalUrl(buildGoogleMapsSearchUrl(location)) === null) {
      this.showPopupBlockedSnack()
    }
  }

  protected openWaze(): void {
    const location = this.event().location?.trim()
    if (!location) {
      return
    }
    if (this.openExternalUrl(buildWazeUrl(location)) === null) {
      this.showPopupBlockedSnack()
    }
  }

  protected onCategoryChipClick(): void {
    if (this.canManageEvents()) {
      this.openCategoryDialog()
    }
  }

  protected roleCount(role: RoleKey): number {
    return normalizeRoleSlots(this.event().roleSlots)[role] ?? 0
  }

  protected organizerLabel(organizer: OrganizerResponse): string {
    return organizer.displayName || organizer.email
  }

  protected async removeOrganizer(userId: string): Promise<void> {
    if (!this.canManageEventOrganizers()) {
      return
    }
    const seasonId = this.seasonId()
    const eventId = this.event().id
    this.saving.set(true)
    try {
      const r = await this.organizerApi.removeEventOrganizer(seasonId, eventId, userId)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.loadOrganizers(seasonId, eventId)
      this.snack.open('Organisateur·ice retiré·e.', 'OK', { duration: 4000 })
    } finally {
      this.saving.set(false)
    }
  }

  protected openOrganizersDialog(): void {
    const ev = this.event()
    const ref = this.dialog.open<EventOrganizersDialog, EventOrganizersDialogData, boolean | undefined>(
      EventOrganizersDialog,
      {
        data: {
          seasonId: this.seasonId(),
          eventId: ev.id,
          troupeId: this.troupeId(),
        },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((added) => {
      if (added) {
        void this.loadOrganizers(this.seasonId(), ev.id)
        this.snack.open('Organisateur·ice ajouté·e.', 'OK', { duration: 4000 })
      }
    })
  }

  protected openTypeRolesDialog(): void {
    const ev = this.event()
    const ref = this.dialog.open<
      EventTypeRolesDialog,
      EventTypeRolesDialogData,
      EventTypeRolesDialogResult
    >(EventTypeRolesDialog, {
      data: {
        seasonId: this.seasonId(),
        eventId: ev.id,
        templateType: ev.templateType,
        roleSlots: ev.roleSlots,
      },
      width: 'min(100vw - 2rem, 32rem)',
    })
    ref.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return
      }
      this.savingTypeRoles.set(true)
      void this.persistTypeRoles(result)
    })
  }

  protected openCategoryDialog(): void {
    const label = this.categoryLabel()
    const ref = this.dialog.open<
      EventCategoryDialog,
      EventCategoryDialogData,
      EventCategoryDialogResult
    >(EventCategoryDialog, {
      data: {
        troupeId: this.troupeId(),
        initialQuery: label ?? '',
      },
      width: 'min(100vw - 2rem, 32rem)',
    })
    ref.afterClosed().subscribe((result) => {
      if (result === undefined) {
        return
      }
      void this.persistTag(result)
    })
  }

  protected removeCategory(): void {
    void this.persistTag(null)
  }

  private exportContext(): CalendarExportContext {
    return {
      origin: this.doc.location.origin,
      troupeSlug: this.troupeSlug(),
      seasonSlug: this.seasonSlug(),
    }
  }

  private runCalendarExport(
    action: () =>
      | { kind: 'window'; url: string; successMessage: string }
      | { kind: 'download'; successMessage: string },
  ): void {
    try {
      const result = action()
      if (result.kind === 'window') {
        const opened = this.openExternalUrl(result.url)
        if (opened === null) {
          this.showPopupBlockedSnack()
          return
        }
      }
      this.showCalendarSuccess(result.successMessage)
    } catch {
      this.snack.open(CALENDAR_SNACKBAR_MESSAGES.error, 'OK', {
        duration: CALENDAR_SNACKBAR_DURATION_MS,
      })
    }
  }

  private openExternalUrl(url: string): Window | null {
    if (!url.startsWith('https://')) {
      throw new Error('External URL must use HTTPS')
    }
    return this.doc.defaultView?.open(url, '_blank', 'noopener,noreferrer') ?? null
  }

  private showCalendarSuccess(message: string): void {
    const displayMessage = this.isPastEvent()
      ? `${message} ${CALENDAR_SNACKBAR_MESSAGES.pastEvent}`
      : message
    const isIcsMessage =
      message === CALENDAR_SNACKBAR_MESSAGES.icsDownload ||
      message === CALENDAR_SNACKBAR_MESSAGES.icsIos
    this.snack.open(displayMessage, 'OK', {
      duration: CALENDAR_SNACKBAR_DURATION_MS,
      politeness: isIcsMessage ? 'assertive' : 'polite',
    })
  }

  private showPopupBlockedSnack(): void {
    this.snack.open(CALENDAR_SNACKBAR_MESSAGES.popupBlocked, 'OK', {
      duration: CALENDAR_SNACKBAR_DURATION_MS,
    })
  }

  private async persistTypeRoles(result: {
    templateType: EventTypeId
    roleSlots: Record<string, number>
  }): Promise<void> {
    const seasonId = this.seasonId()
    const ev = this.event()
    const body = {
      templateType: result.templateType,
      roleSlots: normalizeRoleSlots(result.roleSlots),
    }

    this.saving.set(true)
    try {
      const apiResult = await this.eventsApi.updateEvent(seasonId, ev.id, body)
      if (!apiResult.ok || !apiResult.data) {
        const message = apiResult.errorMessage ?? 'Enregistrement impossible.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(apiResult.data)
      this.snack.open('Format et besoins enregistrés.', 'OK', { duration: 4000 })
    } finally {
      this.saving.set(false)
      this.savingTypeRoles.set(false)
    }
  }

  private async persistTag(value: string | null): Promise<void> {
    const seasonId = this.seasonId()
    const ev = this.event()
    const body = { category: value }

    this.saving.set(true)
    try {
      const result = await this.eventsApi.updateEvent(seasonId, ev.id, body)
      if (!result.ok || !result.data) {
        const message = result.errorMessage ?? 'Enregistrement impossible.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(result.data)
      const cleared = result.data.category == null
      this.snack.open(
        cleared ? 'Tag retiré.' : 'Tag enregistré.',
        'OK',
        { duration: 4000 },
      )
    } finally {
      this.saving.set(false)
    }
  }

  private async loadOrganizers(seasonId: string, eventId: string): Promise<void> {
    const r = await this.organizerApi.listEventOrganizers(seasonId, eventId)
    if (seasonId !== this.seasonId() || eventId !== this.event().id) {
      return
    }
    if (r.ok && r.data) {
      this.organizers.set(r.data)
    }
  }

  private async loadGlossary(troupeId: string): Promise<void> {
    const r = await this.troupeApi.listCategories(troupeId)
    if (troupeId !== this.troupeId()) {
      return
    }
    if (r.ok && r.data) {
      this.glossary.set(r.data)
    }
  }
}
