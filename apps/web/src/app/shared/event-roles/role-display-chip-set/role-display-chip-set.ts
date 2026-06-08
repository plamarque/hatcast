import { Component, input } from '@angular/core'
import { MatChipsModule } from '@angular/material/chips'

import type { MemberGender } from '../../../core/account/member-gender'
import { getRoleLabel, roleEmoji, type RoleKey } from '../event-roles'
import type { RoleDisplayChipItem } from './role-display-chip-item'

@Component({
  selector: 'app-role-display-chip-set',
  imports: [MatChipsModule],
  templateUrl: './role-display-chip-set.html',
  styleUrl: './role-display-chip-set.scss',
})
export class RoleDisplayChipSet {
  readonly items = input.required<readonly RoleDisplayChipItem[]>()
  readonly gender = input<MemberGender>('non_specified')
  readonly ariaLabel = input('Rôles')
  readonly emptyMessage = input<string | null>(null)

  protected emojiFor(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected labelFor(key: RoleKey): string {
    return getRoleLabel(key, this.gender())
  }
}
