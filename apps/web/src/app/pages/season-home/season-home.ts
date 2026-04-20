import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService } from '../../core/auth/auth-api.service'
import {
  type EventResponse,
  EventApiService,
  type EventListScope,
} from '../../core/events/event-api.service'
import { SeasonApiService, type SeasonResponse } from '../../core/seasons/season-api.service'
import {
  ConfirmDialog,
  type ConfirmDialogData,
} from '../seasons-list/confirm-dialog'
import {
  EventFormDialog,
  type EventFormDialogData,
} from './event-form-dialog'

const PAGE_SIZE = 20

@Component({
  selector: 'app-season-home',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './season-home.html',
  styleUrl: './season-home.scss',
})
export class SeasonHome implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loadingSession = signal(true)
  protected readonly loadingSeason = signal(false)
  protected readonly loadingEvents = signal(false)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly events = signal<EventResponse[]>([])
  protected readonly totalElements = signal(0)
  protected readonly pageIndex = signal(0)
  protected readonly pageSize = PAGE_SIZE

  /** Si true : liste `all` (passés + archivés visibles). Si false : `upcoming` (agenda). */
  protected readonly showPastAndArchived = signal(false)

  async ngOnInit(): Promise<void> {
    try {
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
      await this.loadTroupeAndSeason()
    } finally {
      this.loadingSession.set(false)
    }
  }

  protected scope(): EventListScope {
    return this.showPastAndArchived() ? 'all' : 'upcoming'
  }

  protected onShowPastToggle(checked: boolean): void {
    this.showPastAndArchived.set(checked)
    this.pageIndex.set(0)
    void this.loadEvents()
  }

  protected onPage(ev: PageEvent): void {
    this.pageIndex.set(ev.pageIndex)
    void this.loadEvents()
  }

  private async loadTroupeAndSeason(): Promise<void> {
    const slug = this.slug()
    if (!slug) {
      return
    }
    this.loadingSeason.set(true)
    const tr = await this.seasonsApi.listTroupes()
    if (!tr.ok || !tr.data?.length) {
      this.loadingSeason.set(false)
      this.snack.open('Impossible de charger les troupes.', 'OK', { duration: 6000 })
      return
    }
    const tid = tr.data[0].id
    this.troupeId.set(tid)
    const sr = await this.seasonsApi.getSeasonBySlug(tid, slug)
    this.loadingSeason.set(false)
    if (!sr.ok || !sr.data) {
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }
    this.season.set(sr.data)
    await this.loadEvents()
  }

  private async loadEvents(allowPageFallback = true): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    this.loadingEvents.set(true)
    const r = await this.eventsApi.listEvents(
      s.id,
      this.pageIndex(),
      PAGE_SIZE,
      this.scope(),
    )
    this.loadingEvents.set(false)
    if (!r.ok || !r.data) {
      this.snack.open('Impossible de charger les spectacles.', 'OK', { duration: 6000 })
      return
    }

    if (
      allowPageFallback &&
      r.data.content.length === 0 &&
      r.data.totalElements > 0 &&
      this.pageIndex() > 0
    ) {
      this.pageIndex.set(this.pageIndex() - 1)
      await this.loadEvents(false)
      return
    }

    this.events.set(r.data.content)
    this.totalElements.set(r.data.totalElements)
  }

  protected formatStart(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso))
  }

  protected openCreate(): void {
    const s = this.season()
    if (!s) {
      return
    }
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, boolean>(
      EventFormDialog,
      {
        data: { mode: 'create', seasonId: s.id },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.loadTroupeAndSeason()
        this.snack.open('Spectacle créé.', 'OK', { duration: 4000 })
      }
    })
  }

  protected openEdit(ev: EventResponse): void {
    const s = this.season()
    if (!s) {
      return
    }
    const ref = this.dialog.open<EventFormDialog, EventFormDialogData, boolean>(
      EventFormDialog,
      {
        data: { mode: 'edit', seasonId: s.id, event: ev },
        width: 'min(100vw - 2rem, 28rem)',
      },
    )
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.loadEvents()
        void this.refreshSeasonCounts()
        this.snack.open('Spectacle mis à jour.', 'OK', { duration: 4000 })
      }
    })
  }

  protected confirmArchive(ev: EventResponse): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Archiver le spectacle',
        message: `Archiver « ${ev.title} » ? Il disparaîtra de la vue « à venir » pour les membres.`,
        confirmLabel: 'Archiver',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.runArchive(ev)
      }
    })
  }

  private async runArchive(ev: EventResponse): Promise<void> {
    const s = this.season()
    if (!s) {
      return
    }
    const r = await this.eventsApi.archiveEvent(s.id, ev.id)
    if (r.ok) {
      this.snack.open('Spectacle archivé.', 'OK', { duration: 4000 })
      await this.loadEvents()
      await this.refreshSeasonCounts()
    } else {
      this.snack.open('Archivage impossible.', 'OK', { duration: 6000 })
    }
  }

  private async refreshSeasonCounts(): Promise<void> {
    const s = this.season()
    const tid = this.troupeId()
    if (!s || !tid) {
      return
    }
    const r = await this.seasonsApi.getSeason(s.id)
    if (r.ok && r.data) {
      this.season.set(r.data)
    }
  }
}
