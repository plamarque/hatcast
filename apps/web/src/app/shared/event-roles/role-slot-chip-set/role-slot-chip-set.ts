import { Component, input, output } from '@angular/core'

import type { MemberGender } from '../../../core/account/member-gender'
import { clampRoleCount, ROLE_COUNT_MAX, type RoleKey } from '../../../core/events/event-types'
import { getRoleLabel, orderedRoleKeys, roleEmoji } from '../event-roles'

export type RoleSlotCountChange = { key: RoleKey; count: number }

@Component({
  selector: 'app-role-slot-chip-set',
  imports: [],
  templateUrl: './role-slot-chip-set.html',
  styleUrl: './role-slot-chip-set.scss',
})
export class RoleSlotChipSet {
  readonly counts = input.required<Readonly<Record<string, number>>>()
  readonly roleKeys = input<readonly RoleKey[]>(orderedRoleKeys())
  readonly maxCount = input(ROLE_COUNT_MAX)
  readonly gender = input<MemberGender>('non_specified')
  readonly disabled = input(false)
  readonly ariaLabel = input('Effectifs par rôle')

  readonly countChange = output<RoleSlotCountChange>()

  protected emojiFor(key: RoleKey): string {
    return roleEmoji(key)
  }

  protected labelFor(key: RoleKey): string {
    return getRoleLabel(key, this.gender())
  }

  protected countFor(key: RoleKey): number {
    return this.counts()[key] ?? 0
  }

  protected decrement(key: RoleKey): void {
    this.emitCount(key, this.countFor(key) - 1)
  }

  protected increment(key: RoleKey): void {
    this.emitCount(key, this.countFor(key) + 1)
  }

  private emitCount(key: RoleKey, raw: number): void {
    if (this.disabled()) {
      return
    }
    this.countChange.emit({ key, count: clampRoleCount(raw) })
  }
}
