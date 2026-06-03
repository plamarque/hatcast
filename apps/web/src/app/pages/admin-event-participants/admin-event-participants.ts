import { NgTemplateOutlet } from '@angular/common'
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
  canAssignOrganizerRole,
  findRowOrganizer,
  isRowOrganizer,
  normalizeEmail,
  organizerRoleMenuLabel,
  ORGANIZER_LIST_RELOAD_FAILED,
  PARTICIPANT_ROLE_LABEL,
  PARTICIPATION_ROLE_UPDATE_FAILED,
  participationRoleChipLabel,
  PROMOTE_TOOLTIP,
} from '../../shared/admin-organizer-row/organizer-row.helper'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { EditParticipantDialog } from '../../shared/edit-participant-dialog/edit-participant-dialog'
import { AddEventParticipantDialog } from './add-event-participant-dialog'

@Component({
  selector: 'app-admin-event-participants',
  imports: [
    NgTemplateOutlet,
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

  protected readonly participantRoleLabel = PARTICIPANT_ROLE_LABEL
  protected readonly eventOrganizerMenuLabel = organizerRoleMenuLabel('spectacle')
  protected readonly promoteTooltip = PROMOTE_TOOLTIP
  protected readonly canAssignOrganizerRole = canAssignOrganizerRole
  protected readonly participationRoleMenuParticipant =
    signal<EventRosterParticipant | null>(null)

  protected readonly seasonSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('seasonSlug') ?? '')),
    { initialValue: '' },
  )
  protected readonly routeTroupeSlug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('troupeSlug') ?? '')),
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
  protected readonly troupeLogoUrl = signal<string | null>(null)
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

  protected readonly hasAnyFilteredParticipantResults = computed(
    () =>
      this.filteredMemberRoster().length > 0 || this.filteredExternalRoster().length > 0,
  )

  protected readonly hasSearchQuery = computed(() => this.debouncedSearch().trim().length > 0)

  protected readonly seasonAdminParticipantsLink = computed(() =>
    saisonAdminParticipantsPath(this.routeTroupeSlug(), this.seasonSlug()),
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
        map((p) => ({
          troupeSlug: p.get('troupeSlug') ?? '',
          seasonSlug: p.get('seasonSlug') ?? '',
          eventSlug: p.get('eventSlug') ?? '',
        })),
        distinctUntilChanged(
          (a, b) =>
            a.troupeSlug === b.troupeSlug &&
            a.seasonSlug === b.seasonSlug &&
            a.eventSlug === b.eventSlug,
        ),
      )
      .subscribe(({ troupeSlug, seasonSlug, eventSlug }) => {
        void this.loadPage(troupeSlug, seasonSlug, eventSlug)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
  }

  protected eventDetailLink(): string[] {
    return saisonEventPath(this.routeTroupeSlug(), this.seasonSlug(), this.eventSlug())
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

  protected isEditableRosterParticipant(participant: EventRosterParticipant): boolean {
    if (participant.source === 'EVENT') {
      return !!participant.eventParticipantId
    }
    return participant.kind !== 'MEMBER' && !!participant.seasonParticipantId
  }

  protected openEditRosterParticipant(participant: EventRosterParticipant): void {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    if (!seasonId || !eventId || !this.isEditableRosterParticipant(participant)) {
      return
    }
    const ref = this.dialog.open(EditParticipantDialog, {
      data:
        participant.source === 'EVENT' && participant.eventParticipantId
          ? {
              scope: 'event',
              seasonId,
              eventId,
              participantId: participant.eventParticipantId,
              displayName: participant.displayName,
              email: participant.email,
            }
          : {
              scope: 'season',
              seasonId,
              participantId: participant.seasonParticipantId!,
              displayName: participant.displayName,
              email: participant.email,
            },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadRoster('Participant mis à jour.')
        void this.reloadEventOrganizers()
      }
    })
  }

  protected isEventOrganizer(participant: EventRosterParticipant): boolean {
    return isRowOrganizer(participant.userId, participant.email, this.eventOrganizers())
  }

  protected participationRoleChipLabel(participant: EventRosterParticipant): string {
    return participationRoleChipLabel(
      this.isEventOrganizer(participant),
      this.participationRoleMenuEnabled(participant),
    )
  }

  protected participationRoleMenuEnabled(participant: EventRosterParticipant): boolean {
    if (!this.canManageEventOrganizers()) {
      return false
    }
    return (
      canAssignOrganizerRole(participant.email) || this.isEventOrganizer(participant)
    )
  }

  protected openParticipationRoleMenu(participant: EventRosterParticipant): void {
    this.participationRoleMenuParticipant.set(participant)
  }

  protected async selectEventParticipationRole(wantOrganizer: boolean): Promise<void> {
    const participant = this.participationRoleMenuParticipant()
    this.participationRoleMenuParticipant.set(null)
    if (!participant) {
      return
    }
    const isOrganizer = this.isEventOrganizer(participant)
    if (wantOrganizer === isOrganizer) {
      return
    }
    if (wantOrganizer) {
      if (!canAssignOrganizerRole(participant.email)) {
        this.snack.open(this.promoteTooltip, 'OK', { duration: 5000 })
        return
      }
      await this.promoteEventOrganizer(participant)
    } else {
      await this.demoteEventOrganizer(participant)
    }
  }

  protected confirmRemoveFromEvent(participant: EventRosterParticipant): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer du spectacle',
        message: `Retirer « ${participant.displayName} » de ce spectacle ?`,
        confirmLabel: 'Retirer',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.removeFromEvent(participant)
      }
    })
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

  private async demoteEventOrganizer(participant: EventRosterParticipant): Promise<void> {
    const organizer = findRowOrganizer(
      participant.userId,
      participant.email,
      this.eventOrganizers(),
    )
    if (!organizer) {
      this.snack.open(PARTICIPATION_ROLE_UPDATE_FAILED, 'OK', { duration: 5000 })
      return
    }
    await this.removeEventOrganizer(organizer.userId)
  }

  private async promoteEventOrganizer(participant: EventRosterParticipant): Promise<void> {
    const seasonId = this.seasonId()
    const eventId = this.event()?.id
    const email = normalizeEmail(participant.email)
    if (!seasonId || !eventId || !email) {
      this.snack.open(this.promoteTooltip, 'OK', { duration: 5000 })
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
      return
    }
    if (message) {
      this.snack.open(ORGANIZER_LIST_RELOAD_FAILED, 'OK', { duration: 5000 })
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

  private async loadPage(
    troupeSlug: string,
    seasonSlug: string,
    eventSlugParam: string,
  ): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.event.set(null)
    this.roster.set([])
    this.eventOrganizers.set([])
    if (!troupeSlug || !seasonSlug || !eventSlugParam) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonInTroupe(
      troupeSlug,
      seasonSlug,
    )
    if (requestId !== this.loadRequestId) {
      return
    }
    if (resolved.kind !== 'resolved') {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }

    this.season.set(resolved.season)
    this.seasonId.set(resolved.season.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeSlug.set(resolved.troupe.slug)
    this.troupeLogoUrl.set(resolved.troupe.logoUrl ?? null)

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
