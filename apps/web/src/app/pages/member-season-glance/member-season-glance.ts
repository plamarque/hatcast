import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { AuthApiService } from '../../core/auth/auth-api.service'
import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import {
  clearStoredMemberGlanceFilters,
  parseAgendaFilterUuid,
  readStoredMemberGlanceFilters,
  writeStoredMemberGlanceFilters,
} from '../../core/member-glance/member-glance-filters-storage'
import {
  MemberSeasonGlanceApiService,
  type MemberSeasonGlance as MemberSeasonGlanceData,
} from '../../core/member-glance/member-season-glance-api.service'
import type { MemberProfileSummary } from '../../core/member-profile/member-profile-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  buildAgendaFilterChips,
  buildAgendaFilterDimensions,
  buildAgendaHubDimensions,
  resolveAgendaPanelSeason,
} from '../../shared/filters/filter-builders'
import { ActiveFilterChips } from '../../shared/filters/active-filter-chips'
import { FilterCriteriaBar } from '../../shared/filters/filter-criteria-bar'
import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { FilterTrigger } from '../../shared/filters/filter-trigger'
import type { FilterDimensionKey } from '../../shared/filters/filter.types'
import { MemberProfilePanel } from '../../shared/member-profile/member-profile-panel'

const EMPTY_PARTICIPATION_FILTERS: UserAgendaParticipationFilters = {
  troupes: [],
  seasons: [],
}

@Component({
  selector: 'app-member-season-glance',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ActiveFilterChips,
    FilterCriteriaBar,
    FilterTrigger,
    MemberProfilePanel,
  ],
  templateUrl: './member-season-glance.html',
  styleUrl: './member-season-glance.scss',
})
export class MemberSeasonGlance implements OnInit, OnDestroy {
  private readonly auth = inject(AuthApiService)
  private readonly glanceApi = inject(MemberSeasonGlanceApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly snack = inject(MatSnackBar)
  private readonly filterPanel = inject(FilterPanelService)

  private routeSubscription?: Subscription
  private skipNextParamReload = false

  protected readonly loadingSession = signal(true)
  protected readonly loadingGlance = signal(false)
  protected readonly loadError = signal(false)
  protected readonly glance = signal<MemberSeasonGlanceData | null>(null)

  protected readonly filterBarVisible = signal(false)
  protected readonly participationFilters = signal<UserAgendaParticipationFilters | null>(null)
  protected readonly selectedTroupeId = signal<string | null>(null)
  protected readonly selectedSeasonId = signal<string | null>(null)
  protected readonly userSlug = signal('')

  protected readonly pageTitle = () => {
    const g = this.glance()
    if (!g) {
      return 'Mes Stats'
    }
    return g.isSelf ? 'Mes Stats' : `${g.displayName} — Stats`
  }

  protected readonly headerTitle = () => {
    const g = this.glance()
    if (!g) {
      return 'Mes Stats'
    }
    return g.isSelf ? 'Mes Stats' : g.displayName
  }

  protected readonly headerSubtitle = () => {
    const g = this.glance()
    if (!g) {
      return 'Disponibilités, sélections et rôles.'
    }
    return g.isSelf
      ? 'Mes disponibilités, sélections et rôles.'
      : 'Disponibilités, sélections et rôles.'
  }

  protected readonly panelProfile = (): MemberProfileSummary | null => {
    const g = this.glance()
    if (!g) {
      return null
    }
    return {
      userId: g.userId,
      membershipId: g.userId,
      displayName: g.displayName,
      avatarUrl: g.avatarUrl,
      isSelf: g.isSelf,
      stats: g.stats,
      monthlyChart: g.monthlyChart,
      favoriteRoleCounts: g.favoriteRoleCounts,
    }
  }

  protected readonly filterPanelOpen = signal(false)

  protected readonly hubDimensions = computed(() => {
    if (!this.filterBarVisible()) {
      return []
    }
    const filters = this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
    return buildAgendaHubDimensions(
      filters,
      this.selectedTroupeId(),
      this.selectedSeasonId(),
    )
  })

  protected readonly activeFilterChips = computed(() => {
    if (!this.filterBarVisible()) {
      return []
    }
    const filters = this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
    return buildAgendaFilterChips(
      filters,
      this.selectedTroupeId(),
      this.selectedSeasonId(),
    )
  })

  protected readonly hasActiveFilters = computed(
    () => this.selectedTroupeId() != null || this.selectedSeasonId() != null,
  )

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      await this.redirectToLogin()
      return
    }
    this.loadingSession.set(false)

    this.userSlug.set(this.route.snapshot.paramMap.get('userSlug') ?? '')
    this.bootstrapFiltersFromRoute()
    await this.syncInitialFilterUrl()
    await this.loadGlance()

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => p.get('userSlug') ?? ''),
        distinctUntilChanged(),
      )
      .subscribe((slug) => {
        if (this.skipNextParamReload) {
          this.skipNextParamReload = false
          return
        }
        if (slug === this.userSlug()) {
          return
        }
        this.userSlug.set(slug)
        void this.reloadForRouteSlugChange()
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe()
  }

  protected async logout(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }

  protected async onTroupeFilterChange(troupeId: string | null): Promise<void> {
    this.selectedTroupeId.set(troupeId)
    if (troupeId && this.selectedSeasonId()) {
      const seasons = this.participationFilters()?.seasons ?? []
      const seasonStillValid = seasons.some(
        (l) => l.id === this.selectedSeasonId() && l.troupeId === troupeId,
      )
      if (!seasonStillValid) {
        this.selectedSeasonId.set(null)
      }
    }
    await this.applyFilterChange()
  }

  protected async onSeasonFilterChange(seasonId: string | null): Promise<void> {
    this.selectedSeasonId.set(seasonId)
    await this.applyFilterChange()
  }

  protected toggleCriteriaPanel(): void {
    if (!this.filterBarVisible()) {
      return
    }
    this.filterPanelOpen.update((open) => !open)
  }

  protected async onOpenFilterDimension(key: FilterDimensionKey): Promise<void> {
    const filters = this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
    await this.openAgendaDimensionPicker(key, filters)
  }

  private async openAgendaDimensionPicker(
    key: FilterDimensionKey,
    filters: UserAgendaParticipationFilters,
  ): Promise<void> {
    const dimension = buildAgendaFilterDimensions(filters, this.selectedTroupeId()).find(
      (d) => d.key === key,
    )
    if (!dimension) {
      return
    }
    const selectedId =
      key === 'troupe' ? this.selectedTroupeId() : this.selectedSeasonId()
    const result = await this.filterPanel.openSinglePicker({
      dimension,
      selectedId,
      participationFilters: filters,
      draftTroupeId: this.selectedTroupeId(),
    })
    if (!result) {
      return
    }
    if (result.action === 'reset') {
      if (key === 'troupe') {
        await this.onTroupeFilterChange(null)
        return
      }
      await this.onSeasonFilterChange(null)
      return
    }
    if (key === 'troupe') {
      await this.onTroupeFilterChange(result.selectedId)
      return
    }
    const seasonId = resolveAgendaPanelSeason(
      filters,
      this.selectedTroupeId(),
      result.selectedId,
    )
    await this.onSeasonFilterChange(seasonId)
  }

  protected async onRemoveFilterDimension(key: FilterDimensionKey): Promise<void> {
    if (key === 'troupe') {
      await this.onTroupeFilterChange(null)
      return
    }
    if (key === 'season') {
      await this.onSeasonFilterChange(null)
    }
  }

  protected async onClearFilters(): Promise<void> {
    this.selectedTroupeId.set(null)
    this.selectedSeasonId.set(null)
    clearStoredMemberGlanceFilters()
    await this.syncFilterQueryParams()
    await this.loadGlance()
  }

  protected goBack(): void {
    void this.router.navigate(['/accueil'])
  }

  private async reloadForRouteSlugChange(): Promise<void> {
    this.glance.set(null)
    this.bootstrapFiltersFromRoute()
    await this.syncInitialFilterUrl()
    await this.loadGlance()
  }

  private async loadGlance(): Promise<void> {
    const slug = this.userSlug()
    if (!slug) {
      this.loadError.set(true)
      return
    }
    this.loadingGlance.set(true)
    this.loadError.set(false)
    const r = await this.glanceApi.getSeasonGlance(slug, {
      troupeId: this.selectedTroupeId() ?? undefined,
      seasonId: this.selectedSeasonId() ?? undefined,
    })
    this.loadingGlance.set(false)

    if (r.ok && r.data) {
      this.glance.set(r.data)
      this.filterBarVisible.set(r.data.filterBarVisible)
      this.participationFilters.set(r.data.participationFilters)

      if (!r.data.filterBarVisible) {
        this.selectedTroupeId.set(null)
        this.selectedSeasonId.set(null)
        clearStoredMemberGlanceFilters()
        await this.syncFilterQueryParams()
      } else {
        await this.reconcileFiltersWithCatalog()
      }
      return
    }

    if (r.status === 401) {
      await this.redirectToLogin()
      return
    }

    if (r.status === 403 || r.status === 404) {
      this.snack.open(r.errorMessage ?? 'Profil inaccessible.', 'OK', { duration: 5000 })
      this.goBack()
      return
    }

    if (r.status === 400) {
      this.snack.open(
        r.errorMessage ?? 'Filtres invalides pour ce profil.',
        'OK',
        { duration: 6000 },
      )
      return
    }

    this.loadError.set(true)
  }

  private bootstrapFiltersFromRoute(): void {
    const query = this.route.snapshot.queryParamMap
    const queryTroupe = parseAgendaFilterUuid(query.get('troupeId'))
    const queryLeague = parseAgendaFilterUuid(query.get('seasonId'))
    if (queryTroupe || queryLeague) {
      this.selectedTroupeId.set(queryTroupe)
      this.selectedSeasonId.set(queryLeague)
      return
    }
    const stored = readStoredMemberGlanceFilters()
    if (stored) {
      this.selectedTroupeId.set(parseAgendaFilterUuid(stored.troupeId))
      this.selectedSeasonId.set(parseAgendaFilterUuid(stored.seasonId))
    }
  }

  private async syncInitialFilterUrl(): Promise<void> {
    const query = this.route.snapshot.queryParamMap
    const hasQueryFilters =
      parseAgendaFilterUuid(query.get('troupeId')) != null ||
      parseAgendaFilterUuid(query.get('seasonId')) != null
    if (!hasQueryFilters && this.hasActiveFilters()) {
      await this.syncFilterQueryParams()
    }
  }

  private async applyFilterChange(): Promise<void> {
    this.persistFilterSelection()
    await this.syncFilterQueryParams()
    await this.loadGlance()
  }

  private persistFilterSelection(): void {
    if (this.selectedTroupeId() == null && this.selectedSeasonId() == null) {
      clearStoredMemberGlanceFilters()
      return
    }
    writeStoredMemberGlanceFilters({
      troupeId: this.selectedTroupeId(),
      seasonId: this.selectedSeasonId(),
    })
  }

  private async syncFilterQueryParams(): Promise<void> {
    this.skipNextParamReload = true
    try {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          troupeId: this.selectedTroupeId(),
          seasonId: this.selectedSeasonId(),
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      })
    } finally {
      this.skipNextParamReload = false
    }
  }

  private async reconcileFiltersWithCatalog(): Promise<void> {
    const catalog = this.participationFilters()
    if (!catalog) {
      return
    }
    let troupeId = this.selectedTroupeId()
    let seasonId = this.selectedSeasonId()
    if (troupeId && !catalog.troupes.some((t) => t.id === troupeId)) {
      troupeId = null
    }
    if (seasonId && !catalog.seasons.some((l) => l.id === seasonId)) {
      seasonId = null
    }
    if (troupeId && seasonId) {
      const season = catalog.seasons.find((s) => s.id === seasonId)
      if (season && season.troupeId !== troupeId) {
        seasonId = null
      }
    }
    this.selectedTroupeId.set(troupeId)
    this.selectedSeasonId.set(seasonId)
    this.persistFilterSelection()
    await this.syncFilterQueryParams()
  }

  private async redirectToLogin(): Promise<void> {
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
