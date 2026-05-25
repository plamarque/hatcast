import { Component, computed, inject, model, OnDestroy, OnInit, signal } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-league-storage'
import {
  saisonAdminMembresPath,
  saisonAdminParticipantsPath,
  saisonEventPath,
} from '../../core/navigation/troupe-routes'
import type { ScopeAdminMenuItem } from '../../shared/scope-admin-menu/scope-admin-menu'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import {
  type EventResponse,
  EventApiService,
} from '../../core/events/event-api.service'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type ParticipantSelector,
} from '../../core/participants/participant-api.service'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'
import {
  AGENDA_UPCOMING_CAP,
  filterEventsByIds,
  groupEventsByMonth,
} from './season-events.utils'
import { SeasonAgenda } from './season-agenda'
import { SeasonHeader } from './season-header'
import { SeasonHistoryShell } from './season-history-shell'
import { SeasonViewToolbar } from './season-view-toolbar'
import type { EventFilterOption, ParticipantFilterOption, SeasonView } from './season-view.types'
import {
  EventFormDialog,
  type EventFormDialogData,
} from './event-form-dialog'
import {
  AvailabilityDialog,
  type AvailabilityDialogData,
  type AvailabilityDialogResult,
} from '../../shared/availability/availability-dialog'
import { normalizeRoleSlots } from '../../core/events/event-types'

const FETCH_PAGE_SIZE = 50

@Component({
  selector: 'app-season-home',
  imports: [
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    SeasonHeader,
    SeasonViewToolbar,
    SeasonAgenda,
    SeasonHistoryShell,
  ],
  templateUrl: './season-home.html',
  styleUrl: './season-home.scss',
})
export class SeasonHome implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly availabilityApi = inject(AvailabilityApiService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly eventsApi = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private seasonLoadRequestId = 0
  private eventLoadRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  private querySubscription = Subscription.EMPTY

  protected readonly loadingSession = signal(true)
  protected readonly loadingSeason = signal(false)
  protected readonly loadingEvents = signal(false)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly seasonPermissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly events = signal<EventResponse[]>([])
  protected readonly totalElements = signal(0)
  protected readonly eventsTruncated = signal(false)
  protected readonly eventLoadLimit = signal(AGENDA_UPCOMING_CAP)

  protected readonly seasonView = model<SeasonView>('agenda')
  protected readonly selectedParticipantId = model<string | null>(null)
  protected readonly selectedEventId = model<string | null>(null)

  protected readonly participantSelectors = signal<ParticipantSelector[]>([])

  protected readonly participantOptions = computed<ParticipantFilterOption[]>(() => {
    const opts: ParticipantFilterOption[] = [{ id: null, label: 'Tous' }]
    for (const p of this.participantSelectors()) {
      opts.push({ id: p.id, label: p.displayName })
    }
    return opts
  })

  protected readonly eventFilterOptions = computed<EventFilterOption[]>(() =>
    this.events().map((e) => ({ id: e.id, title: e.title })),
  )

  protected readonly filteredEvents = computed(() => {
    const ids = this.selectedEventId()
    return filterEventsByIds(this.events(), ids ? [ids] : null)
  })

  protected readonly monthGroups = computed(() =>
    groupEventsByMonth(this.filteredEvents()),
  )
  protected readonly canManageMembers = computed(() => this.seasonPermissions()?.canManageMembers === true)
  protected readonly canManageEvents = computed(() => this.seasonPermissions()?.canManageEvents === true)
  protected readonly canManageSeasonParticipants = computed(
    () => this.seasonPermissions()?.canManageSeasonParticipants === true,
  )
  protected readonly canManageSeasonOrganizers = computed(
    () => this.seasonPermissions()?.canManageSeasonOrganizers === true,
  )
  protected readonly canManageSeasonOrganizersOnly = computed(
    () =>
      this.canManageSeasonOrganizers() &&
      this.seasonPermissions()?.canManageMembers !== true,
  )
  protected readonly canManageSettings = computed(
    () =>
      this.canManageSeasonParticipants() ||
      this.canManageSeasonOrganizersOnly(),
  )

  protected readonly seasonAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    const slug = this.slug()
    if (!slug) {
      return []
    }
    const items: ScopeAdminMenuItem[] = []
    if (this.canManageSeasonParticipants()) {
      items.push({
        label: 'Participants',
        icon: 'groups',
        routerLink: saisonAdminParticipantsPath(slug),
      })
    }
    if (this.canManageSeasonOrganizersOnly()) {
      items.push({
        label: 'Organisateur·ices',
        icon: 'badge',
        routerLink: saisonAdminMembresPath(slug),
        queryParams: { onglet: 'organisateurs' },
      })
    }
    return items
  })

  protected readonly canEditAvailability = computed(() => {
    const user = this.user()
    const season = this.season()
    if (!user || !season) {
      return false
    }
    return this.troupeContext
      .activeTroupes()
      .some((troupe) => troupe.id === season.troupeId && troupe.membership.status === 'ACTIVE')
  })

  protected readonly myDisplayName = computed(() =>
    this.troupeContext.currentUserDisplayLabel(this.user()),
  )

  async ngOnInit(): Promise<void> {
    try {
      const r = await this.auth.ensureHatcastSession()
      if (!r.ok || !r.data) {
        this.snack.open(
          'Votre session a expiré ou vous n’êtes pas connecté.',
          'OK',
          { duration: 6000 },
        )
        rememberCurrentUrlForPostLogin(this.router)
        await this.router.navigate(['/connexion'], { replaceUrl: true })
        return
      }
      this.user.set(r.data.user)
      const snapshotParams = this.route.snapshot?.queryParamMap
      if (snapshotParams) {
        this.applyQueryParams(snapshotParams)
      }
      this.routeSubscription = this.route.paramMap
        .pipe(
          map((p) => p.get('slug') ?? ''),
          distinctUntilChanged(),
        )
        .subscribe((slug) => {
          void this.loadTroupeAndSeason(slug)
        })
      this.querySubscription = this.route.queryParamMap?.subscribe((params) => {
        this.applyQueryParams(params)
      }) ?? Subscription.EMPTY
    } finally {
      this.loadingSession.set(false)
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    this.querySubscription.unsubscribe()
  }

  private applyQueryParams(params: ParamMap): void {
    const eventId = params.get('event')
    const modal = params.get('modal')
    if (eventId && modal === 'event_details') {
      const slug = this.slug()
      if (slug) {
        const queryParams: Record<string, string> = {}
        for (const key of params.keys) {
          if (key === 'event' || key === 'modal') {
            continue
          }
          const value = params.get(key)
          if (value != null) {
            queryParams[key] = value
          }
        }
        const segment = this.events().find((e) => e.id === eventId)?.slug ?? eventId
        void this.router.navigate(saisonEventPath(slug, segment), {
          queryParams,
          replaceUrl: true,
        })
        return
      }
    }

    const view = params.get('view')
    if (view === 'agenda' || view === 'history') {
      this.seasonView.set(view)
    }
    const participant = params.get('participant')
    if (participant) {
      this.selectedParticipantId.set(participant)
    }
  }

  private resetSeasonState(): void {
    this.season.set(null)
    this.seasonPermissions.set(null)
    this.participantSelectors.set([])
    this.events.set([])
    this.totalElements.set(0)
    this.eventsTruncated.set(false)
    this.loadingEvents.set(false)
    this.eventLoadLimit.set(AGENDA_UPCOMING_CAP)
    this.selectedEventId.set(null)
  }

  private async loadTroupeAndSeason(slug: string): Promise<void> {
    const requestId = ++this.seasonLoadRequestId
    this.eventLoadRequestId += 1
    if (!slug) {
      this.resetSeasonState()
      return
    }
    this.resetSeasonState()
    this.loadingSeason.set(true)
    const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(slug)
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    if (resolved.kind === 'no-membership') {
      this.loadingSeason.set(false)
      this.snack.open('Vous n’appartenez à aucune troupe.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'ambiguous') {
      this.loadingSeason.set(false)
      this.snack.open('Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.', 'OK', {
        duration: 8000,
      })
      return
    }
    if (resolved.kind === 'not-found') {
      this.loadingSeason.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'error') {
      this.loadingSeason.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }
    this.loadingSeason.set(false)
    this.troupeId.set(resolved.troupe.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeSlug.set(resolved.troupe.slug)
    this.season.set(resolved.season)
    rememberLastVisitedSeasonSlug(slug)
    await Promise.all([
      this.loadSeasonPermissions(resolved.season.id, requestId),
      this.loadParticipantSelectors(resolved.season.id, requestId),
      this.loadUpcomingEvents(),
    ])
  }

  private async loadParticipantSelectors(seasonId: string, requestId: number): Promise<void> {
    const r = await this.participantApi.listSeasonParticipantSelectors(seasonId)
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    if (r.ok && r.data) {
      this.participantSelectors.set(r.data)
    }
  }

  private async loadSeasonPermissions(seasonId: string, requestId: number): Promise<void> {
    const r = await this.organizerApi.mySeasonPermissions(seasonId)
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    this.seasonPermissions.set(r.ok && r.data ? r.data : null)
  }

  private canManageEventParticipantsFor(eventId: string): boolean {
    const perms = this.seasonPermissions()
    if (!perms) return false
    if (perms.canManageEventParticipants) return true
    return perms.eventParticipantAdminFor.includes(eventId)
  }

  /** Loads upcoming events up to the current cap (story 3.3 option C). */
  private async loadUpcomingEvents(options: { force?: boolean } = {}): Promise<void> {
    const s = this.season()
    if (!s || (this.loadingEvents() && !options.force)) {
      return
    }
    const requestId = ++this.eventLoadRequestId
    const seasonId = s.id
    this.loadingEvents.set(true)
    try {
      let page = 0
      let collected: EventResponse[] = []
      let total = 0

      const limit = this.eventLoadLimit()
      while (collected.length < limit) {
        const r = await this.eventsApi.listEvents(
          seasonId,
          page,
          FETCH_PAGE_SIZE,
          'upcoming',
        )
        if (requestId !== this.eventLoadRequestId) {
          return
        }
        if (!r.ok || !r.data) {
          this.snack.open('Impossible de charger les spectacles.', 'OK', { duration: 6000 })
          return
        }
        total = r.data.totalElements
        collected = collected.concat(r.data.content)
        if (
          collected.length >= total ||
          r.data.content.length === 0 ||
          page >= r.data.totalPages - 1
        ) {
          break
        }
        page += 1
      }

      if (requestId !== this.eventLoadRequestId) {
        return
      }

      const visibleEvents = collected.slice(0, limit)
      const truncated = total > visibleEvents.length
      this.eventsTruncated.set(truncated)
      this.events.set(visibleEvents)
      this.totalElements.set(total)
      this.resetStaleEventFilter(visibleEvents)
    } finally {
      if (requestId === this.eventLoadRequestId) {
        this.loadingEvents.set(false)
      }
    }
  }

  protected openEvent(eventSlug: string): void {
    void this.router.navigate(saisonEventPath(this.slug(), eventSlug))
  }

  protected async openAvailability(payload: { eventId: string; status: AvailabilityStatus }): Promise<void> {
    const s = this.season()
    const ev = this.events().find((e) => e.id === payload.eventId)
    if (!s || !ev || !this.canEditAvailability()) {
      return
    }
    const availability = await this.availabilityApi.getMyAvailability(s.id, ev.id)
    const initialStatus = availability.ok && availability.data ? availability.data.status : payload.status
    const initialRoleKeys = availability.ok && availability.data ? availability.data.roleKeys : []
    const ref = this.dialog.open<AvailabilityDialog, AvailabilityDialogData, AvailabilityDialogResult>(
      AvailabilityDialog,
      {
        data: {
          seasonId: s.id,
          eventId: ev.id,
          eventTitle: ev.title,
          eventStartsAt: ev.startsAt,
          subjectDisplayName: this.myDisplayName(),
          initialStatus,
          troupeId: s.troupeId,
          roleSlots: normalizeRoleSlots(ev.roleSlots),
          initialRoleKeys,
        },
        width: 'min(100vw - 2rem, 26rem)',
        autoFocus: 'first-tabbable',
      },
    )
    ref.afterClosed().subscribe((result) => {
      if (!result) {
        return
      }
      this.events.update((list) =>
        list.map((e) =>
          e.id === ev.id ? { ...e, myAvailabilityStatus: result.status } : e,
        ),
      )
    })
  }

  protected loadMoreEvents(): void {
    if (this.loadingEvents() || !this.eventsTruncated()) {
      return
    }
    this.eventLoadLimit.update((current) => current + AGENDA_UPCOMING_CAP)
    void this.loadUpcomingEvents()
  }

  protected openCreate(): void {
    const s = this.season()
    if (!s) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas créer de spectacle dans cette saison.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, EventResponse | boolean | undefined>(
      EventFormDialog,
      {
        data: { mode: 'create', seasonId: s.id },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((result) => {
      if (!result) {
        return
      }
      if (typeof result === 'object' && result.slug) {
        void this.router.navigate(saisonEventPath(this.slug(), result.slug))
      }
      void this.reloadAfterMutation('Spectacle créé.')
    })
  }

  protected openEdit(eventId: string): void {
    const s = this.season()
    const ev = this.events().find((e) => e.id === eventId)
    if (!s || !ev) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas modifier ce spectacle.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, boolean>(
      EventFormDialog,
      {
        data: {
          mode: 'edit',
          seasonId: s.id,
          event: ev,
          canManageEventOrganizers: this.seasonPermissions()?.canManageEventOrganizers === true,
          canManageEventParticipants: this.canManageEventParticipantsFor(ev.id),
        },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadAfterMutation('Spectacle mis à jour.')
      }
    })
  }

  protected confirmArchive(eventId: string): void {
    const ev = this.events().find((e) => e.id === eventId)
    if (!ev) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas archiver ce spectacle.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Archiver le spectacle',
        message: `Archiver « ${ev.title} » ? Il disparaîtra de l’agenda.`,
        confirmLabel: 'Archiver',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runArchive(ev)
      }
    })
  }

  private async runArchive(ev: EventResponse): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const r = await this.eventsApi.archiveEvent(s.id, ev.id)
    if (r.ok) {
      await this.reloadAfterMutation('Spectacle archivé.')
    } else {
      this.snack.open('Archivage impossible.', 'OK', { duration: 6000 })
    }
  }

  private async reloadAfterMutation(message: string): Promise<void> {
    await this.loadUpcomingEvents({ force: true })
    await this.refreshSeasonCounts()
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private resetStaleEventFilter(events: EventResponse[]): void {
    const selected = this.selectedEventId()
    if (selected && !events.some((e) => e.id === selected)) {
      this.selectedEventId.set(null)
    }
  }

  private async refreshSeasonCounts(): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const r = await this.seasonsApi.getSeason(s.id)
    if (r.ok && r.data) {
      this.season.set(r.data)
    }
  }
}
