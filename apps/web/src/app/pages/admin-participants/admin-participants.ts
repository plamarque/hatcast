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
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { Subscription } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { toSignal } from '@angular/core/rxjs-interop'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import {
  OrganizerApiService,
  type MySeasonPermissions,
} from '../../core/permissions/organizer-api.service'
import {
  ParticipantApiService,
  type ParticipantKind,
  type SeasonParticipantAdmin,
} from '../../core/participants/participant-api.service'
import type { SeasonResponse } from '../../core/seasons/season-api.service'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ConfirmDialog, type ConfirmDialogData } from '../seasons-list/confirm-dialog'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { AddParticipantDialog } from './add-participant-dialog'

@Component({
  selector: 'app-admin-participants',
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
    UserAvatarComponent,
  ],
  templateUrl: './admin-participants.html',
  styleUrl: './admin-participants.scss',
})
export class AdminParticipants implements OnDestroy, OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly troupeContext = inject(TroupeContextService)
  private readonly troupeSeasonResolver = inject(TroupeSeasonResolverService)
  private readonly organizerApi = inject(OrganizerApiService)
  private readonly participantApi = inject(ParticipantApiService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly dialog = inject(MatDialog)
  private routeSubscription = Subscription.EMPTY
  private loadRequestId = 0
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

  protected readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  )

  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly season = signal<SeasonResponse | null>(null)
  protected readonly troupeId = signal<string | null>(null)
  protected readonly troupeName = signal<string | null>(null)
  protected readonly permissions = signal<MySeasonPermissions | null>(null)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly participants = signal<SeasonParticipantAdmin[]>([])
  protected readonly searchQuery = signal('')
  protected readonly debouncedSearch = signal('')

  protected readonly subtitle = computed(() => {
    const se = this.season()
    const troupe = this.troupeName()
    if (!se) return ''
    return troupe ? `${se.title} · ${troupe}` : se.title
  })

  protected readonly filteredParticipants = computed(() => {
    const q = this.debouncedSearch().trim().toLowerCase()
    let list = this.participants()
    if (q) {
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          (p.email?.toLowerCase().includes(q) ?? false),
      )
    }
    return list
  })

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
        map((p) => p.get('slug') ?? ''),
        distinctUntilChanged(),
      )
      .subscribe((slug) => {
        void this.loadPage(slug)
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

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value)
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer)
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value)
    }, 150)
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

  protected confirmRemove(participant: SeasonParticipantAdmin): void {
    if (!participant.removable) {
      this.snack.open('Retirez ce membre depuis l’écran Membres.', 'OK', { duration: 6000 })
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
        void this.removeParticipant(participant.id)
      }
    })
  }

  private async removeParticipant(participantId: string): Promise<void> {
    const s = this.season()
    if (!s) return
    this.saving.set(true)
    try {
      const r = await this.participantApi.removeSeasonParticipant(s.id, participantId)
      if (!r.ok) {
        this.snack.open('Retrait impossible.', 'OK', { duration: 5000 })
        return
      }
      await this.reloadParticipants('Participant retiré.')
    } finally {
      this.saving.set(false)
    }
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

  private async loadPage(slug: string): Promise<void> {
    const requestId = ++this.loadRequestId
    this.loading.set(true)
    this.season.set(null)
    this.permissions.set(null)
    this.participants.set([])

    if (!slug) {
      this.loading.set(false)
      return
    }

    const resolved = await this.troupeSeasonResolver.resolveSeasonSlug(slug)
    if (requestId !== this.loadRequestId) return
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

    this.troupeId.set(resolved.troupe.id)
    this.troupeName.set(resolved.troupe.name)
    this.troupeContext.selectTroupe(resolved.troupe.id)
    this.season.set(resolved.season)
    const pr = await this.organizerApi.mySeasonPermissions(resolved.season.id)
    if (requestId !== this.loadRequestId) return

    const perms = pr.ok && pr.data ? pr.data : null
    this.permissions.set(perms)
    if (!perms?.canManageSeasonParticipants) {
      this.loading.set(false)
      this.snack.open('Accès non autorisé', 'OK', { duration: 5000 })
      await this.router.navigate(['/saison', slug])
      return
    }

    const list = await this.participantApi.listSeasonParticipants(resolved.season.id)
    if (requestId !== this.loadRequestId) return
    if (list.ok && list.data) {
      this.participants.set(list.data)
    }
    this.loading.set(false)
  }
}
