import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { troupesListPath } from '../../core/navigation/troupe-routes'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import {
  SeasonApiService,
  type SeasonResponse,
} from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb, type ContextBreadcrumbLayout } from '../../shared/context-breadcrumb/context-breadcrumb'
import { MembresTab } from './membres-tab'
import { OrganisateursTab } from './organisateurs-tab'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

export type AdminMembresTab = 'membres' | 'organisateurs'

function pickDefaultSeason(
  seasons: SeasonResponse[],
  preferSlug?: string,
): SeasonResponse | null {
  if (preferSlug) {
    const bySlug = seasons.find((s) => s.slug === preferSlug)
    if (bySlug) return bySlug
  }
  const active = seasons.find((s) => s.active && !s.archived)
  if (active) return active
  return seasons[0] ?? null
}

@Component({
  selector: 'app-admin-membres',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterLink,
    ContextBreadcrumb,
    MembresTab,
    OrganisateursTab,
    UserAvatarComponent,
  ],
  templateUrl: './admin-membres.html',
  styleUrl: './admin-membres.scss',
})
export class AdminMembres implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly seasonApi = inject(SeasonApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private querySubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly loading = signal(true)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly seasons = signal<SeasonResponse[]>([])
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly isTroupeAdmin = signal(false)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly activeTab = signal<AdminMembresTab>('membres')
  protected readonly isTroupeHubRoute = signal(true)

  protected readonly canManageMembers = computed(() => this.isTroupeAdmin())
  protected readonly canManageSeasonOrganizers = computed(
    () => this.permissions()?.canManageSeasonOrganizers === true,
  )
  protected readonly showTabBar = computed(
    () =>
      this.canManageMembers() &&
      this.canManageSeasonOrganizers() &&
      this.season() !== null,
  )
  protected readonly showSeasonSelector = computed(
    () => this.seasons().length > 1 && this.canManageSeasonOrganizers(),
  )
  protected readonly pageTitle = computed(() =>
    this.activeTab() === 'organisateurs' ? 'Organisateur·ices' : 'Membres',
  )
  protected readonly breadcrumbLeaf = computed(() => this.pageTitle())
  protected readonly breadcrumbLayout = computed<ContextBreadcrumbLayout>(() =>
    this.isTroupeHubRoute() ? 'troupe' : 'season',
  )
  protected readonly selectedSeasonSlug = computed(() => this.season()?.slug ?? '')
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly showBreadcrumb = computed(() => {
    if (!this.troupeName()?.trim() || !this.troupeSlug()?.trim() || this.loading()) {
      return false
    }
    if (this.breadcrumbLayout() === 'season') {
      return !!this.season()?.title?.trim()
    }
    return true
  })

  protected userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    if (session.data?.user) {
      this.user.set(session.data.user)
    }

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => {
          const routePath = this.route.snapshot.routeConfig?.path ?? ''
          const isTroupesHubAdmin = routePath.startsWith('troupes/')
          const slugParam = p.get('slug') ?? ''
          return {
            troupeSlug: isTroupesHubAdmin
              ? slugParam
              : (p.get('troupeSlug') ?? ''),
            legacySeasonSlug: isTroupesHubAdmin ? '' : slugParam,
          }
        }),
        distinctUntilChanged(
          (a, b) =>
            a.troupeSlug === b.troupeSlug && a.legacySeasonSlug === b.legacySeasonSlug,
        ),
      )
      .subscribe((params) => {
        void this.loadPage(params)
      })

    this.querySubscription = this.route.queryParamMap
      .pipe(distinctUntilChanged((a, b) => a.get('onglet') === b.get('onglet')))
      .subscribe(() => {
        this.syncTabFromQuery()
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    this.querySubscription.unsubscribe()
  }

  protected onTabChange(index: number): void {
    const tab: AdminMembresTab = this.tabIndexToId(index)
    void this.navigateTab(tab)
  }

  protected tabIndex(): number {
    return this.activeTab() === 'organisateurs' ? 1 : 0
  }

  protected onSeasonChange(ev: MatSelectChange): void {
    void this.selectSeason(String(ev.value))
  }

  protected async refreshPermissionsAfterMemberMutation(): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const pr = await this.organizerApi.mySeasonPermissions(s.id)
    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    if (!this.isTroupeAdmin() && !perms?.canManageSeasonOrganizers) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(troupesListPath())
    }
  }

  private async loadPage(routeParams: {
    troupeSlug: string
    legacySeasonSlug: string
  }): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.seasons.set([])
    this.permissions.set(null)
    this.troupeSlug.set(null)
    const { troupeSlug, legacySeasonSlug } = routeParams
    const isTroupeRoute = legacySeasonSlug === ''
    this.isTroupeHubRoute.set(isTroupeRoute)

    const loaded = await this.troupeContext.load()
    if (requestId !== this.loadRequestId) return

    if (!loaded) {
      this.loading.set(false)
      this.snack.open('Impossible de charger vos troupes.', 'OK', { duration: 6000 })
      await this.router.navigate(troupesListPath())
      return
    }

    let troupe = this.troupeContext.selectedTroupe()
    let selectedSeason: SeasonResponse | null = null

    if (troupeSlug) {
      const match = this.troupeContext.activeTroupes().find((t) => t.slug === troupeSlug)
      if (!match) {
        this.loading.set(false)
        this.snack.open('Troupe introuvable.', 'OK', { duration: 6000 })
        await this.router.navigate(troupesListPath())
        return
      }
      this.troupeContext.selectTroupe(match.id)
      troupe = match
    } else if (legacySeasonSlug) {
      const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(legacySeasonSlug)
      if (requestId !== this.loadRequestId) return
      if (resolved.kind === 'resolved') {
        this.troupeContext.selectTroupe(resolved.troupe.id)
        troupe = this.troupeContext.selectedTroupe() ?? resolved.troupe
        selectedSeason = resolved.season
      } else if (resolved.kind === 'ambiguous') {
        this.loading.set(false)
        this.snack.open(
          'Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.',
          'OK',
          { duration: 8000 },
        )
        await this.router.navigate(troupesListPath())
        return
      }
    }

    if (!troupe) {
      this.loading.set(false)
      await this.router.navigate(troupesListPath())
      return
    }

    this.troupeId.set(troupe.id)
    this.troupeName.set(troupe.name)
    this.troupeSlug.set(troupe.slug)
    this.isTroupeAdmin.set(troupe.membership.baselineRole === 'TROUPE_ADMIN')

    const sr = await this.seasonApi.listSeasons(troupe.id, 0, 100)
    if (requestId !== this.loadRequestId) return

    const troupeSeasons = sr.ok && sr.data ? sr.data.content : []
    this.seasons.set(troupeSeasons)

    if (!selectedSeason) {
      selectedSeason = pickDefaultSeason(troupeSeasons, legacySeasonSlug || undefined)
    }
    this.season.set(selectedSeason)

    let seasonOrganizerPerms = false
    if (selectedSeason) {
      const pr = await this.organizerApi.mySeasonPermissions(selectedSeason.id)
      if (requestId !== this.loadRequestId) return
      const perms = pr.ok && pr.data ? pr.data : null
      this.permissions.set(perms)
      seasonOrganizerPerms = perms?.canManageSeasonOrganizers === true
    }

    this.loading.set(false)

    const canAccess = this.isTroupeAdmin() || (!isTroupeRoute && seasonOrganizerPerms)
    if (!canAccess) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(troupesListPath())
      return
    }

    this.syncTabFromQuery()
  }

  private async selectSeason(seasonId: string): Promise<void> {
    const s = this.seasons().find((item) => item.id === seasonId)
    if (!s) return
    this.season.set(s)
    const pr = await this.organizerApi.mySeasonPermissions(s.id)
    this.permissions.set(pr.ok && pr.data ? pr.data : null)
    this.syncTabFromQuery()
  }

  private syncTabFromQuery(): void {
    const raw = this.route.snapshot.queryParamMap.get('onglet')
    let tab: AdminMembresTab = 'membres'

    if (raw === 'organisateurs' && this.canManageSeasonOrganizers()) {
      tab = 'organisateurs'
    } else if (!this.canManageMembers() && this.canManageSeasonOrganizers()) {
      tab = 'organisateurs'
    } else if (this.canManageMembers()) {
      tab = 'membres'
    }

    this.activeTab.set(tab)
  }

  private tabIndexToId(index: number): AdminMembresTab {
    if (this.showTabBar()) {
      return index === 1 ? 'organisateurs' : 'membres'
    }
    return this.canManageMembers() ? 'membres' : 'organisateurs'
  }

  private async navigateTab(tab: AdminMembresTab): Promise<void> {
    this.activeTab.set(tab)
    const queryParams = tab === 'organisateurs' ? { onglet: 'organisateurs' } : {}
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    })
  }
}
