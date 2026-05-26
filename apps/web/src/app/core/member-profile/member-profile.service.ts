import { Injectable, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'

import {
  MemberProfileDialog,
  type MemberProfileDialogData,
} from '../../shared/member-profile/member-profile-dialog'

export interface NavigateMemberGlanceOptions {
  userSlug: string
  troupeId?: string
  leagueId?: string
}

@Injectable({ providedIn: 'root' })
export class MemberProfileService {
  private readonly dialog = inject(MatDialog)
  private readonly router = inject(Router)

  navigateToMemberGlance(options: NavigateMemberGlanceOptions): void {
    const queryParams: Record<string, string> = {}
    if (options.troupeId) {
      queryParams['troupeId'] = options.troupeId
    }
    if (options.leagueId) {
      queryParams['leagueId'] = options.leagueId
    }
    void this.router.navigate(['/membre', options.userSlug], { queryParams })
  }

  /** @deprecated Prefer navigateToMemberGlance — thin redirect wrapper for transitional callers. */
  openProfileDialog(data: MemberProfileDialogData): void {
    if (data.userSlug) {
      this.navigateToMemberGlance({
        userSlug: data.userSlug,
        troupeId: data.troupeId,
        leagueId: data.leagueId ?? data.seasonId,
      })
      return
    }
    this.dialog.open(MemberProfileDialog, {
      data,
      width: 'min(100vw - 2rem, 36rem)',
      panelClass: 'member-profile-dialog',
      autoFocus: 'first-tabbable',
    })
  }
}
