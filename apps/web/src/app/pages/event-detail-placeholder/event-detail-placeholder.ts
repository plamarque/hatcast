import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { SeasonApiService } from '../../core/seasons/season-api.service'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'
import { getEventTypeIcon } from '../../core/events/event-types'

const EVENT_DETAIL_PAGE_SIZE = 100

@Component({
  selector: 'app-event-detail-placeholder',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
  ],
  templateUrl: './event-detail-placeholder.html',
  styleUrl: './event-detail-placeholder.scss',
})
export class EventDetailPlaceholder implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly seasonsApi = inject(SeasonApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )
  protected readonly eventId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('eventId') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly event = signal<EventResponse | null>(null)

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => ({
          slug: p.get('slug') ?? '',
          eventId: p.get('eventId') ?? '',
        })),
        distinctUntilChanged((a, b) => a.slug === b.slug && a.eventId === b.eventId),
      )
      .subscribe(({ slug, eventId }) => {
        void this.loadEvent(slug, eventId)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
  }

  private async loadEvent(slug: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.event.set(null)
    if (!slug || !eventId) {
      this.loading.set(false)
      return
    }

    const tr = await this.seasonsApi.listTroupes()
    if (requestId !== this.loadRequestId) {
      return
    }
    if (!tr.ok || !tr.data?.length) {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }

    const sr = await this.seasonsApi.getSeasonBySlug(tr.data[0].id, slug)
    if (requestId !== this.loadRequestId) {
      return
    }
    if (!sr.ok || !sr.data) {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    const found = await this.findEventInSeason(sr.data.id, eventId)
    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    this.event.set(found)
    if (!found) {
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
    }
  }

  private async findEventInSeason(
    seasonId: string,
    eventId: string,
  ): Promise<EventResponse | null> {
    let page = 0
    while (true) {
      const er = await this.eventsApi.listEvents(seasonId, page, EVENT_DETAIL_PAGE_SIZE, 'all')
      if (!er.ok || !er.data) {
        this.snack.open('Impossible de charger le spectacle.', 'OK', { duration: 6000 })
        return null
      }

      const found = er.data.content.find((e) => e.id === eventId)
      if (found) {
        return found
      }
      if (er.data.content.length === 0 || page >= er.data.totalPages - 1) {
        return null
      }
      page += 1
    }
  }

  protected formatStart(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: AGENDA_TIME_ZONE,
    }).format(new Date(iso))
  }

  protected typeIcon(templateType: string): string {
    return getEventTypeIcon(templateType)
  }
}
