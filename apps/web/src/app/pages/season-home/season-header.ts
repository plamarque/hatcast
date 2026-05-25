import { Component, inject, input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router, RouterLink } from '@angular/router'

import { AuthApiService, type UserSummary } from '../../core/auth/auth-api.service'
import { MemberProfileService } from '../../core/member-profile/member-profile.service'
import {
  leagueAdminMembresPath,
  leagueAdminParticipantsPath,
} from '../../core/navigation/league-routes'
import { TroupeContextService } from '../../core/troupes/troupe-context.service'
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar'

@Component({
  selector: 'app-season-header',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './season-header.html',
  styleUrl: './season-header.scss',
})
export class SeasonHeader {
  protected readonly leagueAdminParticipantsPath = leagueAdminParticipantsPath
  protected readonly leagueAdminMembresPath = leagueAdminMembresPath

  private readonly troupeContext = inject(TroupeContextService)
  private readonly memberProfile = inject(MemberProfileService)
  private readonly auth = inject(AuthApiService)
  private readonly router = inject(Router)

  readonly seasonTitle = input.required<string>()
  readonly seasonSlug = input.required<string>()
  readonly seasonId = input.required<string>()
  readonly troupeId = input.required<string>()
  readonly troupeName = input<string | null>(null)
  readonly user = input<UserSummary | null>(null)
  readonly canManageSettings = input(false)
  readonly canManageSeasonParticipants = input(false)
  readonly canManageSeasonOrganizersOnly = input(false)

  userDisplayLabel(): string {
    return this.troupeContext.currentUserDisplayLabel(this.user())
  }

  openSelfProfile(): void {
    const u = this.user()
    if (!u) {
      return
    }
    this.memberProfile.openProfileDialog({
      seasonId: this.seasonId(),
      troupeId: this.troupeId(),
      userId: u.id,
      seasonSlug: this.seasonSlug(),
    })
  }

  async logout(): Promise<void> {
    await this.auth.logout()
    await this.router.navigate(['/connexion'], { replaceUrl: true })
  }
}
