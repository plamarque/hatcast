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
import { ActivatedRoute, Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { saisonWorkspacePath } from '../../core/navigation/troupe-routes'
import {
  OrganizerApiService,
  type MySeasonPermissions,
  type OrganizerResponse,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type ParticipantKind,
  type SeasonParticipantAdmin,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeApiService } from '../../core/troupes/troupe-api.service'
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
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { EditParticipantDialog } from '../../shared/edit-participant-dialog/edit-participant-dialog'
import { AddParticipantDialog } from './add-participant-dialog'

@Component({
  selector: 'app-admin-participants',
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
    ContextBreadcrumb,
  ],
  templateUrl: './admin-participants.html',
  styleUrl: './admin-participants.scss',
})
export class AdminParticipants implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly troupeApi = inject(TroupeApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly participantRoleLabel = PARTICIPANT_ROLE_LABEL
  protected readonly seasonOrganizerMenuLabel = organizerRoleMenuLabel('saison')
  protected readonly promoteTooltip = PROMOTE_TOOLTIP
  protected readonly canAssignOrganizerRole = canAssignOrganizerRole
  protected readonly participationRoleMenuParticipant =
    signal<SeasonParticipantAdmin | null>(null)

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('seasonSlug') ?? p.get('slug') ?? ''),
    ),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly troupeSlug = signal<string | null>(null)
  protected readonly troupeLogoUrl = signal<string | null>(null)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly platformAdmin = signal(false)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly participants = signal<SeasonParticipantAdmin[]>([])
  protected readonly seasonOrganizers = signal<OrganizerResponse[]>([])
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.season()?.title.trim(),
  )

  protected readonly canManageSeasonOrganizers = computed(
    () => this.permissions()?.canManageSeasonOrganizers === true,
  )
  protected readonly canManageSeasonParticipants = computed(
    () =>
      this.platformAdmin() || this.permissions()?.canManageSeasonParticipants === true,
  )
  protected readonly canManageMembers = computed(
    () => this.permissions()?.canManageMembers === true,
  )
  protected readonly pageTitle = computed(() => 'Participants')

  protected readonly filteredExternalParticipants = computed(() =>
    this.filterParticipantsBySearch(
      this.participants().filter((p) => p.kind !== 'MEMBER'),
    ),
  )

  protected readonly filteredMemberParticipants = computed(() =>
    this.filterParticipantsBySearch(
      this.participants().filter((p) => p.kind === 'MEMBER'),
    ),
  )

  protected readonly externalParticipantCount = computed(
    () => this.participants().filter((p) => p.kind !== 'MEMBER').length,
  )

  protected readonly memberParticipantCount = computed(
    () => this.participants().filter((p) => p.kind === 'MEMBER').length,
  )

  protected readonly hasAnyFilteredParticipantResults = computed(
    () =>
      this.filteredExternalParticipants().length > 0 ||
      this.filteredMemberParticipants().length > 0,
  )

  protected readonly hasSearchQuery = computed(() => this.debouncedSearch().trim().length > 0)

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
    this.platformAdmin.set(session.data?.platformAdmin === true)
    this.routeSubscription = this.route.paramMap
      .pipe(
        map((p) => ({
          troupeSlug: p.get('troupeSlug') ?? '',
          seasonSlug: p.get('seasonSlug') ?? '',
        })),
        distinctUntilChanged(
          (a, b) => a.troupeSlug === b.troupeSlug && a.seasonSlug === b.seasonSlug,
        ),
      )
      .subscribe(({ troupeSlug, seasonSlug }) => {
        void this.loadPage(troupeSlug, seasonSlug)
      })
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe()
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
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

  protected isEditableParticipant(participant: SeasonParticipantAdmin): boolean {
    return participant.troupeMembershipId == null
  }

  protected openEditParticipant(participant: SeasonParticipantAdmin): void {
    const seasonId = this.season()?.id
    if (!seasonId || !this.isEditableParticipant(participant)) {
      return
    }
    const ref = this.dialog.open(EditParticipantDialog, {
      data: {
        scope: 'season',
        seasonId,
        participantId: participant.id,
        displayName: participant.displayName,
        email: participant.email,
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadParticipants('Participant mis à jour.')
        void this.reloadSeasonOrganizers()
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

  protected isSeasonOrganizer(participant: SeasonParticipantAdmin): boolean {
    return isRowOrganizer(participant.userId, participant.email, this.seasonOrganizers())
  }

  protected participationRoleChipLabel(participant: SeasonParticipantAdmin): string {
    return participationRoleChipLabel(
      this.isSeasonOrganizer(participant),
      this.participationRoleMenuEnabled(participant),
    )
  }

  protected participationRoleMenuEnabled(participant: SeasonParticipantAdmin): boolean {
    if (!this.canManageSeasonOrganizers()) {
      return false
    }
    return (
      canAssignOrganizerRole(participant.email) || this.isSeasonOrganizer(participant)
    )
  }

  protected openParticipationRoleMenu(participant: SeasonParticipantAdmin): void {
    this.participationRoleMenuParticipant.set(participant)
  }

  protected async selectSeasonParticipationRole(wantOrganizer: boolean): Promise<void> {
    const participant = this.participationRoleMenuParticipant()
    this.participationRoleMenuParticipant.set(null)
    if (!participant) {
      return
    }
    const isOrganizer = this.isSeasonOrganizer(participant)
    if (wantOrganizer === isOrganizer) {
      return
    }
    if (wantOrganizer) {
      if (!canAssignOrganizerRole(participant.email)) {
        this.snack.open(this.promoteTooltip, 'OK', { duration: 5000 })
        return
      }
      await this.promoteSeasonOrganizer(participant)
    } else {
      await this.demoteSeasonOrganizer(participant)
    }
  }

  protected openAddDialog(): void {
    const s = this.season()
    if (!s) return
    const ref = this.dialog.open(AddParticipantDialog, {
      data: { seasonId: s.id },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.reloadParticipants('Participant ajouté.')
      }
    })
  }

  protected canShowRemove(participant: SeasonParticipantAdmin): boolean {
    return participant.removable || this.isTroupeMemberRow(participant)
  }

  protected removeAriaLabel(participant: SeasonParticipantAdmin): string {
    return this.isTroupeMemberRow(participant)
      ? 'Retirer ce membre de la saison'
      : 'Retirer le participant'
  }

  protected isTroupeMemberRow(participant: SeasonParticipantAdmin): boolean {
    return (
      participant.kind === 'MEMBER' &&
      !!participant.troupeMembershipId &&
      this.canManageMembers()
    )
  }

  protected confirmRemove(participant: SeasonParticipantAdmin): void {
    if (this.isTroupeMemberRow(participant)) {
      this.confirmRemoveTroupeMember(participant)
      return
    }
    if (!participant.removable) {
      return
    }
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer le participant',
        message:
          'Le participant sera retiré du roster de la saison. L’historique des disponibilités et compositions est conservé.',
        confirmLabel: 'Retirer',
      },
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.removeParticipant(participant)
      }
    })
  }

  private confirmRemoveTroupeMember(participant: SeasonParticipantAdmin): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Retirer de cette saison ?',
        message:
          'Il disparaîtra du roster, des statistiques et des sélecteurs de cette saison. Son adhésion à la troupe est conservée.',
        confirmLabel: 'Retirer',
      },
      width: 'min(100vw - 2rem, 28rem)',
    })
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        void this.removeParticipant(participant, 'Membre retiré de la saison.')
      }
    })
  }

  private async demoteSeasonOrganizer(participant: SeasonParticipantAdmin): Promise<void> {
    const organizer = findRowOrganizer(
      participant.userId,
      participant.email,
      this.seasonOrganizers(),
    )
    if (!organizer) {
      this.snack.open(PARTICIPATION_ROLE_UPDATE_FAILED, 'OK', { duration: 5000 })
      return
    }
    await this.removeSeasonOrganizer(organizer.userId)
  }

  private async promoteSeasonOrganizer(participant: SeasonParticipantAdmin): Promise<void> {
    const seasonId = this.season()?.id
    const email = normalizeEmail(participant.email)
    if (!seasonId || !email) {
      this.snack.open(this.promoteTooltip, 'OK', { duration: 5000 })
      return
    }
    this.saving.set(true)
    try {
      const r = await this.organizerApi.addSeasonOrganizer(seasonId, email)
      if (!r.ok) {
        this.snack.open('Promotion impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadSeasonOrganizers('Organisateur·ice ajouté·e.')
    } finally {
      this.saving.set(false)
    }
  }

  private async removeParticipant(
    participant: SeasonParticipantAdmin,
    successMessage = 'Participant retiré.',
  ): Promise<void> {
    const s = this.season()
    if (!s) return
    this.saving.set(true)
    try {
      const r = await this.participantApi.removeSeasonParticipant(s.id, participant.id)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      const organizer = findRowOrganizer(
        participant.userId,
        participant.email,
        this.seasonOrganizers(),
      )
      if (organizer) {
        await this.organizerApi.removeSeasonOrganizer(s.id, organizer.userId)
        await this.reloadSeasonOrganizers()
      }
      await this.reloadParticipants(successMessage)
    } finally {
      this.saving.set(false)
    }
  }

  private async removeSeasonOrganizer(userId: string): Promise<void> {
    const seasonId = this.season()?.id
    if (!seasonId) {
      return
    }
    this.saving.set(true)
    try {
      const r = await this.organizerApi.removeSeasonOrganizer(seasonId, userId)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadSeasonOrganizers('Organisateur·ice retiré·e.')
    } finally {
      this.saving.set(false)
    }
  }

  private async reloadSeasonOrganizers(message?: string): Promise<void> {
    const seasonId = this.season()?.id
    if (!seasonId) {
      return
    }
    const r = await this.organizerApi.listSeasonOrganizers(seasonId)
    if (r.ok && r.data) {
      this.seasonOrganizers.set(r.data)
      if (message) {
        this.snack.open(message, 'OK', { duration: 4000 })
      }
      return
    }
    if (message) {
      this.snack.open(ORGANIZER_LIST_RELOAD_FAILED, 'OK', { duration: 5000 })
    }
  }

  private filterParticipantsBySearch(
    list: SeasonParticipantAdmin[],
  ): SeasonParticipantAdmin[] {
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

  private async reloadParticipants(message?: string): Promise<void> {
    const s = this.season()
    if (!s) return
    const r = await this.participantApi.listSeasonParticipants(s.id)
    if (r.ok && r.data) {
      this.participants.set(r.data)
      if (message) {
        this.snack.open(message, 'OK', { duration: 4000 })
      }
    }
  }

  private async loadPage(troupeSlug: string, seasonSlug: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.permissions.set(null)
    this.participants.set([])
    this.seasonOrganizers.set([])

    if (!troupeSlug || !seasonSlug) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonInTroupe(
      troupeSlug,
      seasonSlug,
    )
    if (requestId !== this.loadRequestId) return
    if (resolved.kind === 'no-membership' || resolved.kind === 'error' || resolved.kind === 'not-found') {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }
    if (resolved.kind === 'ambiguous') {
      this.loading.set(false)
      this.snack.open('Impossible de charger la saison.', 'OK', { duration: 6000 })
      return
    }

    this.troupeId.set(resolved.troupe.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeLogoUrl.set(resolved.troupe.logoUrl ?? null)
    this.troupeSlug.set(resolved.troupe.slug)
    this.troupeContext.selectTroupe(resolved.troupe.id)
    this.season.set(resolved.season)
    const pr = await this.organizerApi.mySeasonPermissions(resolved.season.id)
    if (requestId !== this.loadRequestId) return

    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    const canAccess =
      this.platformAdmin() ||
      perms?.canManageSeasonParticipants === true ||
      perms?.canManageSeasonOrganizers === true
    if (!canAccess) {
      this.loading.set(false)
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(
        saisonWorkspacePath(resolved.troupe.slug, resolved.season.slug),
      )
      return
    }

    await this.reloadSeasonOrganizers()

    if (this.canManageSeasonParticipants()) {
      const list = await this.participantApi.listSeasonParticipants(resolved.season.id)
      if (requestId !== this.loadRequestId) return
      if (list.ok && list.data) {
        this.participants.set(list.data)
      }
    }
    this.loading.set(false)
  }
}
