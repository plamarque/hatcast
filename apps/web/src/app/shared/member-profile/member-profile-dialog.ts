import { Component, inject, OnInit, signal } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Router } from '@angular/router'

import {
  MemberProfileApiService,
  type MemberProfileSummary,
} from '../../core/member-profile/member-profile-api.service'
import { type RoleKey } from '../event-roles/event-roles'
import { UserAvatarComponent } from '../user-avatar/user-avatar'
import { MemberProfilePanel } from './member-profile-panel'

export interface MemberProfileDialogData {
  seasonId: string
  troupeId: string
  userId: string
  seasonSlug: string
  userSlug?: string
  leagueId?: string
}

@Component({
  selector: 'app-member-profile-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    UserAvatarComponent,
    MemberProfilePanel,
  ],
  templateUrl: './member-profile-dialog.html',
  styleUrl: './member-profile-dialog.scss',
})
export class MemberProfileDialog implements OnInit {
  private readonly api = inject(MemberProfileApiService)
  private readonly dialogRef = inject(MatDialogRef<MemberProfileDialog>)
  private readonly snack = inject(MatSnackBar)
  private readonly router = inject(Router)
  readonly data = inject<MemberProfileDialogData>(MAT_DIALOG_DATA)

  protected readonly loading = signal(true)
  protected readonly saving = signal(false)
  protected readonly profile = signal<MemberProfileSummary | null>(null)
  protected readonly selectedRoleKeys = signal<Set<string>>(new Set())

  async ngOnInit(): Promise<void> {
    const r = await this.api.getProfileSummary(this.data.seasonId, this.data.userId)
    if (!r.ok || !r.data) {
      this.loading.set(false)
      this.snack.open('Impossible de charger le profil.', 'OK', { duration: 5000 })
      this.dialogRef.close()
      return
    }
    this.profile.set(r.data)
    if (r.data.isSelf && r.data.preferredRoleKeys) {
      this.selectedRoleKeys.set(new Set(r.data.preferredRoleKeys))
    }
    this.loading.set(false)
  }

  protected onRoleToggled(event: { key: RoleKey; checked: boolean }): void {
    const next = new Set(this.selectedRoleKeys())
    if (event.checked) {
      next.add(event.key)
    } else {
      next.delete(event.key)
    }
    next.add('volunteer')
    this.selectedRoleKeys.set(next)
  }

  protected async savePreferredRoles(): Promise<void> {
    if (this.saving() || !this.profile()?.isSelf) {
      return
    }
    this.saving.set(true)
    const keys = [...this.selectedRoleKeys()]
    const r = await this.api.updatePreferredRoles(this.data.troupeId, keys)
    this.saving.set(false)
    if (r.ok && r.data) {
      this.selectedRoleKeys.set(new Set(r.data.preferredRoleKeys))
      this.snack.open('Préférences enregistrées', 'OK', { duration: 3000 })
    } else {
      this.snack.open('Enregistrement impossible.', 'OK', { duration: 5000 })
    }
  }

  protected openPlanning(): void {
    const queryParams: Record<string, string> = {}
    if (this.data.troupeId) {
      queryParams['troupeId'] = this.data.troupeId
    }
    if (this.data.leagueId ?? this.data.seasonId) {
      queryParams['leagueId'] = this.data.leagueId ?? this.data.seasonId
    }
    void this.router.navigate(['/agenda'], { queryParams })
    this.dialogRef.close()
  }

  protected close(): void {
    this.dialogRef.close()
  }
}
