import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import {
  availabilityBadgeLabel,
  availabilityBadgeModifier,
  type AvailabilityStatus,
} from '../../core/availability/availability-status'
import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import {
  MeInboxApiService,
  inboxActionAsAgendaItem,
  type InboxAction,
} from '../../core/inbox/me-inbox-api.service'
import {
  deriveSeasonGlanceQueryParamsFromInbox,
  enrichAgendaCardFields,
  isSoonAction,
  MAX_VISIBLE_ACTIONS,
  resolveLastVisitedSeasonGlanceIds,
  type AgendaCardEnrichedItem,
} from '../../core/member-home/member-home-todo.utils'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { TroupeSeasonResolverService } from '../../core/troupes/troupe-season-resolver.service'
import { saisonEventPath } from '../../core/navigation/troupe-routes'
import { MemberAgendaShortcut } from '../../shared/member-cross-nav/member-agenda-shortcut'
import { MemberSeasonShortcut } from '../../shared/member-cross-nav/member-season-shortcut'
import { UserAccountMenuItemsComponent } from '../../shared/user-account-menu/user-account-menu-items'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-member-home-todo',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    MemberAgendaShortcut,
    MemberSeasonShortcut,
    UserAccountMenuItemsComponent,
    UserAvatarComponent,
  ],
  templateUrl: './member-home-todo.html',
  styleUrl: './member-home-todo.scss',
})
export class MemberHomeTodo implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly inboxApi = inject(MeInboxApiService)
  private readonly seasonResolver = inject(TroupeSeasonResolverService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loadingSession = signal(true)
  protected readonly loadingInbox = signal(false)
  protected readonly loadError = signal(false)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly actions = signal<InboxAction[]>([])
  protected readonly nextEvent = signal<AgendaCardEnrichedItem | null>(null)
  protected readonly noParticipation = signal(false)
  protected readonly referenceNow = signal(new Date())
  private readonly lastVisitedGlanceIds = signal<{
    troupeId?: string
    leagueId?: string
  } | null>(null)
  private readonly inboxShortcuts = signal<{
    lastSeasonSlug: string | null
    seasonGlanceQuery: { troupeId?: string; leagueId?: string }
  } | null>(null)

  protected readonly visibleActions = computed(() =>
    this.actions().slice(0, MAX_VISIBLE_ACTIONS),
  )

  protected readonly showSeeAllInAgenda = computed(() => this.actions().length > MAX_VISIBLE_ACTIONS)

  protected readonly seasonGlanceQueryParams = computed(() =>
    deriveSeasonGlanceQueryParamsFromInbox(this.inboxShortcuts(), this.lastVisitedGlanceIds()),
  )

  protected readonly showActionsSection = computed(() => this.actions().length > 0)

  protected readonly showAllCaughtUpBanner = computed(
    () =>
      !this.noParticipation() &&
      !this.loadingSession() &&
      !this.loadingInbox() &&
      !this.loadError() &&
      this.actions().length === 0,
  )

  protected readonly showNoUpcomingEventsEmpty = computed(
    () => this.showAllCaughtUpBanner() && !this.nextEvent() && !this.noParticipation(),
  )

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      await this.redirectToLogin()
      return
    }
    this.user.set(r.data.user)
    this.loadingSession.set(false)
    await this.resolveLastVisitedGlanceIds()
    await this.loadInbox()
  }

  private async resolveLastVisitedGlanceIds(): Promise<void> {
    this.lastVisitedGlanceIds.set(await resolveLastVisitedSeasonGlanceIds(this.seasonResolver))
  }

  protected userDisplayLabel(u: UserSummary): string {
    return u.displayName || u.email || 'Mon compte'
  }

  protected async loadInbox(): Promise<void> {
    this.loadingInbox.set(true)
    this.loadError.set(false)
    this.referenceNow.set(new Date())

    const r = await this.inboxApi.getInbox()
    this.loadingInbox.set(false)

    if (r.ok && r.data) {
      this.actions.set(r.data.actions)
      this.noParticipation.set(r.data.noParticipation ?? false)
      this.inboxShortcuts.set(r.data.shortcuts)
      const next = r.data.nextEvent
      this.nextEvent.set(next ? enrichAgendaCardFields(next) : null)
      return
    }

    if (r.status === 401) {
      await this.redirectToLogin()
      return
    }

    this.loadError.set(true)
    this.actions.set([])
    this.nextEvent.set(null)
  }

  protected openAction(action: InboxAction): void {
    void this.router.navigateByUrl(action.deepLink)
  }

  protected openNextEvent(item: AgendaCardEnrichedItem): void {
    void this.router.navigate(saisonEventPath(item.leagueSlug, item.eventSlug))
  }

  protected actionAriaLabel(action: InboxAction): string {
    if (action.type === 'composition_confirm_pending') {
      const role = action.roleLabel ?? action.roleKey ?? 'rôle'
      return `Confirmer ta participation pour ${action.title}, rôle ${role}, ${this.actionSubline(action)}`
    }
    return `Indiquer ta disponibilité pour ${action.title}, ${this.actionSubline(action)}`
  }

  protected actionSubline(action: InboxAction): string {
    const item = inboxActionAsAgendaItem(action)
    const date = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Paris',
    }).format(new Date(item.startsAt))
    const troupe = item.troupeName
    if (action.type === 'composition_confirm_pending') {
      const role = action.roleLabel ?? action.roleKey ?? ''
      return `${date} · ${troupe} · ${role}`
    }
    return `${date} · ${troupe}`
  }

  protected timeLabel(item: UserAgendaItem): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(new Date(item.startsAt))
  }

  protected isActionSoon(action: InboxAction): boolean {
    return isSoonAction(action.startsAt, this.referenceNow())
  }

  protected isAvailabilityAction(action: InboxAction): boolean {
    return action.type === 'availability_unknown'
  }

  protected isConfirmAction(action: InboxAction): boolean {
    return action.type === 'composition_confirm_pending'
  }

  protected dispoLabel(status: AvailabilityStatus): string {
    return availabilityBadgeLabel(status)
  }

  protected dispoModifier(status: AvailabilityStatus): string {
    return availabilityBadgeModifier(status)
  }

  private async redirectToLogin(): Promise<void> {
    this.loadingSession.set(false)
    this.loadingInbox.set(false)
    this.snack.open('Votre session a expiré ou vous n’êtes pas connecté.', 'OK', {
      duration: 6000,
    })
    rememberCurrentUrlForPostLogin(this.router)
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
