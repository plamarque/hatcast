import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
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
import {
  UserAgendaApiService,
  type UserAgendaItem,
  type UserAgendaResponse,
} from '../../core/agenda/user-agenda-api.service'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { groupEventsByMonth, type MonthEventGroup } from '../season-home/season-events.utils'

const PAGE_SIZE = 50

@Component({
  selector: 'app-user-agenda',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './user-agenda.html',
  styleUrl: './user-agenda.scss',
})
export class UserAgenda implements OnInit {
  private readonly auth = inject(AuthApiService)
  private readonly api = inject(UserAgendaApiService)
  private readonly router = inject(Router)
  private readonly snack = inject(MatSnackBar)

  protected readonly loadingSession = signal(true)
  protected readonly loadingAgenda = signal(false)
  protected readonly loadError = signal(false)
  protected readonly user = signal<UserSummary | null>(null)
  protected readonly response = signal<UserAgendaResponse | null>(null)
  protected readonly items = signal<UserAgendaItem[]>([])
  protected readonly noParticipation = signal(false)
  protected readonly monthGroups = computed<MonthEventGroup<UserAgendaItem>[]>(() =>
    groupEventsByMonth(this.items()),
  )

  async ngOnInit(): Promise<void> {
    const r = await this.auth.ensureHatcastSession()
    if (!r.ok || !r.data) {
      await this.redirectToLogin()
      return
    }
    this.user.set(r.data.user)
    this.loadingSession.set(false)
    await this.loadAgenda()
  }

  protected userDisplayLabel(u: UserSummary): string {
    return u.displayName || u.email || 'Mon compte'
  }

  protected async logout(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }

  protected async loadAgenda(): Promise<void> {
    this.loadingAgenda.set(true)
    this.loadError.set(false)
    const r = await this.api.listAgenda({ page: 0, size: PAGE_SIZE, scope: 'upcoming' })
    this.loadingAgenda.set(false)

    if (r.ok && r.data) {
      this.response.set(r.data)
      this.items.set(r.data.content)
      this.noParticipation.set(r.data.noParticipation)
      return
    }

    if (r.status === 401) {
      await this.redirectToLogin()
      return
    }

    this.loadError.set(true)
    this.items.set([])
  }

  protected openEvent(item: UserAgendaItem): void {
    void this.router.navigate(['/saison', item.leagueSlug, 'event', item.eventId])
  }

  protected timeLabel(item: UserAgendaItem): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(new Date(item.startsAt))
  }

  protected dispoLabel(status: AvailabilityStatus): string {
    return availabilityBadgeLabel(status)
  }

  protected dispoModifier(status: AvailabilityStatus): string {
    return availabilityBadgeModifier(status)
  }

  private async redirectToLogin(): Promise<void> {
    this.loadingSession.set(false)
    this.loadingAgenda.set(false)
    this.snack.open('Votre session a expiré ou vous n’êtes pas connecté.', 'OK', {
      duration: 6000,
    })
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
