import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { ActivatedRoute, ParamMap, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import {
  type EventDetailTab,
  eventDetailTabToQuery,
  isEventDetailTabParamKnown,
  resolveEventDetailTab,
} from '../../core/events/event-detail-tabs'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import { canManageComposition as canManageCompositionForEvent } from '../../core/permissions/organizer-permissions'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'
import {
  EventFormDialog,
  type EventFormDialogData,
} from '../season-home/event-form-dialog'
import { EventDisposTab } from '../../shared/availability/event-dispos-tab'
import { EventDetailHeader } from './event-detail-header'
import { EventEquipeTab } from './event-equipe-tab'
import { EventInfosTab } from './event-infos-tab'

@Component({
  selector: 'app-event-detail',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    EventDetailHeader,
    EventDisposTab,
    EventEquipeTab,
    EventInfosTab,
  ],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly eventsApi = inject(EventApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private querySubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )
  protected readonly eventId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('eventId') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly event = signal<EventResponse | null>(null)
  protected readonly seasonId = signal('')
  protected readonly troupeId = signal('')
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly seasonPermissions = signal<MySeasonPermissions | null>(null)
  protected readonly canSwitchSubject = signal(false)
  protected readonly activeTab = signal<EventDetailTab>('infos')
  protected readonly showConfirmPending = signal(false)

  protected readonly canManageEvents = computed(
    () => this.seasonPermissions()?.canManageEvents === true,
  )
  protected readonly canManageSeasonParticipants = computed(
    () => this.seasonPermissions()?.canManageSeasonParticipants === true,
  )
  protected readonly canManageSeasonOrganizersOnly = computed(() => {
    const perms = this.seasonPermissions()
    if (!perms) return false
    return perms.canManageSeasonOrganizers && perms.canManageMembers !== true
  })
  protected readonly canManageComposition = computed(() => {
    const ev = this.event()
    const perms = this.seasonPermissions()
    if (!ev || !perms) return false
    return canManageCompositionForEvent(perms, ev.id)
  })
  protected readonly canManageSettings = computed(
    () => this.canManageSeasonParticipants() || this.canManageSeasonOrganizersOnly(),
  )

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.user.set(session.data?.user ?? null)

    this.applyQueryParams(this.route.snapshot.queryParamMap)

    this.querySubscription = this.route.queryParamMap.subscribe((params) => {
      this.applyQueryParams(params)
    })

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => ({
          slug: p.get('slug') ?? '',
          eventId: p.get('eventId') ?? '',
        })),
        distinctUntilChanged((a, b) => a.slug === b.slug && a.eventId === b.eventId),
      )
      .subscribe(({ slug, eventId }) => {
        void this.loadEvent(slug, eventId)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    this.querySubscription.unsubscribe()
  }

  private applyQueryParams(params: ParamMap): void {
    const tab = resolveEventDetailTab(params)
    this.activeTab.set(tab)
    this.showConfirmPending.set(params.get('showConfirm') === 'true')

    const tabParam = params.get('tab')
    if (tabParam && !isEventDetailTabParamKnown(tabParam)) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: eventDetailTabToQuery(tab) },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
    }
  }

  protected onTabChange(index: number): void {
    const tabs: EventDetailTab[] = ['infos', 'dispos', 'equipe']
    const tab = tabs[index] ?? 'infos'
    this.activeTab.set(tab)
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: eventDetailTabToQuery(tab) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  protected tabIndex(): number {
    const tabs: EventDetailTab[] = ['infos', 'dispos', 'equipe']
    return Math.max(0, tabs.indexOf(this.activeTab()))
  }

  protected openEdit(): void {
    const ev = this.event()
    const seasonId = this.seasonId()
    if (!ev || !seasonId) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas modifier ce spectacle.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, boolean>(EventFormDialog, {
      data: {
        mode: 'edit',
        seasonId,
        event: ev,
        canManageEventOrganizers: this.seasonPermissions()?.canManageEventOrganizers === true,
        canManageEventParticipants: this.canManageEventParticipantsFor(ev.id),
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadEvent('Spectacle mis à jour.')
      }
    })
  }

  protected confirmArchive(): void {
    const ev = this.event()
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
    const seasonId = this.seasonId()
    const slug = this.slug()
    if (!seasonId || !slug) {
      return
    }
    const r = await this.eventsApi.archiveEvent(seasonId, ev.id)
    if (r.ok) {
      this.snack.open('Spectacle archivé.', 'OK', { duration: 4000 })
      await this.router.navigate(['/saison', slug])
    } else {
      this.snack.open('Archivage impossible.', 'OK', { duration: 6000 })
    }
  }

  protected reloadAfterPublish(): void {
    const slug = this.slug()
    const eventId = this.eventId()
    if (!slug || !eventId) {
      return
    }
    void this.loadEvent(slug, eventId, { silent: true })
  }

  private async reloadEvent(message: string): Promise<void> {
    const slug = this.slug()
    const eventId = this.eventId()
    if (!slug || !eventId) {
      return
    }
    await this.loadEvent(slug, eventId, { silent: true })
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private async loadEvent(
    slug: string,
    eventId: string,
    options: { silent?: boolean } = {},
  ): Promise<void> {
    const requestId = ++this.loadRequestId
    if (!options.silent) {
      this.loading.set(true)
      this.event.set(null)
    }
    if (!slug || !eventId) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(slug)
    if (requestId !== this.loadRequestId) {
      return
    }
    if (resolved.kind === 'no-membership' || resolved.kind === 'error') {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'ambiguous') {
      this.loading.set(false)
      this.snack.open(
        'Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.',
        'OK',
        { duration: 8000 },
      )
      return
    }
    if (resolved.kind === 'not-found') {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    this.seasonId.set(resolved.season.id)
    this.troupeId.set(resolved.troupe.id)

    const [eventResult, permissionsResult] = await Promise.all([
      this.eventsApi.getEvent(resolved.season.id, eventId),
      this.organizerApi.mySeasonPermissions(resolved.season.id),
    ])

    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!eventResult.ok || !eventResult.data) {
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
      return
    }
    const found = eventResult.data
    this.event.set(found)
    this.seasonPermissions.set(permissionsResult.ok && permissionsResult.data ? permissionsResult.data : null)

    this.canSwitchSubject.set(
      permissionsResult.ok && permissionsResult.data
        ? canManageCompositionForEvent(permissionsResult.data, found.id)
        : false,
    )
  }

  private canManageEventParticipantsFor(eventId: string): boolean {
    const perms = this.seasonPermissions()
    if (!perms) return false
    if (perms.canManageEventParticipants) return true
    return perms.eventParticipantAdminFor.includes(eventId)
  }
}
