import { Component, computed, input, output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTooltipModule } from '@angular/material/tooltip'

import type { MemberProfileSummary } from '../../core/member-profile/member-profile-api.service'
import {
  canDisablePreferredRole,
  orderedRoleKeys,
  roleEmoji,
  roleLabelSingular,
  type RoleKey,
} from '../event-roles/event-roles'
@Component({
  selector: 'app-member-profile-panel',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './member-profile-panel.html',
  styleUrl: './member-profile-dialog.scss',
})
export class MemberProfilePanel {
  readonly profile = input.required<MemberProfileSummary>()
  readonly loading = input(false)
  readonly saving = input(false)
  readonly selectedRoleKeys = input.required<Set<string>>()
  readonly showCloseButton = input(false)

  readonly roleToggled = output<{ key: RoleKey; checked: boolean }>()
  readonly savePreferredRoles = output<void>()
  readonly closeRequested = output<void>()

  protected readonly roleKeys = orderedRoleKeys()

  protected readonly hasStats = computed(() => !!this.profile().stats)
  protected readonly hasFavoriteCounts = computed(
    () => (this.profile().favoriteRoleCounts?.length ?? 0) > 0,
  )
  protected readonly chartHeading = computed(() =>
    this.profile().isSelf ? "Ma saison en un clin d'œil" : 'Saison en un clin d\'œil',
  )

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

  protected onToggleRole(key: RoleKey, checked: boolean): void {
    if (!canDisablePreferredRole(key)) {
      return
    }
    this.roleToggled.emit({ key, checked })
  }

  protected onSavePreferredRoles(): void {
    this.savePreferredRoles.emit()
  }

  protected onClose(): void {
    this.closeRequested.emit()
  }
}
