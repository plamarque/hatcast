import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  troupeHubPath,
  troupesListPath,
} from '../../core/navigation/troupe-routes'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { TroupeCategoriesTab } from './troupe-categories-tab'
import { TroupeDrawFormulasTab } from './troupe-draw-formulas-tab'

const CATEGORIES_TAB = 'categories'
const FORMULAS_TAB = 'formulas'

@Component({
  selector: 'app-troupe-settings',
  imports: [
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    ContextBreadcrumb,
    TroupeCategoriesTab,
    TroupeDrawFormulasTab,
  ],
  templateUrl: './troupe-settings.html',
  styleUrl: './troupe-settings.scss',
})
export class TroupeSettings implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly loading = signal(true)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly troupeLogoUrl = signal<string | null>(null)
  protected readonly isTroupeAdmin = signal(false)
  protected readonly platformAdmin = signal(false)
  protected readonly activeTab = signal(CATEGORIES_TAB)

  protected readonly canManageTroupe = computed(
    () => this.isTroupeAdmin() || this.platformAdmin(),
  )

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !this.loading(),
  )

  protected readonly selectedTabIndex = computed(() =>
    this.activeTab() === FORMULAS_TAB ? 1 : 0,
  )

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.platformAdmin.set(session.data?.platformAdmin === true)

    this.routeSubscription = new Subscription()
    this.routeSubscription.add(
      this.route.paramMap
        .pipe(
          map((p) => p.get('slug') ?? ''),
          distinctUntilChanged(),
        )
        .subscribe((slug) => {
          void this.loadPage(slug)
        }),
    )
    this.routeSubscription.add(
      this.route.queryParamMap
        .pipe(
          map((q) => q.get('tab')?.trim() || CATEGORIES_TAB),
          distinctUntilChanged(),
        )
        .subscribe((tab) => {
          this.activeTab.set(tab === FORMULAS_TAB ? FORMULAS_TAB : CATEGORIES_TAB)
        }),
    )
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
  }

  protected onTabChange(index: number): void {
    const tab = index === 1 ? FORMULAS_TAB : CATEGORIES_TAB
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  private async loadPage(troupeSlug: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.troupeSlug.set(null)

    const loaded = await this.troupeContext.load()
    if (requestId !== this.loadRequestId) return

    if (!loaded) {
      this.loading.set(false)
      this.snack.open('Impossible de charger vos troupes.', 'OK', { duration: 6000 })
      await this.router.navigate(troupesListPath())
      return
    }

    if (!troupeSlug) {
      this.loading.set(false)
      await this.router.navigate(troupesListPath())
      return
    }

    const troupe = await this.troupeContext.resolveTroupeBySlug(troupeSlug)
    if (requestId !== this.loadRequestId) return

    if (!troupe) {
      this.loading.set(false)
      this.snack.open('Troupe introuvable.', 'OK', { duration: 6000 })
      await this.router.navigate(troupesListPath())
      return
    }

    this.troupeContext.selectTroupe(troupe.id)
    const isTroupeAdmin = troupe.membership.baselineRole === 'TROUPE_ADMIN'
    const canManage = isTroupeAdmin || this.platformAdmin()

    this.troupeId.set(troupe.id)
    this.troupeName.set(troupe.name)
    this.troupeSlug.set(troupe.slug)
    this.troupeLogoUrl.set(troupe.logoUrl ?? null)
    this.isTroupeAdmin.set(isTroupeAdmin)
    this.loading.set(false)

    if (!canManage) {
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(troupeHubPath(troupe.slug))
    }
  }
}
