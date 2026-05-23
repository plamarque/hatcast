import { Injectable, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'

import {
  MemberProfileDialog,
  type MemberProfileDialogData,
} from '../../shared/member-profile/member-profile-dialog'

@Injectable({ providedIn: 'root' })
export class MemberProfileService {
  private readonly dialog = inject(MatDialog)

  openProfileDialog(data: MemberProfileDialogData): void {
    this.dialog.open(MemberProfileDialog, {
      data,
      width: 'min(100vw - 2rem, 36rem)',
      panelClass: 'member-profile-dialog',
      autoFocus: 'first-tabbable',
    })
  }
}
