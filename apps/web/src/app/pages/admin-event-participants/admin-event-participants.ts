import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatDialog } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
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
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type EventRosterParticipant,
  type ParticipantKind,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import {
  DEMOTE_ORGANIZER_LABEL,
  findRowOrganizer,
  isPromotableOrganizerRow,
  isRowOrganizer,
  organizerChipTooltip,
  organizerOffRosterNotice,
  organizersOffRoster,
  ORGANIZER_CHIP_LABEL,
  PROMOTE_ORGANIZER_LABEL,
  PROMOTE_TOOLTIP,
  rosterIdentitySets,
} from '../../shared/admin-organizer-row/organizer-row.helper'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { AddEventParticipantDialog } from './add-event-participant-dialog'

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
    MatTooltipModule,
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
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly organizerChipLabel = ORGANIZER_CHIP_LABEL
  protected readonly promoteOrganizerLabel = PROMOTE_ORGANIZER_LABEL
  protected readonly demoteOrganizerLabel = DEMOTE_ORGANIZER_LABEL
  protected readonly promoteTooltip = PROMOTE_TOOLTIP
  protected readonly organizerChipTooltip = () => organizerChipTooltip('spectacle')

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
  protected readonly eventOrganizers = signal<OrganizerResponse[]>([])
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.season()?.title.trim() &&
      !!this.event()?.title.trim(),
  )

  protected readonly filteredMemberRoster = computed(() =>
    this.filterRosterBySearch(this.roster().filter((p) => p.source === 'SEASON')),
  )

  protected readonly filteredExternalRoster = computed(() =>
    this.filterRosterBySearch(this.roster().filter((p) => p.source === 'EVENT')),
  )

  protected readonly memberRosterCount = computed(
    () => this.roster().filter((p) => p.source === 'SEASON').length,
  )

  protected readonly externalRosterCount = computed(
    () => this.roster().filter((p) => p.source === 'EVENT').length,
  )

  protected readonly canManageEventOrganizers = computed(() => {
    const ev = this.event()
    const perms = this.permissions()
    if (!ev || !perms) {
      return false
    }
    if (perms.canManageEventOrganizers) {
      return true
    }
    return perms.eventOrganizerFor.includes(ev.id)
  })

  protected readonly eventOrganizersOffRoster = computed(() => {
    const { userIds, emails } = rosterIdentitySets(this.roster())
    return organizersOffRoster(this.eventOrganizers(), userIds, emails)
  })

  protected readonly eventOrganizersOffRosterNotice = computed(() =>
    organizerOffRosterNotice(this.eventOrganizersOffRoster()),
  )

  protected readonly hasAnyFilteredParticipantResults = computed(
    () =>
      this.filteredMemberRoster().length > 0 || this.filteredExternalRoster().length > 0,
  )

  protected readonly hasSearchQuery = computed(() => this.debouncedSearch().trim().length > 0)

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

  protected showKindChip(kind: ParticipantKind): boolean {
    return kind !== 'MEMBER'
  }

  protected isEventOrganizer(participant: EventRosterParticipant): boolean {
    return isRowOrganizer(participant.userId, participant.email, this.eventOrganizers())
  }

  protected isPromotable(participant: EventRosterParticipant): boolean {
    return isPromotableOrganizerRow(participant.userId, participant.email)
  }

  protected openAddDialog(): void {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId) {
      return
    }
    const ref = this.dialog.open(AddEventParticipantDialog, {
      data: { seasonId, eventId },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadRoster('Participant ajouté au spectacle.')
      }
    })
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

  protected confirmDemoteEventOrganizer(participant: EventRosterParticipant): void {
    const organizer = findRowOrganizer(
      participant.userId,
      participant.email,
      this.eventOrganizers(),
    )
    if (!organizer) {
      return
    }
    const label = organizer.displayName || organizer.email
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer l’organisateur·ice',
        message: `Retirer « ${label} » des organisateur·ices de ce spectacle ?`,
        confirmLabel: 'Retirer',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.removeEventOrganizer(organizer.userId)
      }
    })
  }

  protected async promoteEventOrganizer(participant: EventRosterParticipant): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    const email = participant.email?.trim()
    if (!seasonId || !eventId || !email) {
      return
    }
    this.saving.set(true)
    try {
      const r = await this.organizerApi.addEventOrganizer(seasonId, eventId, email)
      if (!r.ok) {
        this.snack.open('Promotion impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadEventOrganizers('Organisateur·ice ajouté·e.')
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
    const canRemove =
      (participant.source === 'SEASON' && !!participant.seasonParticipantId) ||
      !!participant.eventParticipantId
    if (!canRemove) {
      this.snack.open('Participant introuvable — rechargez la page.', 'OK', { duration: 5000 })
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
          : await this.participantApi.removeEventParticipant(
              seasonId,
              eventId,
              participant.eventParticipantId!,
            )
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadRoster('Participant retiré du spectacle.')
    } finally {
      this.saving.set(false)
    }
  }

  private async removeEventOrganizer(userId: string): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId) {
      return
    }
    this.saving.set(true)
    try {
      const r = await this.organizerApi.removeEventOrganizer(seasonId, eventId, userId)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadEventOrganizers('Organisateur·ice retiré·e.')
    } finally {
      this.saving.set(false)
    }
  }

  private async reloadEventOrganizers(message?: string): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId) {
      return
    }
    const r = await this.organizerApi.listEventOrganizers(seasonId, eventId)
    if (r.ok && r.data) {
      this.eventOrganizers.set(r.data)
      if (message) {
        this.snack.open(message, 'OK', { duration: 4000 })
      }
    }
  }

  private filterRosterBySearch(list: EventRosterParticipant[]): EventRosterParticipant[] {
    const q = this.debouncedSearch().trim().toLowerCase()
    if (!q) {
      return list
    }
    return list.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        (p.email?.toLowerCase().includes(q) ?? false),
    )
  }

  private async loadPage(seasonSlug: string, eventSlugParam: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.event.set(null)
    this.roster.set([])
    this.eventOrganizers.set([])
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
    const [rosterResult] = await Promise.all([
      this.participantApi.listEventParticipantRoster(resolved.season.id, eventResult.data.id),
      this.reloadEventOrganizers(),
    ])
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
      return
    }
    this.snack.open('Impossible de rafraîchir la liste.', 'OK', { duration: 5000 })
  }
}
