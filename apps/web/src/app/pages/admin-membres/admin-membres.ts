import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { MembresTab } from './membres-tab'
import { OrganisateursTab } from './organisateurs-tab'

export type AdminMembresTab = 'membres' | 'organisateurs'

@Component({
  selector: 'app-admin-membres',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterLink,
    MembresTab,
    OrganisateursTab,
  ],
  templateUrl: './admin-membres.html',
  styleUrl: './admin-membres.scss',
})
export class AdminMembres implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private querySubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly activeTab = signal<AdminMembresTab>('membres')

  protected readonly canManageMembers = computed(
    () => this.permissions()?.canManageMembers === true,
  )
  protected readonly canManageSeasonOrganizers = computed(
    () => this.permissions()?.canManageSeasonOrganizers === true,
  )
  protected readonly showTabBar = computed(
    () => this.canManageMembers() && this.canManageSeasonOrganizers(),
  )
  protected readonly pageTitle = computed(() =>
    this.activeTab() === 'organisateurs' ? 'Organisateur·ices' : 'Membres',
  )
  protected readonly subtitle = computed(() => {
    const se = this.season()
    const troupe = this.troupeName()
    if (!se) return ''
    return troupe ? `${se.title} · ${troupe}` : se.title
  })

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    if (session.data?.user) {
      this.user.set(session.data.user)
    }

    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => p.get('slug') ?? ''),
        distinctUntilChanged(),
      )
      .subscribe((slug) => {
        void this.loadPage(slug)
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

  protected async refreshPermissionsAfterMemberMutation(): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const pr = await this.organizerApi.mySeasonPermissions(s.id)
    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    if (!perms?.canManageMembers && !perms?.canManageSeasonOrganizers) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(['/saison', this.slug()])
    }
  }

  private async loadPage(slug: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.permissions.set(null)

    if (!slug) {
      this.loading.set(false)
      return
    }

    const tr = await this.troupeApi.listMyTroupes()
    if (requestId !== this.loadRequestId) return
    if (!tr.ok || !tr.data?.length) {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }

    const troupe = tr.data[0]
    this.troupeId.set(troupe.id)
    this.troupeName.set(troupe.name)

    const sr = await this.seasonsApi.getSeasonBySlug(troupe.id, slug)
    if (requestId !== this.loadRequestId) return
    if (!sr.ok || !sr.data) {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    this.season.set(sr.data)
    const pr = await this.organizerApi.mySeasonPermissions(sr.data.id)
    if (requestId !== this.loadRequestId) return

    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    this.loading.set(false)

    if (!perms?.canManageMembers && !perms?.canManageSeasonOrganizers) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(['/saison', slug])
      return
    }

    this.syncTabFromQuery()
  }

  private syncTabFromQuery(): void {
    const perms = this.permissions()
    if (!perms) return

    const raw = this.route.snapshot.queryParamMap.get('onglet')
    let tab: AdminMembresTab = 'membres'

    if (raw === 'organisateurs' && perms.canManageSeasonOrganizers) {
      tab = 'organisateurs'
    } else if (!perms.canManageMembers && perms.canManageSeasonOrganizers) {
      tab = 'organisateurs'
    } else if (perms.canManageMembers) {
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
