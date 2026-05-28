import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet'
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
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  saisonWorkspacePath,
  troupeAdminMembresPath,
  troupesListPath,
} from '../../core/navigation/troupe-routes'
import {
  type SeasonResponse,
  SeasonApiService,
} from '../../core/seasons/season-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { type TroupeListItem } from '../../core/troupes/troupe-api.service'
import {
  ScopeAdminMenu,
  type ScopeAdminMenuItem,
} from '../../shared/scope-admin-menu/scope-admin-menu'
import { SeasonCard } from '../../shared/season-card/season-card'
import {
  SeasonFormDialog,
  type SeasonFormDialogData,
} from '../seasons-list/season-form-dialog'
import {
  TroupeHubPreferencesSheet,
  type TroupeHubPreferencesSheetData,
} from './troupe-hub-preferences-sheet'

const SEASONS_PAGE_SIZE = 50

@Component({
  selector: 'app-troupe-hub',
  imports: [
    MatBottomSheetModule,
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
  private readonly seasonApi = inject(SeasonApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private readonly bottomSheet = inject(MatBottomSheet)

  private slugSubscription?: Subscription

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loadingSession = signal(true)
  protected readonly loadingSeasons = signal(false)
  protected readonly seasonsLoadError = signal(false)
  protected readonly troupe = signal<TroupeListItem | null>(null)
  protected readonly notFound = signal(false)
  protected readonly showArchived = signal(false)
  protected readonly allSeasons = signal<SeasonResponse[]>([])

  protected readonly isTroupeAdmin = computed(
    () => this.troupe()?.membership.baselineRole === 'TROUPE_ADMIN',
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

  protected readonly troupeAdminItems = computed<ScopeAdminMenuItem[]>(() => {
    if (!this.isTroupeAdmin()) {
      return []
    }
    const slug = this.slug()
    if (!slug) {
      return []
    }
    return [
      {
        label: 'Membres',
        icon: 'groups',
        routerLink: troupeAdminMembresPath(slug),
      },
    ]
  })

  protected readonly troupesListLink = troupesListPath()

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok || !session.data) {
      rememberCurrentUrlForPostLogin(this.router)
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.loadingSession.set(false)

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
  }

  private async applySlug(slug: string): Promise<void> {
    this.notFound.set(false)
    this.showArchived.set(false)
    if (!slug) {
      this.troupe.set(null)
      this.allSeasons.set([])
      this.notFound.set(true)
      return
    }

    const match = this.troupeContext.activeTroupes().find((t) => t.slug === slug)
    if (!match) {
      this.troupe.set(null)
      this.allSeasons.set([])
      this.notFound.set(true)
      return
    }

    this.troupeContext.selectTroupe(match.id)
    this.troupe.set(match)
    await this.loadSeasons(match.id)
  }

  protected toggleArchived(): void {
    this.showArchived.update((v) => !v)
  }

  protected archivedToggleLabel(): string {
    return this.showArchived()
      ? 'Masquer les saisons archivées'
      : 'Afficher les saisons archivées'
  }

  protected openPreferences(): void {
    const t = this.troupe()
    if (!t) {
      return
    }
    this.bottomSheet.open<TroupeHubPreferencesSheet, TroupeHubPreferencesSheetData>(
      TroupeHubPreferencesSheet,
      {
        data: { troupe: t },
        panelClass: 'troupe-hub-preferences-panel',
      },
    )
  }

  protected openCreateSeason(): void {
    const t = this.troupe()
    if (!t || !this.isTroupeAdmin()) {
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
    ref.afterClosed().subscribe((result) => {
      if (typeof result === 'string') {
        void this.router.navigate(saisonWorkspacePath(result))
      } else if (result) {
        void this.loadSeasons(t.id)
        this.snack.open('Saison créée.', 'OK', { duration: 4000 })
      }
    })
  }

  private async loadSeasons(troupeId: string): Promise<void> {
    this.loadingSeasons.set(true)
    this.seasonsLoadError.set(false)
    const r = await this.seasonApi.listSeasons(troupeId, 0, SEASONS_PAGE_SIZE)
    this.loadingSeasons.set(false)
    if (!r.ok || !r.data) {
      this.seasonsLoadError.set(true)
      return
    }
    this.allSeasons.set(r.data.content)
  }
}
