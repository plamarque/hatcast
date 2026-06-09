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

import {
  AvailabilityApiService,
  type EventAvailabilitySummary,
} from '../../core/availability/availability-api.service'
import { ProductAnalyticsService } from '../../core/analytics/product-analytics.service'
import { resolveNotificationLinkTab } from '../../core/analytics/notification-link-tab'
import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import {
  type EventDetailTab,
  eventDetailTabToQuery,
  isEventDetailTabParamKnown,
  resolveEventDetailTab,
} from '../../core/events/event-detail-tabs'
import { EventApiService, type EventPageTab, type EventPageResponse, type EventResponse } from '../../core/events/event-api.service'
import {
  type MySeasonPermissions,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import { canManageComposition as canManageCompositionForEvent } from '../../core/permissions/organizer-permissions'
import { canShowDisposExplainability } from '../../core/composition/composition-explainability'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import type { TroupeCategory } from '../../core/troupes/troupe-api.service'
import { type ParticipantSelector } from '../../core/participants/participant-api.service'
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
import {
  computeCompositionLifecycleView,
  computeRawCompositionLifecycle,
} from '../../core/composition/composition-lifecycle'
import { canValidateComposition as resolveCanValidateComposition } from '../../core/composition/composition-equipe-actions'
import { resolveCompositionEquipeStatus, resolveCompositionEquipeStatusFromEvent } from '../../core/composition/composition-equipe-status'
import { normalizeRoleSlots } from '../../core/events/event-types'
import { CompositionEquipeStatusHeader } from '../../shared/composition/composition-equipe-status-header'
import { EventEquipeTab } from './event-equipe-tab'
import { EventInfosTab } from './event-infos-tab'
import { isEventDraft } from '../../core/events/event-draft'
import {
  openAvailabilityNudgeDialog,
  openEventAnnounceDialog,
} from '../../shared/share-announce/share-announce-open'

function findLinkedSeasonParticipant(
  selectors: ParticipantSelector[],
  user: UserSummary,
): ParticipantSelector | null {
  const byUserId = selectors.find((p) => p.userId === user.id)
  if (byUserId) {
    return byUserId
  }
  const name = user.displayName?.trim()
  if (!name) {
    return null
  }
  return (
    selectors.find(
      (p) => p.displayName.localeCompare(name, undefined, { sensitivity: 'accent' }) === 0,
    ) ?? null
  )
}

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
  private readonly analytics = inject(ProductAnalyticsService)
  private readonly auth = inject(AuthApiService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly eventsApi = inject(EventApiService)
  private readonly compositionApi = inject(CompositionApiService)
  private readonly availabilityApi = inject(AvailabilityApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private querySubscription = Subscription.EMPTY
  private loadRequestId = 0
  private compositionLoadInFlight = false
  private lastNotificationLinkCaptureKey = ''
  private tabBootstrapLoaded = signal<Record<EventPageTab, boolean>>({
    infos: false,
    dispos: false,
    equipe: false,
  })
  protected readonly isDisposBootstrapReady = computed(() => this.tabBootstrapLoaded().dispos)

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
  protected readonly contextTroupeLogoUrl = signal<string | null>(null)
  protected readonly contextLeagueTitle = signal('')
  protected readonly contextSeasonSlug = signal('')
  protected readonly composition = signal<CompositionResponse | null>(null)
  protected readonly compositionLoaded = signal(false)
  protected readonly compositionInteractionBlocked = signal(false)
  protected readonly disposSummary = signal<EventAvailabilitySummary | null>(null)
  protected readonly infosOrganizers = signal<OrganizerResponse[] | null>(null)
  protected readonly infosCategories = signal<TroupeCategory[] | null>(null)
  protected readonly disposBootstrapSummary = signal<EventAvailabilitySummary | null>(null)

  protected readonly canManageEvents = computed(
    () => this.seasonPermissions()?.canManageEvents === true,
  )
  protected readonly canManageTroupe = computed(
    () => this.seasonPermissions()?.canManageMembers === true,
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
    if (this.canRelanceDispos()) {
      items.push({
        label: 'Relance dispos',
        icon: 'notifications_active',
        action: () => this.openRelanceDispos(),
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
  protected readonly disposExplainabilityEnabled = computed(() => {
    const ev = this.event()
    if (!ev) {
      return false
    }
    return canShowDisposExplainability(ev, this.canManageComposition())
  })
  protected readonly canAnnouncePublishedEvent = computed(() => {
    const ev = this.event()
    if (!ev || ev.archived || isEventDraft(ev)) {
      return false
    }
    return this.canManageComposition()
  })
  protected readonly canRelanceDispos = computed(() => {
    if (!this.canManageComposition()) {
      return false
    }
    const ev = this.event()
    if (!ev || isEventDraft(ev) || ev.archived || ev.availabilityOpenedAt == null) {
      return false
    }
    const summary = this.disposSummary()
    if (!summary) {
      return false
    }
    return summary.participants.some((p) => p.status === 'unknown')
  })
  protected readonly canValidateComposition = computed(() =>
    resolveCanValidateComposition({
      canManageComposition: this.canManageComposition(),
      composition: this.composition(),
      compositionInteractionBlocked: this.compositionInteractionBlocked(),
    }),
  )
  protected readonly equipeStatus = computed(() => {
    const ev = this.event()
    if (!ev) {
      return null
    }
    const suppressValidateCta = this.canValidateComposition()
    if (this.compositionLoaded() && this.composition()) {
      return resolveCompositionEquipeStatus({
        composition: this.composition(),
        canManageComposition: this.canManageComposition(),
        roleSlots: normalizeRoleSlots(ev.roleSlots),
        suppressValidateCtaInGuideline: suppressValidateCta,
      })
    }
    return resolveCompositionEquipeStatusFromEvent(
      ev,
      this.canManageComposition(),
      suppressValidateCta,
    )
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
    this.maybeCaptureNotificationLinkOpened(params)

    const tabParam = params.get('tab')
    if (tabParam && !isEventDetailTabParamKnown(tabParam)) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: eventDetailTabToQuery(tab) },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
    }
    this.ensureTabBootstrapLoaded()
  }

  protected onCompositionInteractionBlockedChange(blocked: boolean): void {
    this.compositionInteractionBlocked.set(blocked)
  }

  protected onTabChange(index: number): void {
    const tab = this.visibleTabs()[index] ?? 'infos'
    if (tab !== 'equipe') {
      this.compositionInteractionBlocked.set(false)
    }
    this.activeTab.set(tab)
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: eventDetailTabToQuery(tab) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
    this.ensureTabBootstrapLoaded()
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
    openEventAnnounceDialog(this.dialog, {
      seasonId,
      seasonSlug,
      troupeSlug,
      event: ev,
    })
  }

  protected openRelanceDispos(): void {
    const ev = this.event()
    const seasonId = this.seasonId()
    const seasonSlug = this.slug()
    const troupeSlug = this.contextTroupeSlug() || this.routeTroupeSlug()
    if (!ev || !seasonId || !seasonSlug || !troupeSlug) {
      return
    }
    if (!this.canRelanceDispos()) {
      return
    }
    openAvailabilityNudgeDialog(this.dialog, {
      seasonId,
      seasonSlug,
      troupeSlug,
      event: ev,
    })
  }

  protected onDisposSummaryChanged(summary: EventAvailabilitySummary): void {
    this.disposSummary.set(summary)
  }

  private applyEventDetailUpdate(before: EventResponse, after: EventResponse): void {
    this.event.set(after)
    this.refreshDisposSummaryIfLoaded(after)
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
      this.refreshDisposSummaryIfLoaded(r.data)
      this.snack.open('Spectacle réactivé.', 'OK', { duration: 4000 })
    } else {
      this.snack.open('Réactivation impossible.', 'OK', { duration: 6000 })
    }
  }

  protected onEventInfosUpdated(updated: EventResponse): void {
    this.event.set(updated)
    this.refreshDisposSummaryIfLoaded(updated)
  }

  private maybeCaptureNotificationLinkOpened(params: ParamMap): void {
    const linkTab = resolveNotificationLinkTab(params)
    if (!linkTab) {
      return
    }
    const ev = this.event()
    const seasonId = this.seasonId()
    const troupeId = this.troupeId()
    if (!ev || !seasonId || !troupeId) {
      return
    }
    const captureKey = `${ev.id}:${linkTab}`
    if (this.lastNotificationLinkCaptureKey === captureKey) {
      return
    }
    this.lastNotificationLinkCaptureKey = captureKey
    this.analytics.captureNotificationLinkOpened(
      this.analytics.eventContext(ev.id, seasonId, troupeId),
      { link_tab: linkTab },
    )
  }

  /** Patch event lifecycle fields from composition response — avoids redundant full reload (PERF-001). */
  protected syncCompositionFromEquipe(composition: CompositionResponse): void {
    const ev = this.event()
    if (!ev) {
      return
    }
    const prevComposition = this.composition()
    const roleSlots = normalizeRoleSlots(ev.roleSlots)
    const prevLifecycle = computeRawCompositionLifecycle(prevComposition, roleSlots)
    this.composition.set(composition)
    this.compositionLoaded.set(true)
    const nextLifecycle = computeRawCompositionLifecycle(composition, roleSlots)
    if (nextLifecycle === 'complete' && prevLifecycle !== 'complete') {
      this.analytics.captureCompositionAllConfirmationsReceived(
        this.analytics.eventContext(ev.id, this.seasonId(), this.troupeId()),
        {
          validated_at: composition.validatedAt ?? null,
          completed_at: new Date().toISOString(),
        },
      )
    }
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
      this.compositionLoadInFlight = false
      this.disposSummary.set(null)
      this.disposBootstrapSummary.set(null)
      this.infosOrganizers.set(null)
      this.infosCategories.set(null)
      this.tabBootstrapLoaded.set({ infos: false, dispos: false, equipe: false })
      this.resetResolvedContext()
      this.lastNotificationLinkCaptureKey = ''
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
    this.contextTroupeLogoUrl.set(resolved.troupe.logoUrl ?? null)
    this.contextLeagueTitle.set(resolved.season.title)
    this.contextSeasonSlug.set(resolved.season.slug)
    const isUuidSegment = UUID_IN_PATH_REGEX.test(routeSegment)
    const pageTab = this.eventDetailTabToPageTab(this.activeTab())
    const pageResult = await this.eventsApi.getEventPage(resolved.season.id, routeSegment, {
      tab: pageTab,
      bySlug: !isUuidSegment,
    })

    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!pageResult.ok || !pageResult.data) {
      this.resetResolvedContext()
      if (pageResult.status === 403) {
        this.snack.open('Accès refusé à ce spectacle.', 'Mon agenda', { duration: 6000 })
        await this.router.navigate(['/agenda'])
        return
      }
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
      if (pageResult.status === 404 && resolved.season.slug) {
        await this.router.navigate(
          saisonWorkspacePath(resolved.troupe.slug, resolved.season.slug),
        )
      }
      return
    }
    this.applyEventPageResponse(pageResult.data, pageTab, { markTabLoaded: pageTab })
    const found = pageResult.data.event
    if (isUuidSegment && found.slug && found.slug !== routeSegment) {
      await this.router.navigate(
        saisonEventPath(resolved.troupe.slug, resolved.season.slug, found.slug),
        {
        queryParams: this.route.snapshot.queryParams,
        replaceUrl: true,
      })
      return
    }
    this.maybeCaptureNotificationLinkOpened(this.route.snapshot.queryParamMap)
    this.clampActiveTab()
    this.ensureTabBootstrapLoaded()
  }

  private eventDetailTabToPageTab(tab: EventDetailTab): EventPageTab {
    if (tab === 'dispos') {
      return 'dispos'
    }
    if (tab === 'equipe') {
      return 'equipe'
    }
    return 'infos'
  }

  private applyEventPageResponse(
    page: EventPageResponse,
    tab: EventPageTab,
    options: { markTabLoaded?: EventPageTab } = {},
  ): void {
    const found = page.event
    this.event.set(found)
    this.seasonPermissions.set(page.permissions)
    this.canSwitchSubject.set(canManageCompositionForEvent(page.permissions, found.id))
    const user = this.user()
    const linked =
      page.participantSelectors && user
        ? findLinkedSeasonParticipant(page.participantSelectors, user)
        : null
    this.linkedParticipantId.set(linked?.id ?? null)
    this.linkedParticipantName.set(linked?.displayName ?? null)

    if (tab === 'infos') {
      if (page.organizers != null) {
        this.infosOrganizers.set(page.organizers)
      }
      if (page.categories != null) {
        this.infosCategories.set(page.categories)
      }
    }
    if (tab === 'dispos' && page.availabilitySummary != null) {
      this.disposSummary.set(page.availabilitySummary)
      this.disposBootstrapSummary.set(page.availabilitySummary)
    }
    if (tab === 'equipe' && page.composition != null) {
      this.composition.set(page.composition)
      this.compositionLoaded.set(true)
      this.compositionLoadInFlight = false
    }

    const markTab = options.markTabLoaded ?? tab
    this.tabBootstrapLoaded.update((loaded) => ({ ...loaded, [markTab]: true }))
  }

  private ensureTabBootstrapLoaded(): void {
    const tab = this.activeTab()
    const pageTab = this.eventDetailTabToPageTab(tab)
    if (this.tabBootstrapLoaded()[pageTab]) {
      this.ensureCompositionLoaded()
      return
    }
    const ev = this.event()
    const seasonId = this.seasonId()
    const routeSegment = this.event()?.slug ?? this.eventSlug()
    const troupeSlug = this.routeTroupeSlug()
    const seasonSlug = this.slug()
    if (!ev || !seasonId || !routeSegment || !troupeSlug || !seasonSlug) {
      this.ensureCompositionLoaded()
      return
    }
    void this.loadTabBootstrap(troupeSlug, seasonSlug, routeSegment, pageTab)
  }

  private async loadTabBootstrap(
    troupeSlug: string,
    seasonSlug: string,
    routeSegment: string,
    tab: EventPageTab,
  ): Promise<void> {
    const requestId = this.loadRequestId
    const seasonId = this.seasonId()
    if (!seasonId) {
      return
    }
    const isUuidSegment = UUID_IN_PATH_REGEX.test(routeSegment)
    const pageResult = await this.eventsApi.getEventPage(seasonId, routeSegment, {
      tab,
      bySlug: !isUuidSegment,
    })
    if (requestId !== this.loadRequestId) {
      return
    }
    if (!pageResult.ok || !pageResult.data) {
      if (pageResult.status === 403) {
        this.snack.open('Accès refusé à ce spectacle.', 'Mon agenda', { duration: 6000 })
        await this.router.navigate(['/agenda'])
      }
      this.tabBootstrapLoaded.update((loaded) => ({ ...loaded, [tab]: true }))
      return
    }
    this.applyEventPageResponse(pageResult.data, tab, { markTabLoaded: tab })
    this.ensureCompositionLoaded()
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
    this.contextTroupeLogoUrl.set(null)
    this.contextLeagueTitle.set('')
    this.contextSeasonSlug.set('')
  }

  private refreshDisposSummaryIfLoaded(event: EventResponse): void {
    if (this.disposSummary() == null) {
      return
    }
    void this.loadDisposSummary(event)
  }

  private ensureCompositionLoaded(): void {
    if (this.activeTab() !== 'equipe') {
      return
    }
    const ev = this.event()
    const seasonId = this.seasonId()
    if (!ev || !seasonId) {
      return
    }
    if (this.compositionLoaded()) {
      if (this.composition() != null) {
        return
      }
      this.compositionLoaded.set(false)
    }
    if (this.compositionLoadInFlight) {
      return
    }
    void this.loadComposition(seasonId, ev.id)
  }

  private async loadDisposSummary(event: EventResponse): Promise<void> {
    const seasonId = this.seasonId()
    const perms = this.seasonPermissions()
    if (!seasonId || !perms || !canManageCompositionForEvent(perms, event.id)) {
      this.disposSummary.set(null)
      return
    }
    if (isEventDraft(event) || event.archived || event.availabilityOpenedAt == null) {
      this.disposSummary.set(null)
      return
    }
    const requestId = this.loadRequestId
    const result = await this.availabilityApi.getEventAvailabilitySummary(seasonId, event.id, false)
    if (requestId !== this.loadRequestId) {
      return
    }
    this.disposSummary.set(result.ok && result.data ? result.data : null)
  }

  private async loadComposition(seasonId: string, eventId: string): Promise<void> {
    if (this.compositionLoadInFlight) {
      return
    }
    this.compositionLoadInFlight = true
    const requestId = this.loadRequestId
    try {
      const result = await this.compositionApi.getComposition(seasonId, eventId)
      if (requestId !== this.loadRequestId) {
        return
      }
      if (seasonId !== this.seasonId() || eventId !== this.event()?.id) {
        return
      }
      if (result.ok && result.data) {
        this.composition.set(result.data)
      } else {
        this.composition.set(null)
      }
      this.compositionLoaded.set(true)
    } finally {
      if (requestId === this.loadRequestId) {
        this.compositionLoadInFlight = false
      }
    }
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
