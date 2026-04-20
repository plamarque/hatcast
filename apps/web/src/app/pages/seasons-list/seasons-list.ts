import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  type SeasonResponse,
  SeasonApiService,
} from '../../core/seasons/season-api.service'
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
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './seasons-list.html',
  styleUrl: './seasons-list.scss',
})
export class SeasonsList implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly api = inject(SeasonApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  protected readonly loadingSession = signal(true)
  protected readonly loadingList = signal(false)
  protected readonly seasons = signal<SeasonResponse[]>([])
  protected readonly troupeId = signal<string | null>(null)
  protected readonly totalElements = signal(0)
  protected readonly pageIndex = signal(0)
  protected readonly pageSize = PAGE_SIZE

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

  protected async loadTroupeAndSeasons(page: number): Promise<void> {
    this.loadingList.set(true)
    const tr = await this.api.listTroupes()
    if (!tr.ok || !tr.data?.length) {
      this.loadingList.set(false)
      this.snack.open('Impossible de charger les troupes.', 'OK', { duration: 6000 })
      return
    }
    const tid = tr.data[0].id
    this.troupeId.set(tid)
    const sr = await this.api.listSeasons(tid, page, PAGE_SIZE)
    this.loadingList.set(false)
    if (!sr.ok || !sr.data) {
      this.snack.open('Impossible de charger les saisons.', 'OK', { duration: 6000 })
      return
    }
    this.seasons.set(sr.data.content)
    this.totalElements.set(sr.data.totalElements)
    this.pageIndex.set(sr.data.page)
  }

  protected onPage(ev: PageEvent): void {
    void this.loadTroupeAndSeasons(ev.pageIndex)
  }

  protected openCard(season: SeasonResponse): void {
    void this.router.navigate(['/saison', season.slug])
  }

  protected openCreate(): void {
    const tid = this.troupeId()
    if (!tid) {
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
