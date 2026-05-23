import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectChange, MatSelectModule } from '@angular/material/select'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  type SeasonResponse,
  SeasonApiService,
} from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { environment } from '../../../environments/environment'
import { ConfirmDialog, type ConfirmDialogData } from './confirm-dialog'
import { SeasonFormDialog, type SeasonFormDialogData } from './season-form-dialog'

/** Tri par défaut côté API : `createdAt` décroissant ; pagination : 20 par page. */
const PAGE_SIZE = 20

@Component({
  selector: 'app-seasons-list',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './seasons-list.html',
  styleUrl: './seasons-list.scss',
})
export class SeasonsList implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly api = inject(SeasonApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  protected readonly loadingSession = signal(true)
  protected readonly loadingList = signal(false)
  protected readonly loadError = signal(false)
  protected readonly joiningDemo = signal(false)
  protected readonly hasMembership = signal(false)
  protected readonly canManageSeasons = signal(false)
  protected readonly canManageMembers = computed(
    () => this.selectedTroupe()?.membership.baselineRole === 'TROUPE_ADMIN',
  )
  protected readonly seasons = signal<SeasonResponse[]>([])
  protected readonly troupeId = signal<string | null>(null)
  protected readonly totalElements = signal(0)
  protected readonly pageIndex = signal(0)
  protected readonly pageSize = PAGE_SIZE
  protected readonly activeTroupes = this.troupeContext.activeTroupes
  protected readonly selectedTroupe = this.troupeContext.selectedTroupe

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      this.snack.open(
        'Votre session a expiré ou vous n’êtes pas connecté.',
        'OK',
        { duration: 6000 },
      )
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.loadingSession.set(false)
    await this.loadTroupeAndSeasons(0)
  }

  protected async joinDemoTroupe(): Promise<void> {
    const demoId = environment.demoTroupeId
    if (!demoId) {
      this.snack.open('Troupe de démonstration indisponible.', 'OK', { duration: 6000 })
      return
    }
    this.joiningDemo.set(true)
    const jr = await this.troupeApi.joinTroupe(demoId)
    this.joiningDemo.set(false)
    if (!jr.ok) {
      this.snack.open('Impossible de rejoindre la troupe de démonstration.', 'OK', { duration: 6000 })
      return
    }
    this.snack.open('Vous avez rejoint la troupe de démonstration.', 'OK', { duration: 4000 })
    this.loadingList.set(true)
    const refreshed = await this.troupeContext.reloadAndSelect(demoId)
    if (refreshed) {
      await this.loadSelectedTroupeSeasons(0)
    } else {
      this.loadingList.set(false)
      this.snack.open('Adhésion enregistrée, mais le rechargement des troupes a échoué.', 'OK', {
        duration: 6000,
      })
    }
  }

  protected async loadTroupeAndSeasons(page: number): Promise<boolean> {
    this.loadingList.set(true)
    this.loadError.set(false)
    const loaded = await this.troupeContext.load()
    if (!loaded) {
      this.loadingList.set(false)
      this.loadError.set(true)
      this.snack.open('Impossible de charger vos troupes.', 'OK', { duration: 6000 })
      return false
    }
    return this.loadSelectedTroupeSeasons(page)
  }

  private async loadSelectedTroupeSeasons(page: number): Promise<boolean> {
    const troupe = this.selectedTroupe()
    if (!troupe) {
      this.loadError.set(false)
      this.hasMembership.set(false)
      this.canManageSeasons.set(false)
      this.troupeId.set(null)
      this.seasons.set([])
      this.totalElements.set(0)
      this.loadingList.set(false)
      return true
    }
    this.loadError.set(false)
    this.hasMembership.set(true)
    const tid = troupe.id
    this.troupeId.set(tid)
    this.canManageSeasons.set(troupe.membership.baselineRole === 'TROUPE_ADMIN')
    const sr = await this.api.listSeasons(tid, page, PAGE_SIZE)
    this.loadingList.set(false)
    if (!sr.ok || !sr.data) {
      this.snack.open('Impossible de charger les saisons.', 'OK', { duration: 6000 })
      return false
    }
    this.seasons.set(sr.data.content)
    this.totalElements.set(sr.data.totalElements)
    this.pageIndex.set(sr.data.page)
    return true
  }

  protected onPage(ev: PageEvent): void {
    void this.loadTroupeAndSeasons(ev.pageIndex)
  }

  protected onTroupeChange(ev: MatSelectChange): void {
    const troupeId = String(ev.value)
    if (troupeId === this.troupeId()) {
      return
    }
    if (!this.troupeContext.selectTroupe(troupeId)) {
      this.snack.open('Troupe introuvable.', 'OK', { duration: 5000 })
      return
    }
    this.dialog.closeAll()
    this.pageIndex.set(0)
    this.loadingList.set(true)
    void this.loadSelectedTroupeSeasons(0)
  }

  protected openCard(season: SeasonResponse): void {
    void this.router.navigate(['/saison', season.slug])
  }

  protected openCreate(): void {
    const tid = this.troupeId()
    if (!tid) {
      return
    }
    if (!this.canManageSeasons()) {
      this.snack.open('Vous ne pouvez pas créer de saison dans cette troupe.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<SeasonFormDialog, SeasonFormDialogData, boolean>(
      SeasonFormDialog,
      {
        data: { mode: 'create', troupeId: tid },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.loadTroupeAndSeasons(this.pageIndex())
        this.snack.open('Saison créée.', 'OK', { duration: 4000 })
      }
    })
  }

  protected openEdit(season: SeasonResponse): void {
    const tid = this.troupeId()
    if (!tid) {
      return
    }
    if (!this.canManageSeasons()) {
      this.snack.open('Vous ne pouvez pas modifier cette saison.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<SeasonFormDialog, SeasonFormDialogData, boolean>(
      SeasonFormDialog,
      {
        data: { mode: 'edit', troupeId: tid, season },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.loadTroupeAndSeasons(this.pageIndex())
        this.snack.open('Saison mise à jour.', 'OK', { duration: 4000 })
      }
    })
  }

  protected confirmArchive(season: SeasonResponse): void {
    if (!this.canManageSeasons()) {
      this.snack.open('Vous ne pouvez pas archiver cette saison.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Archiver la saison',
        message: `Archiver « ${season.title} » ? Elle ne sera plus active.`,
        confirmLabel: 'Archiver',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runArchive(season.id)
      }
    })
  }

  private async runArchive(seasonId: string): Promise<void> {
    const r = await this.api.archiveSeason(seasonId)
    if (r.ok) {
      this.snack.open('Saison archivée.', 'OK', { duration: 4000 })
      await this.loadTroupeAndSeasons(this.pageIndex())
    } else {
      this.snack.open('Archivage impossible.', 'OK', { duration: 6000 })
    }
  }

  protected confirmActivate(season: SeasonResponse): void {
    if (!this.canManageSeasons()) {
      this.snack.open('Vous ne pouvez pas activer cette saison.', 'OK', { duration: 5000 })
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Activer la saison',
        message: `Activer « ${season.title} » ? Les autres saisons actives seront désactivées.`,
        confirmLabel: 'Activer',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runActivate(season.id)
      }
    })
  }

  private async runActivate(seasonId: string): Promise<void> {
    const r = await this.api.activateSeason(seasonId)
    if (r.ok) {
      this.snack.open('Saison activée.', 'OK', { duration: 4000 })
      await this.loadTroupeAndSeasons(this.pageIndex())
    } else {
      this.snack.open('Activation impossible.', 'OK', { duration: 6000 })
    }
  }
}
