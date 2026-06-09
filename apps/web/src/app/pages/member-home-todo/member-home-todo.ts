import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService } from '../../core/auth/auth-api.service'
import type { UserAgendaItem } from '../../core/agenda/user-agenda-api.service'
import { MeInboxApiService, type InboxAction } from '../../core/inbox/me-inbox-api.service'
import { MemberInboxBadgeService } from '../../core/inbox/member-inbox-badge.service'
import {
  calendarDaysFromNow,
  enrichAgendaCardFields,
  MAX_VISIBLE_ACTIONS,
  relativeDayLabel,
  URGENT_DAYS,
  type AgendaCardEnrichedItem,
} from '../../core/member-home/member-home-todo.utils'
import { rememberCurrentUrlForPostLogin } from '../../core/navigation/auth-redirect.helper'
import { LastVisitedSeasonShortcutService } from '../../core/navigation/last-visited-season-shortcut.service'
import { DemoTroupeJoinService } from '../../core/troupes/demo-troupe-join.service'
import { saisonEventPath, troupeHubPath } from '../../core/navigation/troupe-routes'
import { MePreferencesApiService } from '../../core/account/me-preferences-api.service'
import type { MemberGender } from '../../core/account/member-gender'
import { AgendaParticipationStatus } from '../../shared/participation/agenda-participation-status'

@Component({
  selector: 'app-member-home-todo',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    AgendaParticipationStatus,
  ],
  templateUrl: './member-home-todo.html',
  styleUrl: './member-home-todo.scss',
})
export class MemberHomeTodo implements OnInit, OnDestroy {
  private readonly auth = inject(AuthApiService)
  private readonly mePreferencesApi = inject(MePreferencesApiService)
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
  protected readonly completedGhosts = signal<CompletedGhost[]>([])
  protected readonly nextEvent = signal<AgendaCardEnrichedItem | null>(null)
  protected readonly noParticipation = signal(false)
  protected readonly referenceNow = signal(new Date())
  protected readonly viewerGender = signal<MemberGender | undefined>(undefined)

  private ghostTimer: ReturnType<typeof setTimeout> | null = null
  private lastSeenPreferencesRevision = -1

  constructor() {
    effect(() => {
      const revision = this.mePreferencesApi.cacheRevision()
      if (revision === this.lastSeenPreferencesRevision) {
        return
      }
      this.lastSeenPreferencesRevision = revision
      if (revision === 0) {
        return
      }
      void this.loadViewerGender()
    })
  }
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
      this.actions().length === 0 &&
      this.completedGhosts().length === 0,
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
    await this.loadViewerGender()
    this.loadingSession.set(false)
    void this.seasonShortcut.refresh()
    await this.loadInbox()
  }

  ngOnDestroy(): void {
    if (this.ghostTimer) {
      clearTimeout(this.ghostTimer)
      this.ghostTimer = null
    }
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
      this.detectCompletedGhosts(r.data.actions)
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
    // Remember what was acted on so the brand check (orange ✓) can play on return.
    const acted = readActedActions()
    acted[this.actionKey(action)] = {
      verb: this.actionVerbLabel(action),
      title: action.title,
      confirm: this.isConfirmAction(action),
    }
    writeActedActions(acted)
    void this.router.navigateByUrl(action.deepLink)
  }

  protected actionKey(action: InboxAction): string {
    return `${action.type}|${action.eventId}|${action.roleKey ?? ''}`
  }

  private detectCompletedGhosts(actions: InboxAction[]): void {
    const acted = readActedActions()
    const ackedKeys = Object.keys(acted)
    if (ackedKeys.length === 0) {
      return
    }
    const present = new Set(actions.map((action) => this.actionKey(action)))
    const done: CompletedGhost[] = ackedKeys
      .filter((key) => !present.has(key))
      .map((key) => ({ key, verb: acted[key].verb, title: acted[key].title, confirm: acted[key].confirm }))
    clearActedActions()
    if (done.length === 0) {
      return
    }
    this.completedGhosts.set(done)
    if (this.ghostTimer) {
      clearTimeout(this.ghostTimer)
    }
    this.ghostTimer = setTimeout(() => this.completedGhosts.set([]), GHOST_HOLD_MS)
  }

  protected openNextEvent(item: AgendaCardEnrichedItem): void {
    void this.router.navigate(saisonEventPath(item.troupeSlug, item.seasonSlug, item.eventSlug))
  }

  protected actionAriaLabel(action: InboxAction): string {
    const when = this.actionDateBadge(action)?.label ?? this.actionCalendarDate(action)
    if (action.type === 'composition_confirm_pending') {
      const role = action.roleLabel ?? action.roleKey ?? 'rôle'
      return `Confirmer ta participation pour ${action.title}, rôle ${role}, ${when}`
    }
    return `Donner ta disponibilité pour ${action.title}, ${when}`
  }

  /** Line 2: event title; role appended for confirmations only. */
  protected actionEventTitle(action: InboxAction): string {
    if (!this.isConfirmAction(action)) {
      return action.title
    }
    const role = action.roleLabel ?? action.roleKey
    return role ? `${action.title} · ${role}` : action.title
  }

  private actionCalendarDate(action: InboxAction): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Paris',
    }).format(new Date(action.startsAt))
  }

  protected timeLabel(item: UserAgendaItem): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(new Date(item.startsAt))
  }

  protected isAvailabilityAction(action: InboxAction): boolean {
    return action.type === 'availability_unknown'
  }

  protected isConfirmAction(action: InboxAction): boolean {
    return action.type === 'composition_confirm_pending'
  }

  /** Verb-first call to action: the loudest, scannable line of the card. */
  protected actionVerbLabel(action: InboxAction): string {
    return this.isConfirmAction(action) ? 'Confirme ta présence' : 'Donne ta dispo'
  }

  /** Concrete relative-day chip (« Demain », « Dans 3 j »…) with urgent tone ≤ 2 days. */
  protected actionDateBadge(action: InboxAction): { label: string; urgent: boolean } | null {
    const now = this.referenceNow()
    const label = relativeDayLabel(action.startsAt, now)
    if (!label) {
      return null
    }
    return { label, urgent: calendarDaysFromNow(action.startsAt, now) <= URGENT_DAYS }
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

  private async loadViewerGender(): Promise<void> {
    const prefs = await this.mePreferencesApi.getPreferences()
    if (prefs.ok && prefs.data) {
      this.viewerGender.set(prefs.data.gender)
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

/** A just-resolved action, replayed once as a checked card (brand orange ✓) on return. */
interface CompletedGhost {
  key: string
  verb: string
  title: string
  confirm: boolean
}

type ActedRecord = Record<string, { verb: string; title: string; confirm: boolean }>

const ACTED_STORAGE_KEY = 'hatcast.todo.acted'

/** How long the checked ghost is held before it collapses (then « Tout est à jour » blooms). */
const GHOST_HOLD_MS = 1400

function readActedActions(): ActedRecord {
  try {
    const raw = sessionStorage.getItem(ACTED_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActedRecord) : {}
  } catch {
    return {}
  }
}

function writeActedActions(record: ActedRecord): void {
  try {
    sessionStorage.setItem(ACTED_STORAGE_KEY, JSON.stringify(record))
  } catch {
    // sessionStorage unavailable (private mode / SSR) — degrade silently.
  }
}

function clearActedActions(): void {
  try {
    sessionStorage.removeItem(ACTED_STORAGE_KEY)
  } catch {
    // ignore
  }
}
