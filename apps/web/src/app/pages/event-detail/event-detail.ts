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
  ParticipantApiService,
} from '../../core/participants/participant-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  saisonEventParticipantsAdminPath,
  saisonEventPath,
  saisonWorkspacePath,
} from '../../core/navigation/troupe-routes'
import { UUID_IN_PATH_REGEX } from '../../core/navigation/url-slug'
import type { ScopeAdminMenuItem } from '../../shared/scope-admin-menu/scope-admin-menu'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'
import {
  EventFormDialog,
  type EventFormDialogData,
} from '../season-home/event-form-dialog'
import { EventDisposTab } from '../../shared/availability/event-dispos-tab'
import { EventActiviteTab } from '../../shared/availability/event-activite-tab'
import { EventDetailDraftBanner } from './event-detail-draft-banner'
import { EventDetailHeader } from './event-detail-header'
import type { CompositionResponse } from '../../core/composition/composition-api.service'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { computeCompositionLifecycleView } from '../../core/composition/composition-lifecycle'
import { resolveCompositionEquipeStatus } from '../../core/composition/composition-equipe-status'
import { normalizeRoleSlots } from '../../core/events/event-types'
import { CompositionEquipeStatusHeader } from '../../shared/composition/composition-equipe-status-header'
import { EventEquipeTab } from './event-equipe-tab'
import { EventInfosTab } from './event-infos-tab'
import { isEventDraft } from '../../core/events/event-draft'
import { openEventAnnounceDialog } from '../../shared/share-announce/share-announce-open'

@Component({
  selector: 'app-event-detail',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    EventDetailDraftBanner,
    EventDetailHeader,
    EventDisposTab,
    EventActiviteTab,
    EventEquipeTab,
    EventInfosTab,
    CompositionEquipeStatusHeader,
  ],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss', '../../shared/composition/composition-equipe-status-header.scss'],
})
export class EventDetail implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly compositionApi = inject(CompositionApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private querySubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('seasonSlug') ?? '')),
    { initialValue: '' },
  )
  protected readonly routeTroupeSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('troupeSlug') ?? '')),
    { initialValue: '' },
  )
  protected readonly eventSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('eventSlug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly event = signal<EventResponse | null>(null)
  protected readonly seasonId = signal('')
  protected readonly troupeId = signal('')
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly seasonPermissions = signal<MySeasonPermissions | null>(null)
  protected readonly canSwitchSubject = signal(false)
  protected readonly linkedParticipantId = signal<string | null>(null)
  protected readonly linkedParticipantName = signal<string | null>(null)
  protected readonly activeTab = signal<EventDetailTab>('infos')
  protected readonly organizersReloadTrigger = signal(0)
  protected readonly showConfirmPending = signal(false)
  protected readonly contextTroupeName = signal('')
  protected readonly contextTroupeSlug = signal('')
  protected readonly contextTroupeIsDemo = signal(false)
  protected readonly contextTroupeLogoUrl = signal<string | null>(null)
  protected readonly contextLeagueTitle = signal('')
  protected readonly contextSeasonSlug = signal('')
  protected readonly composition = signal<CompositionResponse | null>(null)
  protected readonly compositionLoaded = signal(false)

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
  protected readonly canManageSettings = computed(
    () =>
      this.canManageSeasonParticipants() ||
      this.canManageSeasonOrganizersOnly(),
  )
  protected readonly eventAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    const slug = this.slug()
    const ev = this.event()
    if (!slug || !ev) {
      return []
    }
    const items: ScopeAdminMenuItem[] = []
    if (this.canManageEvents() && !ev.archived) {
      items.push({
        label: 'Modifier',
        icon: 'edit',
        action: () => this.openEdit(),
      })
    }
    if (this.canAnnouncePublishedEvent()) {
      items.push({
        label: 'Annoncer',
        icon: 'campaign',
        action: () => this.openAnnounceEvent(),
      })
    }
    if (this.canOpenEventParticipantsAdmin(ev.id)) {
      items.push({
        label: 'Participants',
        icon: 'groups',
        action: () => this.openEventParticipantsAdmin(),
      })
    }
    if (this.canManageEvents() && !ev.archived) {
      items.push({
        label: 'Désactiver',
        icon: 'archive',
        action: () => this.confirmArchive(),
      })
    }
    if (this.canManageEvents() && ev.archived) {
      items.push({
        label: 'Réactiver',
        icon: 'unarchive',
        action: () => this.confirmUnarchive(),
      })
    }
    return items
  })
  protected readonly canManageComposition = computed(() => {
    const ev = this.event()
    const perms = this.seasonPermissions()
    if (!ev || !perms) return false
    return canManageCompositionForEvent(perms, ev.id)
  })
  protected readonly canAnnouncePublishedEvent = computed(() => {
    const ev = this.event()
    if (!ev || ev.archived || isEventDraft(ev)) {
      return false
    }
    return this.canManageComposition()
  })
  protected readonly equipeStatus = computed(() => {
    const ev = this.event()
    if (!ev || !this.compositionLoaded()) {
      return null
    }
    return resolveCompositionEquipeStatus({
      composition: this.composition(),
      canManageComposition: this.canManageComposition(),
      roleSlots: normalizeRoleSlots(ev.roleSlots),
    })
  })
  protected readonly canViewAuditEvent = computed(() => {
    const ev = this.event()
    const perms = this.seasonPermissions()
    if (!ev || !perms) return false
    return perms.canViewAuditSeason === true ||
      (perms.canViewAuditEvent === true && perms.eventOrganizerFor.includes(ev.id))
  })
  protected readonly showActiviteTab = computed(
    () => this.canViewAuditEvent() || !!this.linkedParticipantId(),
  )
  protected readonly visibleTabs = computed((): EventDetailTab[] => {
    const tabs: EventDetailTab[] = ['infos', 'dispos', 'equipe']
    if (this.showActiviteTab()) {
      tabs.push('activite')
    }
    return tabs
  })
  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      rememberCurrentUrlForPostLogin(this.router)
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
          troupeSlug: p.get('troupeSlug') ?? '',
          seasonSlug: p.get('seasonSlug') ?? '',
          eventSlug: p.get('eventSlug') ?? '',
        })),
        distinctUntilChanged(
          (a, b) =>
            a.troupeSlug === b.troupeSlug &&
            a.seasonSlug === b.seasonSlug &&
            a.eventSlug === b.eventSlug,
        ),
      )
      .subscribe(({ troupeSlug, seasonSlug, eventSlug }) => {
        void this.loadEvent(troupeSlug, seasonSlug, eventSlug)
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
    const tab = this.visibleTabs()[index] ?? 'infos'
    this.activeTab.set(tab)
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: eventDetailTabToQuery(tab) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  protected tabIndex(): number {
    return Math.max(0, this.visibleTabs().indexOf(this.activeTab()))
  }

  protected openEventParticipantsAdmin(): void {
    const ev = this.event()
    const slug = this.slug()
    const troupeSlug = this.routeTroupeSlug()
    if (!ev || !slug || !troupeSlug) {
      return
    }
    if (!this.canOpenEventParticipantsAdmin(ev.id)) {
      this.snack.open('Vous ne pouvez pas gérer les participants de ce spectacle.', 'OK', {
        duration: 5000,
      })
      return
    }
    void this.router.navigate(
      saisonEventParticipantsAdminPath(troupeSlug, slug, ev.slug ?? ev.id),
    )
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
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, EventResponse | undefined>(
      EventFormDialog,
      {
        data: {
          mode: 'edit',
          seasonId,
          event: ev,
          canManagePublication: this.canManageComposition(),
        },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((updated) => {
      if (!updated) {
        return
      }
      this.applyEventDetailUpdate(ev, updated)
    })
  }

  protected openAnnounceEvent(): void {
    const ev = this.event()
    const seasonId = this.seasonId()
    const seasonSlug = this.slug()
    const troupeSlug = this.contextTroupeSlug() || this.routeTroupeSlug()
    if (!ev || !seasonId || !seasonSlug || !troupeSlug) {
      return
    }
    if (!this.canAnnouncePublishedEvent()) {
      return
    }
    openEventAnnounceDialog(this.dialog, this.snack, {
      seasonId,
      seasonSlug,
      troupeSlug,
      event: ev,
    })
  }

  private applyEventDetailUpdate(before: EventResponse, after: EventResponse): void {
    this.event.set(after)
    const message = this.eventUpdateSnackMessage(before, after)
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private eventUpdateSnackMessage(before: EventResponse, after: EventResponse): string {
    const wasOpen = before.availabilityOpenedAt != null
    const isOpen = after.availabilityOpenedAt != null
    if (wasOpen && !isOpen) {
      return 'Spectacle remis en brouillon.'
    }
    if (!wasOpen && isOpen) {
      return 'Spectacle publié.'
    }
    return 'Spectacle mis à jour.'
  }

  protected confirmArchive(): void {
    const ev = this.event()
    if (!ev) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas désactiver ce spectacle.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Désactiver le spectacle',
        message: `Désactiver « ${ev.title} » ? Il disparaîtra de l’agenda.`,
        confirmLabel: 'Désactiver',
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
    const troupeSlug = this.routeTroupeSlug()
    if (!seasonId || !slug || !troupeSlug) {
      return
    }
    const r = await this.eventsApi.archiveEvent(seasonId, ev.id)
    if (r.ok) {
      this.snack.open('Spectacle désactivé.', 'OK', { duration: 4000 })
      await this.router.navigate(saisonWorkspacePath(troupeSlug, slug))
    } else {
      this.snack.open('Désactivation impossible.', 'OK', { duration: 6000 })
    }
  }

  protected confirmUnarchive(): void {
    const ev = this.event()
    if (!ev) {
      return
    }
    if (!this.canManageEvents()) {
      this.snack.open('Vous ne pouvez pas réactiver ce spectacle.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Réactiver le spectacle',
        message: `Réactiver « ${ev.title} » ? Il réapparaîtra dans l’agenda.`,
        confirmLabel: 'Réactiver',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runUnarchive(ev)
      }
    })
  }

  private async runUnarchive(ev: EventResponse): Promise<void> {
    const seasonId = this.seasonId()
    if (!seasonId) {
      return
    }
    const r = await this.eventsApi.unarchiveEvent(seasonId, ev.id)
    if (r.ok && r.data) {
      this.event.set(r.data)
      this.snack.open('Spectacle réactivé.', 'OK', { duration: 4000 })
    } else {
      this.snack.open('Réactivation impossible.', 'OK', { duration: 6000 })
    }
  }

  protected onEventInfosUpdated(updated: EventResponse): void {
    this.event.set(updated)
  }

  /** Patch event lifecycle fields from composition response — avoids redundant full reload (PERF-001). */
  protected syncCompositionFromEquipe(composition: CompositionResponse): void {
    const ev = this.event()
    if (!ev) {
      return
    }
    this.composition.set(composition)
    this.compositionLoaded.set(true)
    const lifecycleView = computeCompositionLifecycleView(
      composition,
      normalizeRoleSlots(ev.roleSlots),
      this.canManageComposition(),
    )
    this.event.set({
      ...ev,
      compositionLifecycle: lifecycleView.compositionLifecycle,
      compositionPublishedAt: composition.publishedAt ?? null,
      teamStatusBadge: lifecycleView.teamStatusBadge,
    })
  }

  private async reloadEvent(message: string): Promise<void> {
    const troupeSlug = this.routeTroupeSlug()
    const seasonSlug = this.slug()
    const eventSlug = this.event()?.slug ?? this.eventSlug()
    if (!troupeSlug || !seasonSlug || !eventSlug) {
      return
    }
    await this.loadEvent(troupeSlug, seasonSlug, eventSlug, { silent: true })
    this.snack.open(message, 'OK', { duration: 4000 })
  }

  private async loadEvent(
    troupeSlug: string,
    seasonSlug: string,
    routeSegment: string,
    options: { silent?: boolean } = {},
  ): Promise<void> {
    const requestId = ++this.loadRequestId
    if (!options.silent) {
      this.loading.set(true)
      this.event.set(null)
      this.composition.set(null)
      this.compositionLoaded.set(false)
      this.resetResolvedContext()
    }
    if (!troupeSlug || !seasonSlug || !routeSegment) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonInTroupe(
      troupeSlug,
      seasonSlug,
    )
    if (requestId !== this.loadRequestId) {
      return
    }
    if (resolved.kind === 'no-membership' || resolved.kind === 'error' || resolved.kind === 'not-found') {
      this.resetResolvedContext()
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'ambiguous') {
      this.resetResolvedContext()
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }

    this.seasonId.set(resolved.season.id)
    this.troupeId.set(resolved.troupe.id)
    this.contextTroupeName.set(resolved.troupe.name)
    this.contextTroupeSlug.set(resolved.troupe.slug)
    this.contextTroupeIsDemo.set(resolved.troupe.isDemo)
    this.contextTroupeLogoUrl.set(resolved.troupe.logoUrl ?? null)
    this.contextLeagueTitle.set(resolved.season.title)
    this.contextSeasonSlug.set(resolved.season.slug)
    const isUuidSegment = UUID_IN_PATH_REGEX.test(routeSegment)
    const [eventResult, permissionsResult, participantsResult] = await Promise.all([
      isUuidSegment
        ? this.eventsApi.getEvent(resolved.season.id, routeSegment)
        : this.eventsApi.getEventBySlug(resolved.season.id, routeSegment),
      this.organizerApi.mySeasonPermissions(resolved.season.id),
      this.participantApi.listSeasonParticipants(resolved.season.id),
    ])

    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!eventResult.ok || !eventResult.data) {
      this.resetResolvedContext()
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
      if (eventResult.status === 404 && resolved.season.slug) {
        await this.router.navigate(
          saisonWorkspacePath(resolved.troupe.slug, resolved.season.slug),
        )
      }
      return
    }
    const found = eventResult.data
    if (isUuidSegment && found.slug && found.slug !== routeSegment) {
      await this.router.navigate(
        saisonEventPath(resolved.troupe.slug, resolved.season.slug, found.slug),
        {
        queryParams: this.route.snapshot.queryParams,
        replaceUrl: true,
      })
      return
    }
    this.event.set(found)
    this.seasonPermissions.set(permissionsResult.ok && permissionsResult.data ? permissionsResult.data : null)

    void this.loadComposition(resolved.season.id, found.id)

    this.canSwitchSubject.set(
      permissionsResult.ok && permissionsResult.data
        ? canManageCompositionForEvent(permissionsResult.data, found.id)
        : false,
    )
    const userId = this.user()?.id
    const linked =
      participantsResult.ok && participantsResult.data && userId
        ? participantsResult.data.find((p) => p.userId === userId && p.status === 'ACTIVE') ?? null
        : null
    this.linkedParticipantId.set(linked?.id ?? null)
    this.linkedParticipantName.set(linked?.displayName ?? null)
    this.clampActiveTab()
  }

  private clampActiveTab(): void {
    if (this.activeTab() === 'activite' && !this.showActiviteTab()) {
      this.activeTab.set('infos')
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: eventDetailTabToQuery('infos') },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
    }
  }

  private resetResolvedContext(): void {
    this.contextTroupeName.set('')
    this.contextTroupeSlug.set('')
    this.contextTroupeIsDemo.set(false)
    this.contextTroupeLogoUrl.set(null)
    this.contextLeagueTitle.set('')
    this.contextSeasonSlug.set('')
  }

  private async loadComposition(seasonId: string, eventId: string): Promise<void> {
    const result = await this.compositionApi.getComposition(seasonId, eventId)
    if (seasonId !== this.seasonId() || eventId !== this.event()?.id) {
      return
    }
    if (result.ok && result.data) {
      this.composition.set(result.data)
    } else {
      this.composition.set(null)
    }
    this.compositionLoaded.set(true)
  }

  protected canManageEventOrganizersFor(eventId: string): boolean {
    const perms = this.seasonPermissions()
    if (!perms) return false
    if (perms.canManageEventOrganizers) return true
    return perms.eventOrganizerFor.includes(eventId)
  }

  protected canManageEventParticipantsFor(eventId: string): boolean {
    const perms = this.seasonPermissions()
    if (!perms) return false
    if (perms.canManageEventParticipants) return true
    return perms.eventParticipantAdminFor.includes(eventId)
  }

  protected canOpenEventParticipantsAdmin(eventId: string): boolean {
    return (
      this.canManageEventParticipantsFor(eventId) ||
      this.canManageSeasonParticipants() ||
      this.canManageEventOrganizersFor(eventId)
    )
  }
}
