import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { EventApiService, type EventResponse } from '../../core/events/event-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  saisonAdminParticipantsPath,
  saisonEventPath,
} from '../../core/navigation/troupe-routes'
import { UUID_IN_PATH_REGEX } from '../../core/navigation/url-slug'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type EventRosterParticipant,
  type ParticipantKind,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-admin-event-participants',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    ContextBreadcrumb,
    UserAvatarComponent,
  ],
  templateUrl: './admin-event-participants.html',
  styleUrl: './admin-event-participants.scss',
})
export class AdminEventParticipants implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly eventsApi = inject(EventApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly seasonSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )
  protected readonly eventSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('eventSlug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly event = signal<EventResponse | null>(null)
  protected readonly seasonId = signal('')
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly roster = signal<EventRosterParticipant[]>([])
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')
  protected readonly addDisplayName = signal('')
  protected readonly addEmail = signal('')

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.season()?.title.trim() &&
      !!this.event()?.title.trim(),
  )

  protected readonly filteredRoster = computed(() => {
    const q = this.debouncedSearch().trim().toLowerCase()
    let list = this.roster()
    if (q) {
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          (p.email?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  })

  protected readonly seasonAdminParticipantsLink = computed(() =>
    saisonAdminParticipantsPath(this.seasonSlug()),
  )

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
        map((p) => ({ slug: p.get('slug') ?? '', eventSlug: p.get('eventSlug') ?? '' })),
        distinctUntilChanged((a, b) => a.slug === b.slug && a.eventSlug === b.eventSlug),
      )
      .subscribe(({ slug, eventSlug }) => {
        void this.loadPage(slug, eventSlug)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
  }

  protected userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  protected eventDetailLink(): string[] {
    return saisonEventPath(this.seasonSlug(), this.eventSlug())
  }

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value)
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value)
    }, 150)
  }

  protected sourceLabel(source: EventRosterParticipant['source']): string {
    return source === 'SEASON' ? 'Saison' : 'Spectacle'
  }

  protected kindLabel(kind: ParticipantKind): string {
    switch (kind) {
      case 'MEMBER':
        return 'Membre troupe'
      case 'LINKED':
        return 'Lié'
      case 'NAME_ONLY':
        return 'Nom seul'
      default:
        return 'Externe'
    }
  }

  protected rosterKey(participant: EventRosterParticipant): string {
    return participant.seasonParticipantId ?? participant.eventParticipantId ?? participant.displayName
  }

  protected async addEventOnlyParticipant(): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    const displayName = this.addDisplayName().trim()
    if (!seasonId || !eventId || !displayName) {
      this.snack.open('Saisissez un nom.', 'OK', { duration: 4000 })
      return
    }
    this.saving.set(true)
    try {
      const email = this.addEmail().trim()
      const r = await this.participantApi.createEventParticipant(seasonId, eventId, {
        displayName,
        email: email || undefined,
      })
      if (!r.ok) {
        this.snack.open(r.status === 403 ? 'Accès non autorisé.' : 'Ajout impossible.', 'OK', {
          duration: 5000,
        })
        return
      }
      this.addDisplayName.set('')
      this.addEmail.set('')
      await this.reloadRoster('Participant ajouté au spectacle.')
    } finally {
      this.saving.set(false)
    }
  }

  protected async removeFromEvent(participant: EventRosterParticipant): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId) {
      return
    }
    this.saving.set(true)
    try {
      const r =
        participant.source === 'SEASON' && participant.seasonParticipantId
          ? await this.participantApi.excludeSeasonParticipantFromEvent(
              seasonId,
              eventId,
              participant.seasonParticipantId,
            )
          : participant.eventParticipantId
            ? await this.participantApi.removeEventParticipant(
                seasonId,
                eventId,
                participant.eventParticipantId,
              )
            : { ok: false, status: 0 }
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadRoster('Participant retiré du spectacle.')
    } finally {
      this.saving.set(false)
    }
  }

  private async loadPage(seasonSlug: string, eventSlugParam: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.event.set(null)
    this.roster.set([])
    if (!seasonSlug || !eventSlugParam) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(seasonSlug)
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
      this.snack.open(
        'Cette saison existe dans plusieurs troupes. Choisissez d’abord la troupe depuis la liste des saisons.',
        'OK',
        { duration: 8000 },
      )
      return
    }
    if (resolved.kind === 'not-found') {
      this.loading.set(false)
      this.snack.open('Saison introuvable.', 'OK', { duration: 6000 })
      return
    }

    this.season.set(resolved.season)
    this.seasonId.set(resolved.season.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeSlug.set(resolved.troupe.slug)

    const isUuid = UUID_IN_PATH_REGEX.test(eventSlugParam)
    const [eventResult, permissionsResult] = await Promise.all([
      isUuid
        ? this.eventsApi.getEvent(resolved.season.id, eventSlugParam)
        : this.eventsApi.getEventBySlug(resolved.season.id, eventSlugParam),
      this.organizerApi.mySeasonPermissions(resolved.season.id),
    ])
    if (requestId !== this.loadRequestId) {
      return
    }
    if (!eventResult.ok || !eventResult.data) {
      this.loading.set(false)
      this.snack.open('Spectacle introuvable.', 'OK', { duration: 6000 })
      return
    }
    if (!permissionsResult.ok || !permissionsResult.data) {
      this.loading.set(false)
      this.snack.open('Accès non autorisé.', 'OK', { duration: 6000 })
      await this.router.navigate(this.eventDetailLink(), { replaceUrl: true })
      return
    }
    const perms = permissionsResult.data
    const canManage =
      perms.canManageEventParticipants ||
      perms.canManageSeasonParticipants ||
      perms.eventParticipantAdminFor.includes(eventResult.data.id)
    if (!canManage) {
      this.loading.set(false)
      this.snack.open('Vous ne pouvez pas gérer les participants de ce spectacle.', 'OK', {
        duration: 6000,
      })
      await this.router.navigate(this.eventDetailLink(), { replaceUrl: true })
      return
    }

    this.permissions.set(perms)
    this.event.set(eventResult.data)
    const rosterResult = await this.participantApi.listEventParticipantRoster(
      resolved.season.id,
      eventResult.data.id,
    )
    if (requestId !== this.loadRequestId) {
      return
    }
    this.loading.set(false)
    if (!rosterResult.ok || !rosterResult.data) {
      this.snack.open('Impossible de charger les participants.', 'OK', { duration: 6000 })
      return
    }
    this.roster.set(rosterResult.data)
  }

  private async reloadRoster(message: string): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId) {
      return
    }
    const r = await this.participantApi.listEventParticipantRoster(seasonId, eventId)
    if (r.ok && r.data) {
      this.roster.set(r.data)
      this.snack.open(message, 'OK', { duration: 4000 })
    }
  }
}
