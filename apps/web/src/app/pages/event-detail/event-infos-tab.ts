import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Router, RouterLink } from '@angular/router'
import { resolveCompositionEquipeStatusFromEvent, type CompositionEquipeStatus } from '../../core/composition/composition-equipe-status'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

import { isEventDraft } from '../../core/events/event-draft'
import { openEventAnnounceDialog } from '../../shared/share-announce/share-announce-open'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
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
import { troupeAdminSettingsPath, troupeHubPath, saisonWorkspacePath } from '../../core/navigation/troupe-routes'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'
import {
  buildEventCategoryOptions,
  CATEGORY_HELP,
  defaultCategoryLabelFromGlossary,
} from './event-category.constants'
import {
  OrganizerApiService,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  EventOrganizersDialog,
  type EventOrganizersDialogData,
} from './event-organizers-dialog'
import { ORGANIZERS_HELP } from './event-organizers-dialog'

@Component({
  selector: 'app-event-infos-tab',
  imports: [
    MatButtonModule,
    CompositionStatusBadge,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
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
  private readonly router = inject(Router)
  private readonly doc = inject(DOCUMENT)

  readonly event = input.required<EventResponse>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeSlug = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly seasonTitle = input<string | null>(null)
  readonly canEdit = input(false)
  readonly edit = output<void>()
  readonly canManageEvents = input(false)
  readonly canManageComposition = input(false)
  readonly detailedStatus = input<CompositionEquipeStatus | null>(null)
  readonly canManageTroupe = input(false)
  readonly canManageEventOrganizers = input(false)
  /** Incremented by parent when organizers change via admin menu dialog. */
  readonly organizersReloadTrigger = input(0)
  readonly bootstrapManagedByParent = input(false)
  readonly bootstrapError = input(false)
  readonly retryBootstrap = output<void>()
  readonly bootstrapOrganizers = input<OrganizerResponse[] | null>(null)
  readonly bootstrapCategories = input<TroupeCategory[] | null>(null)

  readonly eventUpdated = output<EventResponse>()

  protected readonly isDraft = computed(() => isEventDraft(this.event()))
  protected readonly publishing = signal(false)
  protected readonly detailsExpanded = signal(false)
  protected readonly statusHelpOpen = signal(false)
  protected readonly glossary = signal<TroupeCategory[]>([])
  protected readonly glossaryLoading = signal(true)
  protected readonly organizers = signal<OrganizerResponse[]>([])
  protected readonly saving = signal(false)
  protected readonly calendarMenuOpen = signal(false)
  protected readonly mapsMenuOpen = signal(false)

  protected readonly categoryHelp = CATEGORY_HELP
  protected readonly organizersHelp = ORGANIZERS_HELP

  protected readonly showOrganizersSection = computed(
    () => this.canManageEventOrganizers() || this.organizers().length > 0,
  )

  protected readonly showScopeNav = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.seasonTitle()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.seasonSlug()?.trim(),
  )

  protected readonly seasonWorkspaceLink = computed(() =>
    saisonWorkspacePath(this.troupeSlug(), this.seasonSlug()),
  )

  protected readonly troupeHubLink = computed(() => troupeHubPath(this.troupeSlug()))

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

  protected readonly eventStatus = computed(() =>
    this.detailedStatus() ?? resolveCompositionEquipeStatusFromEvent(this.event(), this.canManageComposition()),
  )

  protected readonly statusHelpText = computed(() => {
    switch (this.eventStatus()?.type) {
      case 'none': return 'La composition de l’équipe reste à préparer.'
      case 'complete': return 'L’équipe est complète et ses participations sont confirmées.'
      case 'slots_to_complete': return 'La composition est validée mais certains emplacements restent à compléter.'
      case 'has_declined': return 'Des retraits sont enregistrés dans la composition.'
      case 'pending_confirmation': return 'Certaines participations attendent une confirmation.'
      case 'draft': return 'La composition de l’équipe est en préparation.'
    }
    switch (this.event().teamStatusBadge?.key) {
      case 'draft': return 'La composition est en préparation.'
      case 'preparing': return 'La composition de l’équipe est en cours.'
      case 'confirmed': return 'La composition de l’équipe est confirmée.'
      default: return 'Les disponibilités sont en cours de collecte.'
    }
  })

  protected readonly defaultCategoryLabel = computed(() => defaultCategoryLabelFromGlossary(this.glossary()))

  protected readonly categoryLabel = computed(() =>
    this.glossary().find((category) => category.slug === this.event().category)?.label ?? this.event().category ?? '',
  )

  protected readonly selectedCategorySlug = computed(() => this.event().category ?? null)

  protected readonly categoryOptions = computed(() =>
    buildEventCategoryOptions(this.glossary(), this.selectedCategorySlug()),
  )

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
      const bootstrap = this.bootstrapCategories()
      const troupeId = this.troupeId()
      if (bootstrap != null) {
        this.glossary.set(bootstrap)
        this.glossaryLoading.set(false)
        return
      }
      if (troupeId && !this.bootstrapManagedByParent()) {
        void this.loadGlossary(troupeId)
      }
    })
    effect(() => {
      const bootstrap = this.bootstrapOrganizers()
      const seasonId = this.seasonId()
      const eventId = this.event().id
      const trigger = this.organizersReloadTrigger()
      if (bootstrap != null && trigger === 0) {
        this.organizers.set(bootstrap)
        return
      }
      if (seasonId && eventId && (!this.bootstrapManagedByParent() || trigger > 0)) {
        void this.loadOrganizers(seasonId, eventId)
      }
    })
  }

  protected formatDate(iso: string): string {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) {
      return 'Date invalide'
    }
    const time = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit', minute: '2-digit', timeZone: AGENDA_TIME_ZONE,
    }).format(date)
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...(time === '00:00' ? {} : { hour: '2-digit', minute: '2-digit' }),
      timeZone: AGENDA_TIME_ZONE,
    }).format(date)
  }

  protected readonly dateParts = computed(() => {
    const date = new Date(this.event().startsAt)
    if (Number.isNaN(date.getTime())) return null
    return {
      day: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: AGENDA_TIME_ZONE }).format(date),
      weekday: new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: AGENDA_TIME_ZONE }).format(date),
      monthYear: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: AGENDA_TIME_ZONE }).format(date),
      time: new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: AGENDA_TIME_ZONE }).format(date),
    }
  })

  protected confirmPublish(): void {
    const ev = this.event()
    if (!this.canManageComposition() || !this.isDraft() || this.publishing()) return
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Publier le spectacle',
        message: `Publier « ${ev.title} » ? Les membres verront le spectacle dans l’agenda et pourront déposer leurs disponibilités. Tu pourras ensuite l’annoncer (message, WhatsApp…).`,
        confirmLabel: 'Publier',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => { if (ok) void this.runPublish(ev) })
  }

  private async runPublish(ev: EventResponse): Promise<void> {
    const seasonId = this.seasonId()
    if (!seasonId || !this.canManageComposition() || !this.isDraft() || this.event().id !== ev.id) return
    this.publishing.set(true)
    try {
      const result = await this.eventsApi.openAvailabilityResilient(seasonId, ev.id)
      if (!result.ok || !result.data) {
        this.snack.open(result.errorMessage ?? 'Publication impossible.', 'OK', { duration: 6000 })
        return
      }
      this.eventUpdated.emit(result.data)
      this.snack.open('Spectacle publié.', 'OK', { duration: 4000 })
      openEventAnnounceDialog(this.dialog, { seasonId, seasonSlug: this.seasonSlug(), troupeSlug: this.troupeSlug(), event: result.data })
    } finally { this.publishing.set(false) }
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

  protected onCategorySelect(slug: string | null): void {
    if (!this.canManageEvents() || this.saving()) {
      return
    }
    void this.persistCategory(slug)
  }

  protected navigateToCategorySettings(): void {
    void this.router.navigate(troupeAdminSettingsPath(this.troupeSlug()), {
      queryParams: { tab: 'categories' },
    })
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

  private async persistCategory(slug: string | null): Promise<void> {
    const seasonId = this.seasonId()
    const ev = this.event()
    const body = { category: slug }

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
        cleared
          ? `${defaultCategoryLabelFromGlossary(this.glossary())}.`
          : 'Catégorie enregistrée.',
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
    this.glossaryLoading.set(true)
    try {
      const r = await this.troupeApi.listCategories(troupeId)
      if (troupeId !== this.troupeId()) {
        return
      }
      if (r.ok && r.data) {
        this.glossary.set(r.data)
        return
      }
      this.glossary.set([])
      this.snack.open('Impossible de charger les catégories.', 'OK', { duration: 6000 })
    } catch {
      if (troupeId !== this.troupeId()) {
        return
      }
      this.glossary.set([])
      this.snack.open('Impossible de charger les catégories.', 'OK', { duration: 6000 })
    } finally {
      if (troupeId === this.troupeId()) {
        this.glossaryLoading.set(false)
      }
    }
  }
}
