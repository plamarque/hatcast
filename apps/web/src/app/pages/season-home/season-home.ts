import {
  Component,
  computed,
  effect,
  inject,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  rememberLastMemberEntryPath,
  saisonMemberEntryPath,
} from '../../core/navigation/last-member-entry-path-storage'
import { ContextSwitcherDataService } from '../../core/navigation/context-switcher-data.service'
import { rememberLastVisitedSeasonSlug } from '../../core/navigation/last-visited-season-storage'
import {
  saisonAdminMembresPath,
  saisonAdminParticipantsPath,
  saisonEventPath,
  saisonWorkspacePath,
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
import {
  TroupeApiService,
  type TroupeCategory,
} from '../../core/troupes/troupe-api.service'
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
  eventFilterOptionFromResponse,
  resolveApiParticipantId,
} from '../../shared/filters/filter-builders'
import {
  AGENDA_UPCOMING_CAP,
  filterEventsByIds,
  filterEventsByParticipantFocus,
  groupEventsByMonth,
  groupPastEventsByMonth,
  HISTORY_PAST_CAP,
  mergeEventsById,
} from './season-events.utils'
import {
  SeasonStatisticsApiService,
  type SeasonStatisticsResponse,
} from '../../core/seasons/season-statistics-api.service'
import { SeasonAgenda } from './season-agenda'
import { SeasonHeader } from './season-header'
import {
  buildStatisticsCsv,
  downloadStatisticsCsv,
} from './season-statistics-export'
import { SeasonStatistics, type StatisticsEmptyReason } from './season-statistics'
import { SeasonViewToolbar } from './season-view-toolbar'
import {
  categoriesToQueryValue,
  defaultStatsCategoryFilter,
  statsCategoriesExportLabel,
  type StatsCategoryFilter,
} from './stats-categories'
import type { EventFilterOption, ParticipantFilterOption, SeasonView } from './season-view.types'
import {
  EventFormDialog,
  type EventFormDialogData,
} from './event-form-dialog'
import {
  SeasonFormDialog,
  type SeasonFormDialogData,
} from '../seasons-list/season-form-dialog'
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
    SeasonStatistics,
  ],
  templateUrl: './season-home.html',
  styleUrl: './season-home.scss',
})
export class SeasonHome implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly availabilityApi = inject(AvailabilityApiService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly contextSwitcherData = inject(ContextSwitcherDataService)
  private readonly eventsApi = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly statisticsApi = inject(SeasonStatisticsApiService)
  private routeSubscription = Subscription.EMPTY
  private seasonLoadRequestId = 0
  private eventLoadRequestId = 0
  private pastEventLoadRequestId = 0
  private statisticsLoadRequestId = 0
  private pinnedFilterLoadRequestId = 0

  private readonly pinnedFilterEvents = signal<EventResponse[]>([])

  constructor() {
    effect(() => {
      const view = this.seasonView()
      const seasonId = this.season()?.id
      const selectedIds =
        view === 'history' ? this.selectedHistoryEventIds() : this.selectedEventIds()
      const loaded = view === 'history' ? this.pastEvents() : this.events()
      void this.syncPinnedFilterEvents(seasonId, selectedIds, loaded)
    })
  }

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
  protected readonly troupeIsDemo = signal(false)
  protected readonly troupeLogoUrl = signal<string | null>(null)

  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly seasonPermissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly events = signal<EventResponse[]>([])
  protected readonly totalElements = signal(0)
  protected readonly eventsTruncated = signal(false)
  protected readonly eventLoadLimit = signal(AGENDA_UPCOMING_CAP)

  protected readonly pastEvents = signal<EventResponse[]>([])
  protected readonly pastTotalElements = signal(0)
  protected readonly pastEventsTruncated = signal(false)
  protected readonly pastEventLoadLimit = signal(HISTORY_PAST_CAP)
  protected readonly loadingPastEvents = signal(false)

  protected readonly seasonView = model<SeasonView>('agenda')
  protected readonly selectedParticipantIds = model<string[]>([])
  protected readonly selectedEventIds = model<string[]>([])
  protected readonly selectedHistoryEventIds = model<string[]>([])
  protected readonly selectedStatsEventIds = model<string[]>([])
  protected readonly statsDetailsExpanded = model(false)
  protected readonly statsCategoryFilter = signal<StatsCategoryFilter>(
    defaultStatsCategoryFilter(),
  )

  protected readonly statisticsData = signal<SeasonStatisticsResponse | null>(null)
  protected readonly loadingStatistics = signal(false)
  protected readonly statisticsEmptyReason = signal<StatisticsEmptyReason>(null)

  protected readonly participantSelectors = signal<ParticipantSelector[]>([])

  protected readonly participantOptions = computed<ParticipantFilterOption[]>(() => {
    const opts: ParticipantFilterOption[] = [{ id: null, label: 'Tous' }]
    for (const p of this.participantSelectors()) {
      opts.push({ id: p.id, label: p.displayName })
    }
    return opts
  })

  protected readonly eventFilterOptions = computed<EventFilterOption[]>(() =>
    this.events().map((e) => this.toEventFilterOption(e)),
  )

  protected readonly filteredEvents = computed(() => {
    const bySpectacle = filterEventsByIds(this.agendaEventsForFilter(), this.selectedEventIds())
    return filterEventsByParticipantFocus(bySpectacle, this.selectedParticipantIds())
  })

  protected readonly monthGroups = computed(() =>
    groupEventsByMonth(this.filteredEvents()),
  )

  protected readonly historyEventFilterOptions = computed<EventFilterOption[]>(() =>
    this.pastEvents().map((e) => this.toEventFilterOption(e, true)),
  )

  protected readonly filteredPastEvents = computed(() => {
    const bySpectacle = filterEventsByIds(
      this.historyEventsForFilter(),
      this.selectedHistoryEventIds(),
    )
    return filterEventsByParticipantFocus(bySpectacle, this.selectedParticipantIds())
  })

  protected readonly historyMonthGroups = computed(() =>
    groupPastEventsByMonth(this.filteredPastEvents()),
  )

  protected readonly historyFiltersExcludeAll = computed(
    () =>
      this.pastEvents().length > 0 &&
      this.filteredPastEvents().length === 0 &&
      (this.selectedHistoryEventIds().length > 0 || this.selectedParticipantIds().length > 0),
  )

  protected readonly statsEventFilterOptions = computed<EventFilterOption[]>(() =>
    (this.statisticsData()?.events ?? []).map((e) => ({
      id: e.id,
      title: e.title,
    })),
  )

  protected readonly displayStatisticsData = computed(() => {
    const data = this.statisticsData()
    if (!data) {
      return null
    }
    const participantIds = this.selectedParticipantIds()
    let rows = data.rows
    if (participantIds.length > 0) {
      const allowed = new Set(participantIds)
      rows = rows.filter((row) => allowed.has(row.participantId))
    }
    const eventIds = this.selectedStatsEventIds()
    const events = filterEventsByIds(data.events, eventIds)
    return { ...data, rows, events }
  })

  protected readonly categoryLabels = computed(() => {
    const map: Record<string, string> = {}
    for (const tag of this.categories()) {
      map[tag.slug] = tag.label
    }
    return map
  })

  protected readonly categoryGlossarySlugs = computed(() =>
    this.categories().map((t) => t.slug),
  )

  protected readonly filterTriggerVisible = computed(() => {
    if (!this.season()) {
      return false
    }
    const view = this.seasonView()
    if (view === 'stats') {
      return (
        this.categoryGlossarySlugs().length > 0 ||
        this.participantOptions().length > 1 ||
        this.statsEventFilterOptions().length > 0
      )
    }
    // Agenda / historique : filtre spectacles toujours utile (picker scope=all, inactifs inclus).
    return true
  })

  private readonly categories = signal<TroupeCategory[]>([])
  protected readonly canManageMembers = computed(() => this.seasonPermissions()?.canManageMembers === true)
  protected readonly canManageSeasons = computed(
    () => this.seasonPermissions()?.canManageSeasons === true,
  )
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
      this.canManageSeasonParticipants() || this.canManageSeasonOrganizers(),
  )
  protected readonly canExportSeasonStatistics = computed(() => {
    const permissions = this.seasonPermissions()
    return permissions?.isTroupeAdmin === true || permissions?.isSeasonOrganizer === true
  })

  protected readonly seasonAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    const slug = this.slug()
    if (!slug) {
      return []
    }
    const items: ScopeAdminMenuItem[] = []
    if (this.canManageSeasons()) {
      items.push({
        label: 'Modifier',
        icon: 'edit',
        action: () => this.openEditSeason(),
      })
    }
    if (this.canManageEvents()) {
      items.push({
        label: 'Nouveau spectacle',
        icon: 'add',
        action: () => this.openCreate(),
      })
    }
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
        icon: 'supervisor_account',
        routerLink: saisonAdminMembresPath(slug),
        queryParams: { onglet: 'organisateurs' },
      })
    }
    if (this.canExportSeasonStatistics()) {
      items.push({
        label: 'Exporter',
        icon: 'download',
        action: () => void this.exportSeasonStatisticsCsv(),
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

      let lastView: SeasonView | null = null
      let lastParticipant: string | null | undefined
      let lastStatsEvent: string | null | undefined
      let lastStatsGroupsKey: string | undefined
      const statsCategoriesKey = (c: StatsCategoryFilter): string =>
        c.kind === 'selected' ? `selected:${c.slugs.join(',')}` : c.kind
      const syncViewLoads = (): void => {
        const view = this.seasonView()
        const participantKey = this.selectedParticipantIds().join(',')
        const statsEventKey = this.selectedStatsEventIds().join(',')
        const statsCategoriesKeyValue = statsCategoriesKey(this.statsCategoryFilter())
        if (view !== lastView) {
          this.syncViewQueryParam()
        }
        if (
          view === lastView &&
          participantKey === lastParticipant &&
          (view !== 'stats' ||
            (statsEventKey === lastStatsEvent && statsCategoriesKeyValue === lastStatsGroupsKey))
        ) {
          return
        }
        lastView = view
        lastParticipant = participantKey
        lastStatsEvent = statsEventKey
        lastStatsGroupsKey = statsCategoriesKeyValue
        if (view === 'history' && this.season()) {
          void this.loadPastEvents()
        }
        if (view === 'agenda' && this.season()) {
          void this.loadUpcomingEvents()
        }
        if (view === 'stats' && this.season()) {
          void this.loadStatistics()
        }
      }
      syncViewLoads()
      this.seasonView.subscribe(syncViewLoads)
      this.selectedParticipantIds.subscribe(syncViewLoads)
      this.selectedStatsEventIds.subscribe(syncViewLoads)
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
    if (view === 'agenda' || view === 'history' || view === 'stats') {
      this.seasonView.set(view)
    }
    const participant = params.get('participant')
    if (participant) {
      this.selectedParticipantIds.set(
        participant.split(',').map((id) => id.trim()).filter(Boolean),
      )
    }
  }

  private syncViewQueryParam(): void {
    const view = this.seasonView()
    const current = this.route.snapshot.queryParamMap.get('view')
    if (current === view) {
      return
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
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
    this.selectedEventIds.set([])
    this.pastEvents.set([])
    this.pastTotalElements.set(0)
    this.pastEventsTruncated.set(false)
    this.loadingPastEvents.set(false)
    this.pastEventLoadLimit.set(HISTORY_PAST_CAP)
    this.selectedHistoryEventIds.set([])
    this.selectedStatsEventIds.set([])
    this.statisticsData.set(null)
    this.loadingStatistics.set(false)
    this.statisticsEmptyReason.set(null)
    this.statsDetailsExpanded.set(false)
    this.statsCategoryFilter.set(defaultStatsCategoryFilter())
    this.categories.set([])
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
    this.troupeIsDemo.set(resolved.troupe.isDemo)
    this.troupeLogoUrl.set(resolved.troupe.logoUrl ?? null)
    this.season.set(resolved.season)
    rememberLastVisitedSeasonSlug(slug, resolved.troupe.id)
    rememberLastMemberEntryPath(saisonMemberEntryPath(slug))
    if (this.seasonView() === 'stats') {
      this.loadingStatistics.set(true)
      this.statisticsEmptyReason.set(null)
    }
    if (this.seasonView() === 'history') {
      this.loadingPastEvents.set(true)
    }
    const viewLoads: Promise<void>[] = []
    if (this.seasonView() === 'stats') {
      viewLoads.push(this.loadStatistics())
    }
    if (this.seasonView() === 'history') {
      viewLoads.push(this.loadPastEvents())
    }
    await Promise.all([
      this.loadSeasonPermissions(resolved.season.id, requestId),
      this.loadParticipantSelectors(resolved.season.id, requestId),
      this.loadCategories(resolved.troupe.id, requestId),
      this.loadUpcomingEvents(),
      ...viewLoads,
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

  private async loadCategories(troupeId: string, requestId: number): Promise<void> {
    const r = await this.troupeApi.listCategories(troupeId)
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    this.categories.set(r.ok && r.data ? r.data : [])
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
    await this.loadSeasonEventsForScope('upcoming', options)
  }

  private async loadPastEvents(options: { force?: boolean } = {}): Promise<void> {
    await this.loadSeasonEventsForScope('past', options)
  }

  private async loadSeasonEventsForScope(
    scope: 'upcoming' | 'past',
    options: { force?: boolean } = {},
  ): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    if (scope === 'upcoming' && this.loadingEvents() && !options.force) {
      return
    }

    const requestId =
      scope === 'upcoming'
        ? ++this.eventLoadRequestId
        : ++this.pastEventLoadRequestId
    const seasonId = s.id
    const participantIds = this.selectedParticipantIds()
    const limit = scope === 'upcoming' ? this.eventLoadLimit() : this.pastEventLoadLimit()

    if (scope === 'upcoming') {
      this.loadingEvents.set(true)
    } else {
      this.loadingPastEvents.set(true)
    }

    try {
      let collected: EventResponse[] = []
      let total = 0

      if (participantIds.length > 1) {
        collected = await this.collectMergedEventsForParticipants(
          seasonId,
          scope,
          participantIds,
          limit,
          requestId,
          scope === 'upcoming' ? this.eventLoadRequestId : this.pastEventLoadRequestId,
        )
        total = collected.length
      } else {
        const participantId = resolveApiParticipantId(participantIds)
        const result = await this.collectPagedSeasonEvents(
          seasonId,
          scope,
          limit,
          { participantId },
          requestId,
          scope === 'upcoming' ? this.eventLoadRequestId : this.pastEventLoadRequestId,
        )
        collected = result.events
        total = result.totalElements
      }

      if (
        requestId !==
        (scope === 'upcoming' ? this.eventLoadRequestId : this.pastEventLoadRequestId)
      ) {
        return
      }

      const visibleEvents = collected.slice(0, limit)
      const truncated = total > visibleEvents.length

      if (scope === 'upcoming') {
        this.eventsTruncated.set(truncated)
        this.events.set(visibleEvents)
        this.totalElements.set(total)
        this.resetStaleEventFilter(visibleEvents)
      } else {
        this.pastEventsTruncated.set(truncated)
        this.pastEvents.set(visibleEvents)
        this.pastTotalElements.set(total)
        this.resetStaleHistoryEventFilter(visibleEvents)
      }
    } finally {
      if (
        requestId ===
        (scope === 'upcoming' ? this.eventLoadRequestId : this.pastEventLoadRequestId)
      ) {
        if (scope === 'upcoming') {
          this.loadingEvents.set(false)
        } else {
          this.loadingPastEvents.set(false)
        }
      }
    }
  }

  private async collectPagedSeasonEvents(
    seasonId: string,
    scope: 'upcoming' | 'past',
    limit: number,
    options: { participantId?: string | null },
    requestId: number,
    activeRequestId: number,
  ): Promise<{ events: EventResponse[]; totalElements: number }> {
    let page = 0
    let collected: EventResponse[] = []
    let total = 0
    const listScope = scope === 'past' ? 'past' : 'upcoming'

    while (collected.length < limit) {
      const r = await this.eventsApi.listEvents(
        seasonId,
        page,
        FETCH_PAGE_SIZE,
        listScope,
        options,
      )
      if (requestId !== activeRequestId) {
        return { events: [], totalElements: 0 }
      }
      if (!r.ok || !r.data) {
        const message =
          scope === 'past'
            ? 'Impossible de charger l’historique.'
            : 'Impossible de charger les spectacles.'
        this.snack.open(message, 'OK', { duration: 6000 })
        return { events: [], totalElements: 0 }
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

    return { events: collected, totalElements: total }
  }

  private async collectMergedEventsForParticipants(
    seasonId: string,
    scope: 'upcoming' | 'past',
    participantIds: string[],
    limit: number,
    requestId: number,
    activeRequestId: number,
  ): Promise<EventResponse[]> {
    const perParticipant = await Promise.all(
      participantIds.map(async (participantId) => {
        const result = await this.collectPagedSeasonEvents(
          seasonId,
          scope,
          limit,
          { participantId },
          requestId,
          activeRequestId,
        )
        return filterEventsByParticipantFocus(result.events, [participantId])
      }),
    )

    if (requestId !== activeRequestId) {
      return []
    }

    return mergeEventsById(perParticipant.flat()).slice(0, limit)
  }

  protected onStatsCategoryFilterChange(compartments: StatsCategoryFilter): void {
    this.statsCategoryFilter.set(compartments)
    if (this.seasonView() === 'stats' && this.season()) {
      void this.loadStatistics({ force: true })
    }
  }

  protected loadMorePastEvents(): void {
    if (this.loadingPastEvents() || !this.pastEventsTruncated()) {
      return
    }
    this.pastEventLoadLimit.update((current) => current + HISTORY_PAST_CAP)
    void this.loadPastEvents()
  }

  private async loadStatistics(options: { force?: boolean } = {}): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const compartments = this.statsCategoryFilter()
    if (compartments.kind === 'none') {
      this.statisticsData.set(null)
      this.statisticsEmptyReason.set('none-selected')
      this.loadingStatistics.set(false)
      return
    }

    const requestId = ++this.statisticsLoadRequestId
    const seasonId = s.id
    this.loadingStatistics.set(true)
    this.statisticsEmptyReason.set(null)
    try {
      const queryValue = categoriesToQueryValue(compartments)
      const categories =
        queryValue === 'all'
          ? ('all' as const)
          : queryValue === ''
            ? []
            : queryValue!.split(',')

      const r = await this.statisticsApi.loadStatistics(seasonId, {
        eventId: resolveApiParticipantId(this.selectedStatsEventIds()),
        participantId: resolveApiParticipantId(this.selectedParticipantIds()),
        categories,
      })
      if (requestId !== this.statisticsLoadRequestId) {
        return
      }
      if (!r.ok || !r.data) {
        this.statisticsData.set(null)
        this.statisticsEmptyReason.set(null)
        this.snack.open('Impossible de charger les statistiques.', 'OK', { duration: 6000 })
        return
      }
      if (r.data.events.length === 0) {
        this.statisticsData.set(r.data)
        this.statisticsEmptyReason.set('no-data')
      } else {
        this.statisticsData.set(r.data)
        this.statisticsEmptyReason.set(null)
      }
      this.resetStaleStatsEventFilter(r.data.events)
    } finally {
      if (requestId === this.statisticsLoadRequestId) {
        this.loadingStatistics.set(false)
      }
    }
  }

  protected async exportSeasonStatisticsCsv(): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    if (!this.canExportSeasonStatistics()) {
      this.snack.open('Vous ne pouvez pas exporter ces statistiques.', 'OK', { duration: 5000 })
      return
    }
    const r = await this.statisticsApi.loadStatistics(s.id, { categories: 'all' })
    if (!r.ok || !r.data) {
      this.snack.open('Impossible de charger les statistiques.', 'OK', { duration: 6000 })
      return
    }
    const data = r.data
    if (data.rows.length === 0 || data.events.length === 0) {
      this.snack.open('Aucune donnée à exporter.', 'OK', { duration: 4000 })
      return
    }
    const csv = buildStatisticsCsv(
      data,
      {
        showJeuDetails: true,
        showDecorumDetails: true,
        showBenevoleDetails: true,
        expandedMonths: new Set(),
      },
      {
        groupsLabel: statsCategoriesExportLabel({ kind: 'all' }, this.categoryLabels()),
      },
    )
    const slug = this.slug() || 'saison'
    const date = new Date().toISOString().slice(0, 10)
    downloadStatisticsCsv(`statistiques-${slug}-${date}.csv`, csv)
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
    const initialComment =
      availability.ok && availability.data ? (availability.data.comment ?? null) : null
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
          initialComment,
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

  protected openEditSeason(): void {
    const s = this.season()
    if (!s) {
      return
    }
    if (!this.canManageSeasons()) {
      this.snack.open('Vous ne pouvez pas modifier cette saison.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<SeasonFormDialog, SeasonFormDialogData, SeasonResponse>(
      SeasonFormDialog,
      {
        data: { mode: 'edit', troupeId: s.troupeId, season: s },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((updated) => {
      if (!updated) {
        return
      }
      this.season.set(updated)
      if (updated.slug !== this.slug()) {
        void this.router.navigate(saisonWorkspacePath(updated.slug), {
          replaceUrl: true,
          queryParams: { view: this.seasonView() },
        })
      }
      this.snack.open('Saison mise à jour.', 'OK', { duration: 4000 })
    })
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

  private async reloadAfterMutation(message: string): Promise<void> {
    await this.loadUpcomingEvents({ force: true })
    await this.refreshSeasonCounts()
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private resetStaleEventFilter(events: EventResponse[]): void {
    this.pruneStaleEventIds(
      [...events, ...this.pinnedFilterEvents()],
      this.selectedEventIds,
      (ids) => this.selectedEventIds.set(ids),
    )
  }

  private resetStaleHistoryEventFilter(events: EventResponse[]): void {
    this.pruneStaleEventIds(
      [...events, ...this.pinnedFilterEvents()],
      this.selectedHistoryEventIds,
      (ids) => this.selectedHistoryEventIds.set(ids),
    )
  }

  private resetStaleStatsEventFilter(
    events: SeasonStatisticsResponse['events'],
  ): void {
    const allowed = new Set(events.map((e) => e.id))
    const next = this.selectedStatsEventIds().filter((id) => allowed.has(id))
    if (next.length !== this.selectedStatsEventIds().length) {
      this.selectedStatsEventIds.set(next)
    }
  }

  private pruneStaleEventIds(
    events: { id: string }[],
    current: () => string[],
    apply: (ids: string[]) => void,
  ): void {
    const allowed = new Set(events.map((e) => e.id))
    const next = current().filter((id) => allowed.has(id))
    if (next.length !== current().length) {
      apply(next)
    }
  }

  private toEventFilterOption(e: EventResponse, forcePast = false): EventFilterOption {
    const opt = eventFilterOptionFromResponse(e)
    return forcePast ? { ...opt, past: true } : opt
  }

  private agendaEventsForFilter(): EventResponse[] {
    return this.mergeEventsForFilter(this.events())
  }

  private historyEventsForFilter(): EventResponse[] {
    return this.mergeEventsForFilter(this.pastEvents())
  }

  private mergeEventsForFilter(base: EventResponse[]): EventResponse[] {
    const byId = new Map(base.map((e) => [e.id, e]))
    for (const e of this.pinnedFilterEvents()) {
      byId.set(e.id, e)
    }
    return [...byId.values()]
  }

  private async syncPinnedFilterEvents(
    seasonId: string | undefined,
    selectedIds: string[],
    loaded: EventResponse[],
  ): Promise<void> {
    const view = this.seasonView()
    if (view !== 'agenda' && view !== 'history') {
      this.pinnedFilterEvents.set([])
      return
    }
    const loadedIds = new Set(loaded.map((e) => e.id))
    const missing = selectedIds.filter((id) => !loadedIds.has(id))
    if (!seasonId || missing.length === 0) {
      this.pinnedFilterEvents.set([])
      return
    }
    const requestId = ++this.pinnedFilterLoadRequestId
    const fetched: EventResponse[] = []
    for (const id of missing) {
      const r = await this.eventsApi.getEvent(seasonId, id)
      if (requestId !== this.pinnedFilterLoadRequestId) {
        return
      }
      if (r.ok && r.data) {
        fetched.push(r.data)
      }
    }
    if (requestId === this.pinnedFilterLoadRequestId) {
      this.pinnedFilterEvents.set(fetched)
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
