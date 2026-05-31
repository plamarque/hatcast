import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'

import {
  type AvailabilityStatus,
} from '../../core/availability/availability-status'
import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  clearStoredUserAgendaFilters,
  parseAgendaFilterUuid,
  readStoredUserAgendaFilters,
  writeStoredUserAgendaFilters,
} from '../../core/agenda/user-agenda-filters-storage'
import {
  UserAgendaApiService,
  type UserAgendaItem,
  type UserAgendaParticipationFilters,
} from '../../core/agenda/user-agenda-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { DemoTroupeJoinService } from '../../core/troupes/demo-troupe-join.service'
import {
  saisonEventPath,
  saisonWorkspacePath,
  troupeHubPath,
} from '../../core/navigation/troupe-routes'
import { UserAgendaFilterBar } from '../../shared/agenda/user-agenda-filter-bar'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'
import { groupEventsByMonth, type MonthEventGroup } from '../season-home/season-events.utils'

const PAGE_SIZE = 50

const EMPTY_PARTICIPATION_FILTERS: UserAgendaParticipationFilters = {
  troupes: [],
  seasons: [],
}

@Component({
  selector: 'app-user-agenda',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    UserAgendaFilterBar,
    CompositionStatusBadge,
    AgendaParticipationStatus,
  ],
  templateUrl: './user-agenda.html',
  styleUrl: './user-agenda.scss',
})
export class UserAgenda implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly api = inject(UserAgendaApiService)
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly snack = inject(MatSnackBar)
  private readonly demoJoin = inject(DemoTroupeJoinService)

  private loadGeneration = 0

  protected readonly joiningDemo = this.demoJoin.joining

  protected readonly loadingSession = signal(true)
  protected readonly loadingAgenda = signal(false)
  protected readonly loadError = signal(false)
  protected readonly items = signal<UserAgendaItem[]>([])
  protected readonly noParticipation = signal(false)
  protected readonly filterBarVisible = signal(false)
  protected readonly participationFilters = signal<UserAgendaParticipationFilters | null>(null)
  protected readonly selectedTroupeId = signal<string | null>(null)
  protected readonly selectedSeasonId = signal<string | null>(null)

  protected readonly filterBarCatalog = computed(() => {
    if (!this.filterBarVisible()) {
      return null
    }
    return this.participationFilters() ?? EMPTY_PARTICIPATION_FILTERS
  })

  protected readonly hasActiveFilters = computed(
    () => this.selectedTroupeId() != null || this.selectedSeasonId() != null,
  )

  protected readonly filteredEmpty = computed(
    () =>
      this.items().length === 0 &&
      !this.noParticipation() &&
      !this.loadingAgenda() &&
      !this.loadError() &&
      !this.loadingSession(),
  )

  protected readonly monthGroups = computed<MonthEventGroup<UserAgendaItem>[]>(() =>
    groupEventsByMonth(this.items()),
  )

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      await this.redirectToLogin()
      return
    }
    this.loadingSession.set(false)
    this.bootstrapFiltersFromRoute()
    await this.syncInitialFilterUrl()
    await this.loadAgenda()
  }

  protected async loadAgenda(): Promise<void> {
    const generation = ++this.loadGeneration
    this.loadingAgenda.set(true)
    this.loadError.set(false)
    const r = await this.api.listAgenda({
      page: 0,
      size: PAGE_SIZE,
      scope: 'upcoming',
      troupeId: this.selectedTroupeId() ?? undefined,
      seasonId: this.selectedSeasonId() ?? undefined,
    })

    if (generation !== this.loadGeneration) {
      return
    }

    this.loadingAgenda.set(false)

    if (r.ok && r.data) {
      this.items.set(r.data.content)
      this.noParticipation.set(r.data.noParticipation ?? false)
      this.filterBarVisible.set(r.data.filterBarVisible ?? false)
      this.participationFilters.set(r.data.participationFilters ?? null)

      if (!r.data.filterBarVisible) {
        this.selectedTroupeId.set(null)
        this.selectedSeasonId.set(null)
        clearStoredUserAgendaFilters()
        await this.syncFilterQueryParams()
        return
      }

      await this.reconcileFiltersWithCatalog()
      return
    }

    if (r.status === 401) {
      await this.redirectToLogin()
      return
    }

    this.loadError.set(true)
    this.items.set([])
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

  protected async onClearFilters(): Promise<void> {
    this.selectedTroupeId.set(null)
    this.selectedSeasonId.set(null)
    clearStoredUserAgendaFilters()
    await this.syncFilterQueryParams()
    await this.loadAgenda()
  }

  protected readonly troupeHubPath = troupeHubPath
  protected readonly saisonWorkspacePath = saisonWorkspacePath

  protected openEvent(item: UserAgendaItem): void {
    void this.router.navigate(saisonEventPath(item.seasonSlug, item.eventSlug))
  }

  protected timeLabel(item: UserAgendaItem): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(new Date(item.startsAt))
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

    const stored = readStoredUserAgendaFilters()
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

  private persistFilterSelection(): void {
    if (this.selectedTroupeId() == null && this.selectedSeasonId() == null) {
      clearStoredUserAgendaFilters()
      return
    }
    writeStoredUserAgendaFilters({
      troupeId: this.selectedTroupeId(),
      seasonId: this.selectedSeasonId(),
    })
  }

  private async applyFilterChange(): Promise<void> {
    this.persistFilterSelection()
    await this.syncFilterQueryParams()
    await this.loadAgenda()
  }

  private async reconcileFiltersWithCatalog(): Promise<void> {
    const catalog = this.participationFilters()
    if (!catalog) {
      return
    }

    let troupeId = this.selectedTroupeId()
    let seasonId = this.selectedSeasonId()
    let changed = false

    if (troupeId && !catalog.troupes.some((t) => t.id === troupeId)) {
      troupeId = null
      changed = true
    }

    if (seasonId) {
      const season = catalog.seasons.find((s) => s.id === seasonId)
      if (!season) {
        seasonId = null
        changed = true
      } else if (troupeId && season.troupeId !== troupeId) {
        seasonId = null
        changed = true
      }
    }

    if (!changed) {
      return
    }

    this.selectedTroupeId.set(troupeId)
    this.selectedSeasonId.set(seasonId)
    this.persistFilterSelection()
    await this.syncFilterQueryParams()
    await this.loadAgenda()
  }

  private async syncFilterQueryParams(): Promise<void> {
    const troupeId = this.selectedTroupeId()
    const seasonId = this.selectedSeasonId()
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        troupeId: troupeId ?? null,
        seasonId: seasonId ?? null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  private async redirectToLogin(): Promise<void> {
    this.loadingSession.set(false)
    this.loadingAgenda.set(false)
    this.snack.open('Votre session a expiré ou vous n’êtes pas connecté.', 'OK', {
      duration: 6000,
    })
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }

  protected async joinDemoTroupe(): Promise<void> {
    await this.demoJoin.join()
  }
}
