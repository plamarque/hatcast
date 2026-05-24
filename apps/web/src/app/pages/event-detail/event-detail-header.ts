import { Component, inject, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterLink } from '@angular/router'

import type { UserSummary } from '../../core/auth/auth-api.service'
import type { EventResponse } from '../../core/events/event-api.service'
import { getEventTypeIcon } from '../../core/events/event-types'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'
import { AGENDA_TIME_ZONE } from '../season-home/season-events.utils'

@Component({
  selector: 'app-event-detail-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './event-detail-header.html',
  styleUrl: './event-detail-header.scss',
})
export class EventDetailHeader {
  private readonly troupeContext = inject(TroupeContextService)
  private readonly memberProfile = inject(MemberProfileService)

  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly event = input<EventResponse | null>(null)
  readonly user = input<UserSummary | null>(null)
  readonly canManageSettings = input(false)
  readonly canManageSeasonParticipants = input(false)
  readonly canManageSeasonOrganizersOnly = input(false)

  protected typeIcon(templateType: string): string {
    return getEventTypeIcon(templateType)
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

  protected userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  protected profileContextReady(): boolean {
    return Boolean(this.seasonId() && this.troupeId())
  }

  protected openSelfProfile(): void {
    const u = this.user()
    if (!u || !this.profileContextReady()) {
      return
    }
    this.memberProfile.openProfileDialog({
      seasonId: this.seasonId(),
      troupeId: this.troupeId(),
      userId: u.id,
      seasonSlug: this.seasonSlug(),
    })
  }
}
