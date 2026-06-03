import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { PageEvent } from '@angular/material/paginator'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuditApiService, type AuditActionType, type AuditEventRow } from '../../core/audit/audit-api.service'
import { AUDIT_ACTION_FILTER_OPTIONS } from '../../core/audit/audit-labels'
import { AuthApiService } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { saisonWorkspacePath, troupesListPath } from '../../core/navigation/troupe-routes'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { EventApiService } from '../../core/events/event-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { AuditJournalList } from '../../shared/audit-journal-list/audit-journal-list'
import { FilterPanelService } from '../../shared/filters/filter-panel.service'
import { FilterTrigger } from '../../shared/filters/filter-trigger'
import type { FilterDimensionConfig } from '../../shared/filters/filter.types'

export type AdminAuditScope = 'troupe' | 'season'

type AuditFilterKey = 'actionType' | 'fromDate' | 'toDate' | 'event'

interface AuditFilterChip {
  key: AuditFilterKey
  label: string
}

@Component({
  selector: 'app-admin-audit',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    ContextBreadcrumb,
    AuditJournalList,
    FilterTrigger,
  ],
  templateUrl: './admin-audit.html',
  styleUrl: './admin-audit.scss',
})
export class AdminAudit implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly auditApi = inject(AuditApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly filterPanel = inject(FilterPanelService)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly actionFilterOptions = AUDIT_ACTION_FILTER_OPTIONS
  protected readonly slug = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('seasonSlug') ?? p.get('slug') ?? ''),
    ),
    { initialValue: '' },
  )
  protected readonly scope = toSignal(
    this.route.data.pipe(map((d) => (d['auditScope'] as AdminAuditScope) ?? 'season')),
    { initialValue: 'season' as AdminAuditScope },
  )

  protected readonly loading = signal(true)
  protected readonly forbidden = signal(false)
  protected readonly loadError = signal(false)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly troupeLogoUrl = signal<string | null>(null)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly platformAdmin = signal(false)
  protected readonly rows = signal<AuditEventRow[]>([])
  protected readonly page = signal(0)
  protected readonly pageSize = signal(25)
  protected readonly totalElements = signal(0)
  protected readonly actionTypeFilter = signal<AuditActionType | ''>('')
  protected readonly fromDate = signal('')
  protected readonly toDate = signal('')
  protected readonly eventFilterId = signal('')
  protected readonly events = signal<EventResponse[]>([])
  protected readonly filtersPanelOpen = signal(false)

  protected readonly pageTitle = computed(() => "Journal d'audit")
  protected readonly actionTypeSummary = computed(() => {
    const value = this.actionTypeFilter()
    if (!value) return 'Tous'
    return AUDIT_ACTION_FILTER_OPTIONS.find((opt) => opt.value === value)?.label ?? 'Tous'
  })
  protected readonly eventSummary = computed(() => {
    const id = this.eventFilterId()
    if (!id) return 'Tous'
    return this.events().find((ev) => ev.id === id)?.title ?? 'Spectacle'
  })
  protected readonly activeFilterChips = computed((): AuditFilterChip[] => {
    const chips: AuditFilterChip[] = []
    const action = this.actionTypeFilter()
    if (action) {
      const label =
        AUDIT_ACTION_FILTER_OPTIONS.find((opt) => opt.value === action)?.label ?? "Type d'action"
      chips.push({ key: 'actionType', label })
    }
    if (this.fromDate()) {
      chips.push({ key: 'fromDate', label: `Du ${formatAuditFilterDate(this.fromDate())}` })
    }
    if (this.toDate()) {
      chips.push({ key: 'toDate', label: `Au ${formatAuditFilterDate(this.toDate())}` })
    }
    const eventId = this.eventFilterId()
    if (eventId) {
      const title = this.events().find((ev) => ev.id === eventId)?.title ?? 'Spectacle'
      chips.push({ key: 'event', label: title })
    }
    return chips
  })
  protected readonly activeFilterCount = computed(() => this.activeFilterChips().length)
  protected readonly hasActiveFilters = computed(() => this.activeFilterCount() > 0)
  protected readonly showBreadcrumb = computed(() => {
    if (this.scope() === 'troupe') {
      return !!this.troupeName()?.trim() && !!this.troupeSlug()?.trim()
    }
    return (
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.season()?.title.trim()
    )
  })
  protected readonly canView = computed(() => {
    const perms = this.permissions()
    if (this.platformAdmin()) return true
    if (!perms) return false
    return this.scope() === 'troupe'
      ? perms.canViewAuditTroupe === true
      : perms.canViewAuditSeason === true
  })

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.platformAdmin.set(session.data.platformAdmin === true)
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => ({
          troupeSlug:
            (this.route.snapshot.data['auditScope'] as AdminAuditScope) === 'troupe'
              ? (p.get('slug') ?? '')
              : (p.get('troupeSlug') ?? ''),
          seasonSlug:
            (this.route.snapshot.data['auditScope'] as AdminAuditScope) === 'troupe'
              ? ''
              : (p.get('seasonSlug') ?? ''),
        })),
        distinctUntilChanged(
          (a, b) => a.troupeSlug === b.troupeSlug && a.seasonSlug === b.seasonSlug,
        ),
      )
      .subscribe(({ troupeSlug, seasonSlug }) => {
        this.resetFiltersForNavigation()
        void this.load(troupeSlug, seasonSlug)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    this.loadRequestId++
  }

  protected applyFilters(): void {
    this.page.set(0)
    void this.reloadRows()
  }

  protected toggleFiltersPanel(): void {
    this.filtersPanelOpen.update((open) => !open)
  }

  protected resetFilters(): void {
    this.actionTypeFilter.set('')
    this.fromDate.set('')
    this.toDate.set('')
    this.eventFilterId.set('')
    this.filtersPanelOpen.set(false)
    this.applyFilters()
  }

  protected clearFilter(key: AuditFilterKey): void {
    switch (key) {
      case 'actionType':
        this.actionTypeFilter.set('')
        break
      case 'fromDate':
        this.fromDate.set('')
        break
      case 'toDate':
        this.toDate.set('')
        break
      case 'event':
        this.eventFilterId.set('')
        break
    }
    this.applyFilters()
  }

  protected onFilterChipClick(key: AuditFilterKey): void {
    this.filtersPanelOpen.set(true)
    if (key === 'actionType') {
      void this.openActionTypePicker()
      return
    }
    if (key === 'event') {
      void this.openEventPicker()
    }
  }

  protected async openActionTypePicker(): Promise<void> {
    const result = await this.filterPanel.openSinglePicker({
      dimension: auditActionTypeDimension(),
      selectedId: this.actionTypeFilter() || null,
    })
    if (!result) return
    if (result.action === 'reset') {
      this.actionTypeFilter.set('')
    } else {
      this.actionTypeFilter.set((result.selectedId as AuditActionType | null) ?? '')
    }
    this.applyFilters()
  }

  protected async openEventPicker(): Promise<void> {
    const result = await this.filterPanel.openSinglePicker({
      dimension: auditEventDimension(this.events()),
      selectedId: this.eventFilterId() || null,
    })
    if (!result) return
    if (result.action === 'reset') {
      this.eventFilterId.set('')
    } else {
      this.eventFilterId.set(result.selectedId ?? '')
    }
    this.applyFilters()
  }

  protected onPage(event: PageEvent): void {
    this.page.set(event.pageIndex)
    this.pageSize.set(event.pageSize)
    void this.reloadRows()
  }

  protected retryLoad(): void {
    void this.reloadRows()
  }

  private resetFiltersForNavigation(): void {
    this.page.set(0)
    this.actionTypeFilter.set('')
    this.fromDate.set('')
    this.toDate.set('')
    this.eventFilterId.set('')
    this.filtersPanelOpen.set(false)
  }

  private async load(troupeSlug: string, seasonSlug: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.forbidden.set(false)
    this.loadError.set(false)
    this.rows.set([])

    if (!troupeSlug) {
      this.loading.set(false)
      return
    }

    const loaded = await this.troupeContext.load()
    if (requestId !== this.loadRequestId) return
    if (!loaded) {
      this.loading.set(false)
      this.snack.open('Impossible de charger vos troupes.', 'OK', { duration: 6000 })
      return
    }

    if (this.scope() === 'troupe') {
      const troupe = await this.troupeContext.resolveTroupeBySlug(troupeSlug)
      if (requestId !== this.loadRequestId) return
      if (!troupe) {
        this.loading.set(false)
        this.snack.open('Troupe introuvable.', 'OK', { duration: 6000 })
        await this.router.navigate(troupesListPath())
        return
      }
      this.troupeContext.selectTroupe(troupe.id)
      this.troupeId.set(troupe.id)
      this.troupeName.set(troupe.name)
      this.troupeSlug.set(troupe.slug)
      this.troupeLogoUrl.set(troupe.logoUrl ?? null)
      const isTroupeAdmin = troupe.membership.baselineRole === 'TROUPE_ADMIN'
      this.permissions.set({
        canManageSeasonOrganizers: isTroupeAdmin,
        canManageEventOrganizers: isTroupeAdmin,
        canManageMembers: isTroupeAdmin,
        canManageSeasons: isTroupeAdmin,
        canManageEvents: isTroupeAdmin,
        canManageSeasonParticipants: isTroupeAdmin,
        canManageEventParticipants: isTroupeAdmin,
        isTroupeAdmin,
        isSeasonOrganizer: false,
        eventOrganizerFor: [],
        eventParticipantAdminFor: [],
        canViewAuditTroupe: isTroupeAdmin,
        canViewAuditSeason: isTroupeAdmin,
        canViewAuditEvent: isTroupeAdmin,
      })
      if (!this.canView()) {
        this.forbidden.set(true)
        this.loading.set(false)
        return
      }
      await this.reloadRows(requestId)
      this.loading.set(false)
      return
    }

    if (!seasonSlug) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonInTroupe(
      troupeSlug,
      seasonSlug,
    )
    if (requestId !== this.loadRequestId) return
    if (resolved.kind !== 'resolved') {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    this.troupeContext.selectTroupe(resolved.troupe.id)
    this.troupeId.set(resolved.troupe.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeSlug.set(resolved.troupe.slug)
    this.troupeLogoUrl.set(resolved.troupe.logoUrl ?? null)
    this.season.set(resolved.season)

    const pr = await this.organizerApi.mySeasonPermissions(resolved.season.id)
    if (requestId !== this.loadRequestId) return
    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    if (!this.canView()) {
      this.forbidden.set(true)
      this.loading.set(false)
      this.snack.open("Tu n'as pas accès à cette page.", 'OK', { duration: 5000 })
      await this.router.navigate(
        saisonWorkspacePath(resolved.troupe.slug, resolved.season.slug),
      )
      return
    }

    const eventsRes = await this.eventsApi.listEvents(resolved.season.id, 0, 100, 'all')
    if (requestId !== this.loadRequestId) return
    if (eventsRes.ok && eventsRes.data) {
      this.events.set(eventsRes.data.content)
    }

    await this.reloadRows(requestId)
    this.loading.set(false)
  }

  private async reloadRows(expectedRequestId = this.loadRequestId): Promise<void> {
    const troupeId = this.troupeId()
    const season = this.season()
    if (!troupeId) return
    const res = await this.auditApi.listEvents({
      troupeId,
      seasonId: this.scope() === 'season' ? season?.id : undefined,
      eventId: this.scope() === 'season' && this.eventFilterId() ? this.eventFilterId() : undefined,
      actionType: this.actionTypeFilter() || undefined,
      from: this.fromDate() ? localDayStartIso(this.fromDate()) : undefined,
      to: this.toDate() ? localDayEndIso(this.toDate()) : undefined,
      page: this.page(),
      size: this.pageSize(),
    })
    if (expectedRequestId !== this.loadRequestId) return
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        this.forbidden.set(true)
      } else {
        this.loadError.set(true)
      }
      this.rows.set([])
      return
    }
    this.rows.set(res.data?.content ?? [])
    this.totalElements.set(res.data?.totalElements ?? 0)
  }
}

function formatAuditFilterDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

function localDayStartIso(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString()
}

function localDayEndIso(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString()
}

function auditActionTypeDimension(): FilterDimensionConfig {
  return {
    key: 'participant',
    type: 'single-select',
    icon: 'history',
    title: "Type d'action",
    options: [
      { id: null, label: 'Tous' },
      ...AUDIT_ACTION_FILTER_OPTIONS.map((opt) => ({ id: opt.value, label: opt.label })),
    ],
  }
}

function auditEventDimension(events: EventResponse[]): FilterDimensionConfig {
  return {
    key: 'spectacle',
    type: 'single-select',
    icon: 'theater_comedy',
    title: 'Spectacle',
    options: [
      { id: null, label: 'Tous' },
      ...events.map((ev) => ({ id: ev.id, label: ev.title })),
    ],
  }
}
