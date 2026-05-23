import { Component, computed, inject, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { Router } from '@angular/router'

import {
  MemberProfileApiService,
  type MemberProfileSummary,
} from '../../core/member-profile/member-profile-api.service'
import {
  canDisablePreferredRole,
  orderedRoleKeys,
  roleEmoji,
  roleLabelSingular,
  type RoleKey,
} from '../event-roles/event-roles'
import { UserAvatarComponent } from '../user-avatar/user-avatar'

export interface MemberProfileDialogData {
  seasonId: string
  troupeId: string
  userId: string
  seasonSlug: string
}

@Component({
  selector: 'app-member-profile-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    UserAvatarComponent,
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
  protected readonly roleKeys = orderedRoleKeys()

  protected readonly hasStats = computed(() => !!this.profile()?.stats)
  protected readonly hasFavoriteCounts = computed(
    () => (this.profile()?.favoriteRoleCounts?.length ?? 0) > 0,
  )
  protected readonly chartHeading = computed(() =>
    this.profile()?.isSelf ? 'Ma saison en un clin d\'œil' : 'Saison en un clin d\'œil',
  )

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

  protected roleLabel(key: RoleKey): string {
    return roleLabelSingular(key)
  }

  protected roleEmoji(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected canToggleRole(key: RoleKey): boolean {
    return canDisablePreferredRole(key)
  }

  protected isRoleSelected(key: RoleKey): boolean {
    return this.selectedRoleKeys().has(key)
  }

  protected toggleRole(key: RoleKey, checked: boolean): void {
    if (!canDisablePreferredRole(key)) {
      return
    }
    const next = new Set(this.selectedRoleKeys())
    if (checked) {
      next.add(key)
    } else {
      next.delete(key)
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
    void this.router.navigate(['/saison', this.data.seasonSlug], {
      queryParams: { participant: this.data.userId, view: 'agenda' },
    })
    this.dialogRef.close()
  }

  protected close(): void {
    this.dialogRef.close()
  }
}
