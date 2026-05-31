import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import {
  MeInboxApiService,
  inboxActionAsAgendaItem,
  type InboxAction,
} from '../../core/inbox/me-inbox-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import {
  enrichAgendaCardFields,
  isSoonAction,
  MAX_VISIBLE_ACTIONS,
  type AgendaCardEnrichedItem,
} from '../../core/member-home/member-home-todo.utils'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { LastVisitedSeasonShortcutService } from '../../core/navigation/last-visited-season-shortcut.service'
import { DemoTroupeJoinService } from '../../core/troupes/demo-troupe-join.service'
import { saisonEventPath, troupeHubPath } from '../../core/navigation/troupe-routes'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'

@Component({
  selector: 'app-member-home-todo',
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    AgendaParticipationStatus,
  ],
  templateUrl: './member-home-todo.html',
  styleUrl: './member-home-todo.scss',
})
export class MemberHomeTodo implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly inboxApi = inject(MeInboxApiService)
  private readonly inboxBadge = inject(MemberInboxBadgeService)
  protected readonly seasonShortcut = inject(LastVisitedSeasonShortcutService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)
  private readonly demoJoin = inject(DemoTroupeJoinService)

  protected readonly joiningDemo = this.demoJoin.joining

  protected readonly loadingSession = signal(true)
  protected readonly loadingInbox = signal(false)
  protected readonly loadError = signal(false)
  protected readonly actions = signal<InboxAction[]>([])
  protected readonly nextEvent = signal<AgendaCardEnrichedItem | null>(null)
  protected readonly noParticipation = signal(false)
  protected readonly referenceNow = signal(new Date())
  protected readonly seasonStatsLink = computed(() => {
    const slug = this.seasonShortcut.seasonSlug()?.trim()
    return slug ? this.seasonShortcut.link() : null
  })

  protected readonly seasonStatsShortcutLabel = computed(() => {
    const title = this.seasonShortcut.seasonTitle()?.trim()
    return title ? `Stats · ${title}` : 'Stats saison'
  })

  protected readonly seasonStatsAriaLabel = computed(() => {
    const title = this.seasonShortcut.seasonTitle()?.trim()
    return title ? `Statistiques de la saison ${title}` : 'Statistiques saison'
  })

  protected readonly troupeHubLink = computed(() => {
    const slug = this.seasonShortcut.troupeSlug()?.trim()
    return slug ? troupeHubPath(slug) : null
  })
  protected readonly visibleActions = computed(() =>
    this.actions().slice(0, MAX_VISIBLE_ACTIONS),
  )

  protected readonly showSeeAllInAgenda = computed(() => this.actions().length > MAX_VISIBLE_ACTIONS)

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
    this.loadingSession.set(false)
    void this.seasonShortcut.refresh()
    await this.loadInbox()
  }

  protected async loadInbox(): Promise<void> {
    this.loadingInbox.set(true)
    this.loadError.set(false)
    this.referenceNow.set(new Date())

    const r = await this.inboxApi.getInbox()
    this.loadingInbox.set(false)

    if (r.ok && r.data) {
      this.actions.set(r.data.actions)
      this.inboxBadge.pendingActionCount.set(r.data.actions.length)
      this.noParticipation.set(r.data.noParticipation ?? false)
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
    void this.router.navigate(saisonEventPath(item.seasonSlug, item.eventSlug))
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

  protected actionKindLabel(action: InboxAction): string {
    return this.isConfirmAction(action) ? 'À confirmer' : 'Dispo'
  }

  protected actionMetaLine(action: InboxAction): string {
    return this.actionSubline(action)
  }

  protected actionLeadingIcon(action: InboxAction): string {
    return this.isConfirmAction(action) ? 'how_to_reg' : 'edit_calendar'
  }

  protected eventDetailText(
    item: AgendaCardEnrichedItem,
  ): { description?: string; location?: string } | null {
    const description = item.description?.trim()
    const location = item.location?.trim()
    if (!description && !location) {
      return null
    }
    return {
      ...(description ? { description } : {}),
      ...(location ? { location } : {}),
    }
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

  protected async joinDemoTroupe(): Promise<void> {
    await this.demoJoin.join()
  }
}
