import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { AuthApiService } from '../../core/auth/auth-api.service'
import type { UserAgendaParticipationFilters } from '../../core/agenda/user-agenda-api.service'
import {
  clearStoredMemberGlanceFilters,
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
} from '../../shared/filters/filter-builders'
import { ActiveFilterChips } from '../../shared/filters/active-filter-chips'
import { FilterCriteriaBar } from '../../shared/filters/filter-criteria-bar'
import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { FilterTrigger } from '../../shared/filters/filter-trigger'
import type { ActiveFilterChip, FilterDimensionKey, FilterHubDimension } from '../../shared/filters/filter.types'
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
    RouterLink,
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
  protected readonly noParticipation = signal(false)
  protected readonly glance = signal<MemberSeasonGlanceData | null>(null)

  protected readonly filterBarVisible = signal(false)
  protected readonly participationFilters = signal<UserAgendaParticipationFilters | null>(null)
  /** Empty selection means the eligible "Toutes" scope. */
  protected readonly selectedTroupeIds = signal<string[]>([])
  protected readonly selectedSeasonIds = signal<string[]>([])
  protected readonly userSlug = signal('')

  protected readonly removableFilterDimensions = computed<FilterDimensionKey[]>(() => {
    const dimensions: FilterDimensionKey[] = []
    if (this.selectedTroupeIds().length) {
      dimensions.push('troupe')
    }
    if (this.selectedSeasonIds().length) {
      dimensions.push('season')
    }
    return dimensions
  })

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
      gender: g.gender,
    }
  }

  protected readonly filterPanelOpen = signal(false)

  protected readonly hubDimensions = computed(() => {
    if (!this.filterBarVisible()) {
      return []
    }
    const filters = this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
    return this.multiHubDimensions(filters)
  })

  protected readonly activeFilterChips = computed(() => {
    if (!this.filterBarVisible()) {
      return []
    }
    const filters = this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
    return this.multiFilterChips(filters)
  })

  protected readonly hasActiveFilters = computed(
    () => this.selectedTroupeIds().length > 0 || this.selectedSeasonIds().length > 0,
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

  protected async onTroupeFilterChange(troupeIds: string[] | string | null): Promise<void> {
    troupeIds = typeof troupeIds === 'string' ? [troupeIds] : troupeIds ?? []
    this.selectedTroupeIds.set(troupeIds)
    const compatible = new Set(this.availableSeasons().map((season) => season.id))
    this.selectedSeasonIds.update((ids) => ids.filter((id) => compatible.has(id)))
    await this.applyFilterChange()
  }

  protected async onSeasonFilterChange(seasonIds: string[] | string | null): Promise<void> {
    seasonIds = typeof seasonIds === 'string' ? [seasonIds] : seasonIds ?? []
    this.selectedSeasonIds.set(seasonIds)
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
    const isTroupe = key === 'troupe'
    const options = isTroupe
      ? filters.troupes.map((troupe) => ({ id: troupe.id, label: troupe.name }))
      : this.availableSeasons().map((season) => ({ id: season.id, label: season.title }))
    const result = await this.filterPanel.openParticipantPicker({
      title: isTroupe ? 'Choisir des troupes' : 'Choisir des saisons',
      options,
      selectedIds: isTroupe ? this.selectedTroupeIds() : this.selectedSeasonIds(),
    })
    if (!result) {
      return
    }
    if (result.action === 'reset') {
      if (isTroupe) await this.onTroupeFilterChange([])
      else await this.onSeasonFilterChange([])
      return
    }
    if (isTroupe) await this.onTroupeFilterChange(result.selectedIds)
    else await this.onSeasonFilterChange(result.selectedIds)
  }

  protected async onRemoveFilterDimension(key: FilterDimensionKey): Promise<void> {
    if (key === 'troupe') {
      await this.onTroupeFilterChange([])
      return
    }
    if (key === 'season') {
      await this.onSeasonFilterChange([])
    }
  }

  protected async onClearFilters(): Promise<void> {
    this.selectedTroupeIds.set([])
    this.selectedSeasonIds.set([])
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
    this.noParticipation.set(false)
    const r = await this.glanceApi.getSeasonGlance(slug, {
      troupeIds: this.selectedTroupeIds(),
      seasonIds: this.selectedSeasonIds(),
    })
    this.loadingGlance.set(false)

    if (r.ok && r.data) {
      this.glance.set(r.data)
      this.filterBarVisible.set(r.data.filterBarVisible)
      this.participationFilters.set(r.data.participationFilters)

      if (!r.data.filterBarVisible) {
        this.selectedTroupeIds.set([])
        this.selectedSeasonIds.set([])
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

    if (r.status === 404 && r.errorMessage === 'Aucune participation active.') {
      this.noParticipation.set(true)
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
    const queryTroupes = query.getAll('troupeId').filter(Boolean)
    const querySeasons = query.getAll('seasonId').filter(Boolean)
    if (queryTroupes.length || querySeasons.length) {
      this.selectedTroupeIds.set(queryTroupes)
      this.selectedSeasonIds.set(querySeasons)
      return
    }
    const stored = readStoredMemberGlanceFilters()
    if (stored) {
      this.selectedTroupeIds.set(stored.troupeIds)
      this.selectedSeasonIds.set(stored.seasonIds)
    }
  }

  private async syncInitialFilterUrl(): Promise<void> {
    const query = this.route.snapshot.queryParamMap
    const hasQueryFilters =
      query.getAll('troupeId').length > 0 || query.getAll('seasonId').length > 0
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
    const troupeIds = this.selectedTroupeIds()
    const seasonIds = this.selectedSeasonIds()
    if (!troupeIds.length && !seasonIds.length) {
      clearStoredMemberGlanceFilters()
      return
    }
    writeStoredMemberGlanceFilters({
      troupeIds,
      seasonIds,
    })
  }

  private async syncFilterQueryParams(): Promise<void> {
    this.skipNextParamReload = true
    try {
      await this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          troupeId: this.selectedTroupeIds().length ? this.selectedTroupeIds() : null,
          seasonId: this.selectedSeasonIds().length ? this.selectedSeasonIds() : null,
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
    const troupeIds = this.selectedTroupeIds().filter((id) => catalog.troupes.some((troupe) => troupe.id === id))
    const allowedSeasons = new Set(this.seasonsForTroupes(catalog, troupeIds).map((season) => season.id))
    const seasonIds = this.selectedSeasonIds().filter((id) => allowedSeasons.has(id))
    this.selectedTroupeIds.set(troupeIds)
    this.selectedSeasonIds.set(seasonIds)
    this.persistFilterSelection()
    await this.syncFilterQueryParams()
  }

  private availableSeasons() {
    return this.seasonsForTroupes(
      this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS,
      this.selectedTroupeIds(),
    )
  }

  private seasonsForTroupes(filters: UserAgendaParticipationFilters, troupeIds: string[]) {
    return troupeIds.length
      ? filters.seasons.filter((season) => troupeIds.includes(season.troupeId))
      : filters.seasons
  }

  private multiHubDimensions(filters: UserAgendaParticipationFilters): FilterHubDimension[] {
    const troupeIds = this.selectedTroupeIds()
    const seasonIds = this.selectedSeasonIds()
    const summary = (ids: string[], labels: string[], all: string) =>
      !ids.length ? all : ids.length === 1 ? labels[0] ?? all : `${ids.length} sélectionnées`
    return [
      {
        key: 'troupe', icon: 'groups', title: 'Troupe',
        summary: summary(troupeIds, filters.troupes.filter((t) => troupeIds.includes(t.id)).map((t) => t.name), 'Toutes'),
      },
      {
        key: 'season', icon: 'calendar_month', title: 'Saison',
        summary: summary(seasonIds, filters.seasons.filter((s) => seasonIds.includes(s.id)).map((s) => s.title), 'Toutes'),
      },
    ]
  }

  private multiFilterChips(filters: UserAgendaParticipationFilters): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = []
    const troupeIds = this.selectedTroupeIds()
    const seasonIds = this.selectedSeasonIds()
    if (troupeIds.length) chips.push({ dimensionKey: 'troupe', label: troupeIds.length === 1 ? (filters.troupes.find((t) => t.id === troupeIds[0])?.name ?? 'Troupe') : `${troupeIds.length} troupes` })
    if (seasonIds.length) chips.push({ dimensionKey: 'season', label: seasonIds.length === 1 ? (filters.seasons.find((s) => s.id === seasonIds[0])?.title ?? 'Saison') : `${seasonIds.length} saisons` })
    return chips
  }

  private async redirectToLogin(): Promise<void> {
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
