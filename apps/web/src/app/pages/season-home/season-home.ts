import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import {
  type EventResponse,
  EventApiService,
} from '../../core/events/event-api.service'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
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
  SeasonOrganizersDialog,
  type SeasonOrganizersDialogData,
} from './season-organizers-dialog'
import {
  TroupeMembersDialog,
  type TroupeMembersDialogData,
} from './troupe-members-dialog'

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
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
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

  protected readonly loadingSession = signal(true)
  protected readonly loadingSeason = signal(false)
  protected readonly loadingEvents = signal(false)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly seasonPermissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly events = signal<EventResponse[]>([])
  protected readonly totalElements = signal(0)
  protected readonly eventsTruncated = signal(false)
  protected readonly eventLoadLimit = signal(AGENDA_UPCOMING_CAP)

  protected readonly seasonView = signal<SeasonView>('agenda')
  protected readonly selectedParticipantId = signal<string | null>(null)
  protected readonly selectedEventId = signal<string | null>(null)

  protected readonly participantOptions = computed<ParticipantFilterOption[]>(() => {
    // No player/availability API exists yet; keep the visible filter honest.
    return [{ id: null, label: 'Tous' }]
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
  protected readonly canManageSettings = computed(
    () =>
      this.seasonPermissions()?.canManageMembers === true ||
      this.seasonPermissions()?.canManageSeasonOrganizers === true,
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
        await this.router.navigate(['/connexion'], { replaceUrl: true })
        return
      }
      this.user.set(r.data.user)
      this.routeSubscription = this.route.paramMap
        .pipe(
          map((p) => p.get('slug') ?? ''),
          distinctUntilChanged(),
        )
        .subscribe((slug) => {
          void this.loadTroupeAndSeason(slug)
        })
    } finally {
      this.loadingSession.set(false)
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
  }

  private resetSeasonState(): void {
    this.season.set(null)
    this.seasonPermissions.set(null)
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
    const tr = await this.troupeApi.listMyTroupes()
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    if (!tr.ok || !tr.data?.length) {
      this.loadingSeason.set(false)
      this.snack.open('Vous n’appartenez à aucune troupe.', 'OK', { duration: 6000 })
      return
    }
    const troupe = tr.data[0]
    this.troupeId.set(troupe.id)
    this.troupeName.set(troupe.name)
    const sr = await this.seasonsApi.getSeasonBySlug(troupe.id, slug)
    if (requestId !== this.seasonLoadRequestId) {
      return
    }
    this.loadingSeason.set(false)
    if (!sr.ok || !sr.data) {
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }
    this.season.set(sr.data)
    await this.loadSeasonPermissions(sr.data.id)
    await this.loadUpcomingEvents()
  }

  private async loadSeasonPermissions(seasonId: string): Promise<void> {
    const r = await this.organizerApi.mySeasonPermissions(seasonId)
    this.seasonPermissions.set(r.ok && r.data ? r.data : null)
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
        this.loadingEvents.set(false)
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

    const visibleEvents = collected.slice(0, limit)
    const truncated = total > visibleEvents.length
    this.eventsTruncated.set(truncated)
    this.events.set(visibleEvents)
    this.totalElements.set(total)
    this.resetStaleEventFilter(visibleEvents)
    this.loadingEvents.set(false)
  }

  protected async openMembersAdmin(): Promise<void> {
    const troupeId = this.troupeId()
    const s = this.season()
    if (!troupeId || !s) {
      return
    }
    if (this.seasonPermissions()?.canManageMembers !== true) {
      await this.loadSeasonPermissions(s.id)
    }
    if (this.seasonPermissions()?.canManageMembers !== true) {
      this.snack.open('Vous ne pouvez pas administrer les membres de cette troupe.', 'OK', {
        duration: 5000,
      })
      return
    }
    const ref = this.dialog.open<TroupeMembersDialog, TroupeMembersDialogData, boolean>(
      TroupeMembersDialog,
      {
        data: { troupeId },
        width: 'min(100vw - 2rem, 60rem)',
      },
    )
    ref.afterClosed().subscribe((changed) => {
      if (changed) void this.loadSeasonPermissions(s.id)
    })
  }

  protected async openSeasonOrganizers(): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    if (this.seasonPermissions()?.canManageSeasonOrganizers !== true) {
      await this.loadSeasonPermissions(s.id)
    }
    if (this.seasonPermissions()?.canManageSeasonOrganizers !== true) {
      this.snack.open('Vous ne pouvez pas gérer les organisateur·ices de cette saison.', 'OK', {
        duration: 5000,
      })
      return
    }
    this.dialog.open<SeasonOrganizersDialog, SeasonOrganizersDialogData, boolean>(
      SeasonOrganizersDialog,
      {
        data: { seasonId: s.id },
        width: 'min(100vw - 2rem, 34rem)',
      },
    )
  }

  protected async onSettings(): Promise<void> {
    await this.openSeasonOrganizers()
  }

  protected openEvent(eventId: string): void {
    void this.router.navigate(['/saison', this.slug(), 'event', eventId])
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
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, boolean>(
      EventFormDialog,
      {
        data: { mode: 'create', seasonId: s.id },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadAfterMutation('Spectacle créé.')
      }
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
