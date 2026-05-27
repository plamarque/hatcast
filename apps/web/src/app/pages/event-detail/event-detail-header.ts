import { Component, computed, inject, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import type { UserSummary } from '../../core/auth/auth-api.service'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { MemberAgendaShortcut } from '../../shared/member-cross-nav/member-agenda-shortcut'
import { UserAccountMenuItemsComponent } from '../../shared/user-account-menu/user-account-menu-items'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-event-detail-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ContextBreadcrumb,
    MemberAgendaShortcut,
    UserAccountMenuItemsComponent,
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
  readonly troupeName = input<string | null>(null)
  readonly troupeSlug = input<string | null>(null)
  readonly seasonTitle = input<string | null>(null)
  readonly eventTitle = input<string | null>(null)
  readonly user = input<UserSummary | null>(null)

  protected readonly showBreadcrumb = computed(
    () =>
      !!this.troupeName()?.trim() &&
      !!this.troupeSlug()?.trim() &&
      !!this.seasonTitle()?.trim() &&
      !!this.eventTitle()?.trim(),
  )

  protected userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  protected profileContextReady(): boolean {
    return Boolean(this.seasonId() && this.troupeId())
  }

  protected openSelfProfile(): void {
    const u = this.user()
    if (!u?.slug || !this.profileContextReady()) {
      return
    }
    this.memberProfile.navigateToMemberGlance({
      userSlug: u.slug,
      troupeId: this.troupeId(),
      leagueId: this.seasonId(),
    })
  }
}
