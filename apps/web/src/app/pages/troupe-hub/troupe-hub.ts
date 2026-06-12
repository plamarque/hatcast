import { BreakpointObserver } from '@angular/cdk/layout'
import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import type { MemberGender } from '../../core/account/member-gender'
import { AvailabilityApiService } from '../../core/availability/availability-api.service'
import type { AvailabilityStatus } from '../../core/availability/availability-status'
import { CompositionApiService } from '../../core/composition/composition-api.service'
import { normalizeRoleSlots } from '../../core/events/event-types'
import { openAgendaAvailabilityDialog } from '../../shared/availability/open-agenda-availability-dialog'
import { openAgendaParticipationDialog } from '../../shared/composition/open-agenda-participation-dialog'
import { DEMO_TROUPE_SLUG } from '../../core/troupes/demo-troupe.constants'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  getLastVisitedSeasonSlugForTroupe,
  rememberLastVisitedSeasonSlug,
} from '../../core/navigation/last-visited-season-storage'
import { rememberLastVisitedTroupeSlug } from '../../core/navigation/last-visited-troupe-storage'
import {
  saisonEventPath,
  saisonWorkspacePath,
  troupeAdminAuditPath,
  troupeAdminMembresPath,
  troupeAdminSettingsPath,
  troupesListPath,
} from '../../core/navigation/troupe-routes'
import {
  type SeasonResponse,
  SeasonApiService,
} from '../../core/seasons/season-api.service'
import {
  SeasonStatisticsApiService,
  type ParticipantStatisticsRow,
} from '../../core/seasons/season-statistics-api.service'
import { type EventResponse } from '../../core/events/event-api.service'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { type TroupeListItem, TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import { SeasonCard } from '../../shared/season-card/season-card'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import {
  SeasonFormDialog,
  type SeasonFormDialogData,
} from '../seasons-list/season-form-dialog'
import {
  groupEventsByMonth,
  type EventWithDateParts,
} from '../season-home/season-events.utils'
import { SeasonAgenda } from '../season-home/season-agenda'
import {
  applyAvailabilityUpdateToAgendaEvent,
  applyParticipationUpdateToAgendaEvent,
  participantFocusFromEvent,
} from '../season-home/season-participant-focus'
import { TroupeEditDialog, type TroupeEditDialogData } from './troupe-edit-dialog'
import {
  TroupeHubSeasonSwitcherSheet,
  type TroupeHubSeasonSwitcherSheetData,
} from './troupe-hub-season-switcher-sheet'

const SEASONS_PAGE_SIZE = 50
const MOBILE_BREAKPOINT = '(max-width: 480px)'
const DESKTOP_DASHBOARD_BREAKPOINT = '(min-width: 840px)'
/** Mobile : bandeau compact (story 17.42). */
export const PARTICIPANT_PREVIEW_CAP_MOBILE = 12
/** Desktop 2 colonnes : jusqu’à 6 lignes × 6 avatars (colonne Participant·es). */
export const PARTICIPANT_DESKTOP_MAX_LINES = 6
export const PARTICIPANT_DESKTOP_AVATARS_PER_ROW = 6
const TEASER_EVENT_CAP = 3

/** Exported for unit tests. */
export function participantPreviewCap(isDesktopDashboard: boolean): number {
  return isDesktopDashboard
    ? PARTICIPANT_DESKTOP_MAX_LINES * PARTICIPANT_DESKTOP_AVATARS_PER_ROW
    : PARTICIPANT_PREVIEW_CAP_MOBILE
}

/** Exported for unit tests (story 17.42 — default season resolution). */
export function pickDefaultSeason(
  activeSeasons: SeasonResponse[],
  troupeId: string,
): SeasonResponse | null {
  if (activeSeasons.length === 0) {
    return null
  }
  const lastSlug = getLastVisitedSeasonSlugForTroupe(troupeId)
  if (lastSlug) {
    const remembered = activeSeasons.find((season) => season.slug === lastSlug)
    if (remembered) {
      return remembered
    }
  }
  const sorted = [...activeSeasons].sort(compareSeasonStartDateDesc)
  return sorted[0] ?? null
}

function compareSeasonStartDateDesc(a: SeasonResponse, b: SeasonResponse): number {
  if (!a.startDate && !b.startDate) {
    return 0
  }
  if (!a.startDate) {
    return 1
  }
  if (!b.startDate) {
    return -1
  }
  return b.startDate.localeCompare(a.startDate)
}

@Component({
  selector: 'app-troupe-hub',
  imports: [
    MatBottomSheetModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    ScopeAdminMenu,
    SeasonAgenda,
    SeasonCard,
    UserAvatarComponent,
  ],
  templateUrl: './troupe-hub.html',
  styleUrl: './troupe-hub.scss',
})
export class TroupeHub implements OnInit, OnDestroy {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly seasonApi = inject(SeasonApiService)
  private readonly statsApi = inject(SeasonStatisticsApiService)
  private readonly memberProfile = inject(MemberProfileService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly bottomSheet = inject(MatBottomSheet)
  private readonly breakpoint = inject(BreakpointObserver)
  private readonly availabilityApi = inject(AvailabilityApiService)
  private readonly compositionApi = inject(CompositionApiService)
  private readonly mePreferencesApi = inject(MePreferencesApiService)

  private slugSubscription?: Subscription
  private readonly dialogSubscriptions = new Subscription()
  private slugRequestId = 0
  private seasonDashboardRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly isMobileLayout = toSignal(
    this.breakpoint.observe(MOBILE_BREAKPOINT).pipe(map((state) => state.matches)),
    { initialValue: this.breakpoint.isMatched(MOBILE_BREAKPOINT) },
  )

  protected readonly isDesktopDashboardLayout = toSignal(
    this.breakpoint.observe(DESKTOP_DASHBOARD_BREAKPOINT).pipe(map((state) => state.matches)),
    { initialValue: this.breakpoint.isMatched(DESKTOP_DASHBOARD_BREAKPOINT) },
  )

  protected readonly sessionUser = signal<UserSummary | null>(null)
  protected readonly viewerGender = signal<MemberGender | undefined>(undefined)
  protected readonly myDisplayName = computed(() =>
    this.troupeContext.currentUserDisplayLabel(this.sessionUser()),
  )

  protected readonly loadingSession = signal(true)
  protected readonly loadingSeasons = signal(false)
  protected readonly seasonsLoadError = signal(false)
  protected readonly troupe = signal<TroupeListItem | null>(null)
  protected readonly notFound = signal(false)
  protected readonly accessDenied = signal(false)
  protected readonly accessCheckError = signal(false)
  protected readonly isDemoTroupe = computed(
    () => this.slug() === DEMO_TROUPE_SLUG || this.troupe()?.isDemo === true,
  )
  protected readonly showArchived = signal(false)
  protected readonly allSeasons = signal<SeasonResponse[]>([])
  protected readonly platformAdmin = signal(false)
  protected readonly hubLogoLoadFailed = signal(false)
  protected readonly selectedSeasonId = signal<string | null>(null)
  protected readonly loadingDashboard = signal(false)
  protected readonly statsLoadError = signal(false)
  protected readonly workspaceLoadError = signal(false)
  protected readonly statsRows = signal<ParticipantStatisticsRow[]>([])
  protected readonly confirmedCompositionsCount = signal(0)
  protected readonly teaserEvents = signal<EventWithDateParts<EventResponse>[]>([])
  protected readonly categoryLabels = signal<Record<string, string>>({})

  protected readonly isTroupeAdmin = computed(
    () => this.troupe()?.membership.baselineRole === 'TROUPE_ADMIN',
  )

  protected readonly canManageTroupe = computed(
    () => this.isTroupeAdmin() || this.platformAdmin(),
  )

  protected readonly isGuestViewer = computed(
    () => this.troupe()?.membership.baselineRole === 'EXTERNE',
  )

  protected readonly activeSeasons = computed(() =>
    this.allSeasons().filter((s) => !s.archived),
  )

  protected readonly archivedSeasons = computed(() =>
    this.allSeasons().filter((s) => s.archived),
  )

  protected readonly selectedSeason = computed(() => {
    const id = this.selectedSeasonId()
    if (!id) {
      return null
    }
    return this.allSeasons().find((season) => season.id === id) ?? null
  })

  protected readonly showSeasonSwitcher = computed(() => this.activeSeasons().length > 1)

  protected readonly participantPreviewCap = computed(() =>
    participantPreviewCap(this.isDesktopDashboardLayout()),
  )

  protected readonly participantPreview = computed(() =>
    this.statsRows().slice(0, this.participantPreviewCap()),
  )

  protected readonly participantOverflowCount = computed(() =>
    Math.max(0, this.statsRows().length - this.participantPreviewCap()),
  )

  protected readonly teaserMonthGroups = computed(() =>
    groupEventsByMonth(this.teaserEvents().slice(0, TEASER_EVENT_CAP)),
  )

  protected readonly showMultiTroupeFooter = computed(
    () => this.troupeContext.activeTroupes().length >= 2,
  )

  protected readonly canEditAvailability = computed(() => {
    const troupe = this.troupe()
    const season = this.selectedSeason()
    if (!troupe || !season) {
      return false
    }
    return (
      troupe.membership.status === 'ACTIVE' && troupe.id === season.troupeId
    )
  })

  protected readonly canViewAuditTroupe = computed(
    () => this.canManageTroupe() || this.platformAdmin(),
  )

  protected readonly troupeAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    if (!this.canManageTroupe()) {
      return []
    }
    const slug = this.slug()
    if (!slug) {
      return []
    }
    const items: ScopeAdminMenuItem[] = [
      {
        label: 'Modifier',
        icon: 'edit',
        action: () => this.openEditTroupe(),
      },
      {
        label: 'Nouvelle saison',
        icon: 'add',
        action: () => this.openCreateSeason(),
      },
      {
        label: 'Membres',
        icon: 'groups',
        routerLink: troupeAdminMembresPath(slug),
      },
      {
        label: 'Paramètres',
        icon: 'settings',
        routerLink: troupeAdminSettingsPath(slug),
        queryParams: { tab: 'categories' },
      },
    ]
    if (this.canViewAuditTroupe()) {
      items.push({
        label: "Journal d'audit",
        icon: 'history',
        routerLink: troupeAdminAuditPath(slug),
      })
    }
    return items
  })

  protected readonly troupesListLink = troupesListPath()

  constructor() {
    effect(() => {
      this.troupe()?.logoUrl
      this.hubLogoLoadFailed.set(false)
    })
  }

  protected showHubLogo(troupe: TroupeListItem): boolean {
    return !!troupe.logoUrl && !this.hubLogoLoadFailed()
  }

  protected onHubLogoError(): void {
    this.hubLogoLoadFailed.set(true)
  }

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.loadingSession.set(false)
    this.platformAdmin.set(session.data.platformAdmin === true)
    this.sessionUser.set(session.data.user)
    void this.loadViewerGender()

    const loaded = await this.troupeContext.load()
    if (!loaded) {
      this.notFound.set(true)
      return
    }

    this.slugSubscription = this.route.paramMap
      .pipe(
        map((p) => p.get('slug') ?? ''),
        distinctUntilChanged(),
      )
      .subscribe((slug) => {
        void this.applySlug(slug)
      })
  }

  ngOnDestroy(): void {
    this.slugSubscription?.unsubscribe()
    this.dialogSubscriptions.unsubscribe()
  }

  private async applySlug(slug: string): Promise<void> {
    const requestId = ++this.slugRequestId
    this.notFound.set(false)
    this.accessDenied.set(false)
    this.accessCheckError.set(false)
    this.showArchived.set(false)
    this.allSeasons.set([])
    this.selectedSeasonId.set(null)
    this.loadingSeasons.set(false)
    this.resetDashboardState()
    if (!slug) {
      this.troupe.set(null)
      this.allSeasons.set([])
      this.notFound.set(true)
      return
    }

    const match = await this.troupeContext.resolveTroupeBySlug(slug)
    if (!this.isCurrentSlugRequest(requestId)) {
      return
    }
    if (match) {
      this.troupeContext.selectTroupe(match.id)
      this.troupe.set(match)
      rememberLastVisitedTroupeSlug(match.slug)
      await this.loadSeasons(match.id, requestId)
      return
    }

    const publicResult = await this.troupeApi.listPublicTroupes()
    if (!this.isCurrentSlugRequest(requestId)) {
      return
    }
    if (!publicResult.ok) {
      this.troupe.set(null)
      this.allSeasons.set([])
      this.accessCheckError.set(true)
      return
    }
    const isPublicSlug =
      (publicResult.data ?? []).some((item) => item.slug === slug)
    if (isPublicSlug) {
      this.troupe.set(null)
      this.allSeasons.set([])
      this.accessDenied.set(true)
      return
    }

    this.troupe.set(null)
    this.allSeasons.set([])
    this.notFound.set(true)
  }

  private isCurrentSlugRequest(requestId: number): boolean {
    return requestId === this.slugRequestId
  }

  protected toggleArchived(): void {
    this.showArchived.update((value) => !value)
  }

  protected archivedToggleLabel(): string {
    const count = this.archivedSeasons().length
    return this.showArchived()
      ? 'Masquer les saisons archivées'
      : `Saisons archivées (${count})`
  }

  protected openSeasonSwitcher(): void {
    const seasons = this.activeSeasons()
    const selected = this.selectedSeason()
    if (seasons.length <= 1) {
      return
    }
    if (this.breakpoint.isMatched(MOBILE_BREAKPOINT)) {
      const ref = this.bottomSheet.open<
        TroupeHubSeasonSwitcherSheet,
        TroupeHubSeasonSwitcherSheetData,
        SeasonResponse | undefined
      >(TroupeHubSeasonSwitcherSheet, {
        data: {
          seasons,
          selectedSeasonId: selected?.id ?? null,
        },
      })
      this.dialogSubscriptions.add(
        ref.afterDismissed().subscribe((picked) => {
          if (picked) {
            this.selectSeason(picked)
          }
        }),
      )
      return
    }
  }

  protected selectSeason(season: SeasonResponse): void {
    if (season.id === this.selectedSeasonId()) {
      return
    }
    const troupe = this.troupe()
    if (troupe) {
      rememberLastVisitedSeasonSlug(season.slug, troupe.id)
    }
    this.clearDashboardContent()
    this.selectedSeasonId.set(season.id)
    void this.loadSeasonDashboard(season.id, this.slugRequestId)
  }

  protected seasonWorkspaceLink(season: SeasonResponse): string[] {
    const troupeSlug = this.slug()
    return saisonWorkspacePath(troupeSlug, season.slug)
  }

  protected openTeaserEvent(eventSlug: string): void {
    const troupeSlug = this.slug()
    const season = this.selectedSeason()
    if (!troupeSlug || !season) {
      return
    }
    void this.router.navigate(saisonEventPath(troupeSlug, season.slug, eventSlug))
  }

  protected async openTeaserAvailability(payload: {
    eventId: string
    status: AvailabilityStatus
  }): Promise<void> {
    const season = this.selectedSeason()
    const troupe = this.troupe()
    const ev = this.teaserEvents().find((event) => event.id === payload.eventId)
    if (!season || !troupe || !ev || !this.canEditAvailability()) {
      return
    }
    const result = await openAgendaAvailabilityDialog(this.dialog, this.availabilityApi, {
      seasonId: season.id,
      eventId: ev.id,
      eventTitle: ev.title,
      eventStartsAt: ev.startsAt,
      subjectDisplayName: this.myDisplayName(),
      troupeId: troupe.id,
      roleSlots: normalizeRoleSlots(ev.roleSlots),
      fallbackStatus: payload.status,
      availabilityOpenedAt: ev.availabilityOpenedAt ?? null,
    })
    if (!result) {
      return
    }
    this.teaserEvents.update((events) =>
      events.map((event) =>
        event.id === ev.id ? applyAvailabilityUpdateToAgendaEvent(event, result.status) : event,
      ),
    )
  }

  protected async openTeaserParticipation(payload: { eventId: string }): Promise<void> {
    const season = this.selectedSeason()
    const ev = this.teaserEvents().find((event) => event.id === payload.eventId)
    if (!season || !ev) {
      return
    }
    const focus = participantFocusFromEvent(ev)
    if (!focus.inTeam || !focus.compositionRoleKey) {
      return
    }
    const result = await openAgendaParticipationDialog(
      this.dialog,
      this.compositionApi,
      this.snack,
      {
        seasonId: season.id,
        eventId: ev.id,
        eventTitle: ev.title,
        eventStartsAt: ev.startsAt,
        roleKey: focus.compositionRoleKey,
        currentStatus: focus.slotParticipationStatus ?? 'pending',
        viewerGender: this.viewerGender(),
      },
    )
    if (!result) {
      return
    }
    this.teaserEvents.update((events) =>
      events.map((event) =>
        event.id === ev.id
          ? applyParticipationUpdateToAgendaEvent(event, result.status)
          : event,
      ),
    )
  }

  protected openParticipantPreview(row: ParticipantStatisticsRow): void {
    if (!row.userSlug) {
      return
    }
    const troupe = this.troupe()
    const season = this.selectedSeason()
    this.memberProfile.navigateToMemberGlance({
      userSlug: row.userSlug,
      troupeId: troupe?.id,
      seasonId: season?.id,
    })
  }

  protected openEditTroupe(): void {
    const t = this.troupe()
    if (!t || !this.canManageTroupe()) {
      return
    }
    const ref = this.dialog.open<TroupeEditDialog, TroupeEditDialogData, TroupeListItem | undefined>(
      TroupeEditDialog,
      {
        data: { troupe: t },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    this.dialogSubscriptions.add(
      ref.afterClosed().subscribe((updated) => {
        if (!updated) {
          return
        }
        this.troupe.set(updated)
        this.troupeContext.patchTroupeProfile(t.id, {
          name: updated.name,
          logoUrl: updated.logoUrl,
          description: updated.description,
        })
      }),
    )
  }

  protected openCreateSeason(): void {
    const t = this.troupe()
    if (!t || !this.canManageTroupe()) {
      this.snack.open('Vous ne pouvez pas créer de saison dans cette troupe.', 'OK', {
        duration: 5000,
      })
      return
    }
    const ref = this.dialog.open<SeasonFormDialog, SeasonFormDialogData, string | boolean>(
      SeasonFormDialog,
      {
        data: { mode: 'create', troupeId: t.id },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    this.dialogSubscriptions.add(
      ref.afterClosed().subscribe((result) => {
        if (typeof result === 'string' && result.trim().length > 0) {
          void this.router.navigate(saisonWorkspacePath(t.slug, result))
        } else if (result === true) {
          const current = this.troupe()
          if (current?.id === t.id && this.slug() === t.slug) {
            void this.loadSeasons(t.id, this.slugRequestId)
          }
          this.snack.open('Saison créée.', 'OK', { duration: 4000 })
        }
      }),
    )
  }

  private async loadSeasons(troupeId: string, slugRequestId?: number): Promise<void> {
    this.loadingSeasons.set(true)
    this.seasonsLoadError.set(false)
    const r = await this.seasonApi.listSeasons(troupeId, 0, SEASONS_PAGE_SIZE)
    if (slugRequestId !== undefined && !this.isCurrentSlugRequest(slugRequestId)) {
      return
    }
    this.loadingSeasons.set(false)
    if (!r.ok || !r.data) {
      this.seasonsLoadError.set(true)
      return
    }
    this.allSeasons.set(r.data.content)
    const picked = pickDefaultSeason(this.activeSeasons(), troupeId)
    if (picked) {
      this.selectedSeasonId.set(picked.id)
      await this.loadSeasonDashboard(picked.id, slugRequestId ?? this.slugRequestId)
    } else {
      this.selectedSeasonId.set(null)
      this.resetDashboardState()
    }
  }

  private resetDashboardState(): void {
    this.loadingDashboard.set(false)
    this.clearDashboardContent()
  }

  private clearDashboardContent(): void {
    this.statsLoadError.set(false)
    this.workspaceLoadError.set(false)
    this.statsRows.set([])
    this.confirmedCompositionsCount.set(0)
    this.teaserEvents.set([])
    this.categoryLabels.set({})
  }

  private async loadViewerGender(): Promise<void> {
    const prefs = await this.mePreferencesApi.getPreferences()
    if (prefs.ok && prefs.data) {
      this.viewerGender.set(prefs.data.gender)
    }
  }

  private async loadSeasonDashboard(
    seasonId: string,
    parentRequestId: number,
  ): Promise<void> {
    const requestId = ++this.seasonDashboardRequestId
    this.loadingDashboard.set(true)
    this.statsLoadError.set(false)
    this.workspaceLoadError.set(false)

    const [statsResult, workspaceResult] = await Promise.all([
      this.statsApi.loadStatistics(seasonId),
      this.seasonApi.getSeasonWorkspace(seasonId, { eventPage: 0, eventSize: TEASER_EVENT_CAP }),
    ])

    if (requestId !== this.seasonDashboardRequestId) {
      return
    }
    if (
      !this.isCurrentSlugRequest(parentRequestId) ||
      this.selectedSeasonId() !== seasonId
    ) {
      this.loadingDashboard.set(false)
      return
    }

    this.loadingDashboard.set(false)

    if (statsResult.ok && statsResult.data) {
      this.statsRows.set(statsResult.data.rows)
      this.confirmedCompositionsCount.set(statsResult.data.confirmedCompositionsCount ?? 0)
    } else {
      this.statsLoadError.set(true)
      this.statsRows.set([])
      this.confirmedCompositionsCount.set(0)
    }

    if (workspaceResult.ok && workspaceResult.data) {
      const labels: Record<string, string> = {}
      for (const category of workspaceResult.data.categories) {
        labels[category.slug] = category.label
      }
      this.categoryLabels.set(labels)
      const upcoming = workspaceResult.data.upcomingEvents?.content ?? []
      const grouped = groupEventsByMonth(upcoming.slice(0, TEASER_EVENT_CAP))
      this.teaserEvents.set(
        grouped.flatMap((group) => group.events).slice(0, TEASER_EVENT_CAP),
      )
    } else {
      this.workspaceLoadError.set(true)
      this.teaserEvents.set([])
      this.categoryLabels.set({})
    }
  }
}
