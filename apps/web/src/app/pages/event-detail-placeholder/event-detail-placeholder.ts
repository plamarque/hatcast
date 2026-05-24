import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { OrganizerApiService } from '../../core/permissions/organizer-api.service'
import { canManageComposition } from '../../core/permissions/organizer-permissions'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { compositionStatusHint } from '../../core/composition/composition-status-hint'
import { EventDisposTab } from '../../shared/availability/event-dispos-tab'
import { CompositionStatusBadge } from '../../shared/composition/composition-status-badge'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'
import { getEventTypeIcon } from '../../core/events/event-types'

type EventDetailTab = 'infos' | 'dispos' | 'equipe'

@Component({
  selector: 'app-event-detail-placeholder',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterLink,
    EventDisposTab,
    CompositionStatusBadge,
  ],
  templateUrl: './event-detail-placeholder.html',
  styleUrl: './event-detail-placeholder.scss',
})
export class EventDetailPlaceholder implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly eventsApi = inject(EventApiService)
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
  protected readonly eventId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('eventId') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly event = signal<EventResponse | null>(null)
  protected readonly seasonId = signal('')
  protected readonly troupeId = signal('')
  protected readonly currentUserId = signal('')
  protected readonly canSwitchSubject = signal(false)
  protected readonly activeTab = signal<EventDetailTab>('infos')

  async ngOnInit(): Promise<void> {
    const session = await this.auth.ensureHatcastSession()
    if (!session.ok) {
      await this.router.navigate(['/connexion'], { replaceUrl: true })
      return
    }
    this.currentUserId.set(session.data?.user.id ?? '')

    this.querySubscription = this.route.queryParamMap
      .pipe(map((p) => p.get('tab')))
      .subscribe((tab) => {
        if (tab === 'dispos' || tab === 'equipe' || tab === 'infos') {
          this.activeTab.set(tab)
        }
      })

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
    this.querySubscription.unsubscribe()
  }

  protected onTabChange(index: number): void {
    const tabs: EventDetailTab[] = ['infos', 'dispos', 'equipe']
    const tab = tabs[index] ?? 'infos'
    this.activeTab.set(tab)
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    })
  }

  protected tabIndex(): number {
    const tabs: EventDetailTab[] = ['infos', 'dispos', 'equipe']
    return Math.max(0, tabs.indexOf(this.activeTab()))
  }

  private async loadEvent(slug: string, eventId: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.event.set(null)
    if (!slug || !eventId) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(slug)
    if (requestId !== this.loadRequestId) {
      return
    }
    if (resolved.kind === 'no-membership' || resolved.kind === 'error') {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'ambiguous') {
      this.loading.set(false)
      this.snack.open('Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.', 'OK', {
        duration: 8000,
      })
      return
    }
    if (resolved.kind === 'not-found') {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    this.seasonId.set(resolved.season.id)
    this.troupeId.set(resolved.troupe.id)

    const [eventResult, permissionsResult] = await Promise.all([
      this.eventsApi.getEvent(resolved.season.id, eventId),
      this.organizerApi.mySeasonPermissions(resolved.season.id),
    ])

    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!eventResult.ok || !eventResult.data) {
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
      return
    }
    const found = eventResult.data
    this.event.set(found)

    this.canSwitchSubject.set(
      permissionsResult.ok && permissionsResult.data
        ? canManageComposition(permissionsResult.data, found.id)
        : false,
    )
  }

  protected compositionStatusHint(ev: EventResponse): string | null {
    return compositionStatusHint(ev.compositionLifecycle)
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
