import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { Subscription } from 'rxjs'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { DEMO_TROUPE_SLUG } from '../../core/troupes/demo-troupe.constants'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { rememberLastVisitedTroupeSlug } from '../../core/navigation/last-visited-troupe-storage'
import {
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
import { type TroupeListItem, TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import { SeasonCard } from '../../shared/season-card/season-card'
import {
  SeasonFormDialog,
  type SeasonFormDialogData,
} from '../seasons-list/season-form-dialog'
import { TroupeEditDialog, type TroupeEditDialogData } from './troupe-edit-dialog'

const SEASONS_PAGE_SIZE = 50

@Component({
  selector: 'app-troupe-hub',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    ScopeAdminMenu,
    SeasonCard,
  ],
  templateUrl: './troupe-hub.html',
  styleUrl: './troupe-hub.scss',
})
export class TroupeHub implements OnInit, OnDestroy {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly seasonApi = inject(SeasonApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  private slugSubscription?: Subscription
  private readonly dialogSubscriptions = new Subscription()
  private slugRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
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

  protected readonly visibleSeasons = computed(() =>
    this.showArchived()
      ? [...this.activeSeasons(), ...this.archivedSeasons()]
      : this.activeSeasons(),
  )

  protected readonly onlyArchivedSeasonsHidden = computed(
    () =>
      this.activeSeasons().length === 0 &&
      this.archivedSeasons().length > 0 &&
      !this.showArchived(),
  )

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
    this.showArchived.update((v) => !v)
  }

  protected archivedToggleLabel(): string {
    return this.showArchived()
      ? 'Masquer les saisons archivées'
      : 'Afficher les saisons archivées'
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
          void this.loadSeasons(t.id)
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
  }
}
