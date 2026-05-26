import { Component, computed, inject, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { type UserSummary } from '../../core/auth/auth-api.service'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { ContextBreadcrumb } from '../../shared/context-breadcrumb/context-breadcrumb'
import { UserAccountMenuItemsComponent } from '../../shared/user-account-menu/user-account-menu-items'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-season-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ContextBreadcrumb,
    UserAccountMenuItemsComponent,
    UserAvatarComponent,
  ],
  templateUrl: './season-header.html',
  styleUrl: './season-header.scss',
})
export class SeasonHeader {
  private readonly troupeContext = inject(TroupeContextService)
  private readonly memberProfile = inject(MemberProfileService)
  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly troupeSlug = input<string | null>(null)
  readonly user = input<UserSummary | null>(null)

  protected readonly showBreadcrumb = computed(
    () => !!this.troupeName()?.trim() && !!this.troupeSlug()?.trim(),
  )

  userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  openSelfProfile(): void {
    const u = this.user()
    if (!u?.slug) {
      return
    }
    this.memberProfile.navigateToMemberGlance({
      userSlug: u.slug,
      troupeId: this.troupeId(),
      leagueId: this.seasonId(),
    })
  }

}
