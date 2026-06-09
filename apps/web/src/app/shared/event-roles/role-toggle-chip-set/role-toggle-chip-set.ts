import { Component, input, output } from '@angular/core'
import { MatChipsModule } from '@angular/material/chips'
import { MatTooltipModule } from '@angular/material/tooltip'

import type { MemberGender } from '../../../core/account/member-gender'
import {
  canDisablePreferredRole,
  getRoleLabel,
  orderedRoleKeys,
  roleEmoji,
  type RoleKey,
} from '../event-roles'

@Component({
  selector: 'app-role-toggle-chip-set',
  imports: [MatChipsModule, MatTooltipModule],
  templateUrl: './role-toggle-chip-set.html',
  styleUrl: './role-toggle-chip-set.scss',
})
export class RoleToggleChipSet {
  readonly selectedKeys = input.required<readonly string[]>()
  readonly gender = input<MemberGender>('non_specified')
  readonly disabled = input(false)
  readonly ariaLabel = input('Rôles')
  readonly roleKeys = input<readonly RoleKey[]>(orderedRoleKeys())
  /** When true (default), volunteer is locked on — preferred-roles UX. When false, parent handles toggles. */
  readonly lockVolunteer = input(true)

  readonly selectionChange = output<readonly string[]>()
  readonly chipToggled = output<{ key: RoleKey; checked: boolean }>()

  protected emojiFor(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected labelFor(key: RoleKey): string {
    return getRoleLabel(key, this.gender())
  }

  protected isSelected(key: RoleKey): boolean {
    return this.selectedKeys().includes(key)
  }

  protected isLocked(key: RoleKey): boolean {
    return this.lockVolunteer() && !canDisablePreferredRole(key)
  }

  protected tooltipFor(key: RoleKey): string {
    if (!this.lockVolunteer() || key !== 'volunteer') {
      return ''
    }
    return 'Le rôle bénévole est toujours pré-coché : si tu es disponible, tu peux toujours aider !'
  }

  protected onChipClick(key: RoleKey): void {
    if (this.disabled()) {
      return
    }

    if (!this.lockVolunteer()) {
      this.chipToggled.emit({ key, checked: !this.isSelected(key) })
      return
    }

    if (!canDisablePreferredRole(key)) {
      return
    }

    const current = new Set(this.selectedKeys())
    if (current.has(key)) {
      current.delete(key)
    } else {
      current.add(key)
    }
    current.add('volunteer')
    this.selectionChange.emit([...current])
  }
}
