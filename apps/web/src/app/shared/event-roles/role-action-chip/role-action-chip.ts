import { Component, computed, input, output } from '@angular/core'

import type { MemberGender } from '../../../core/account/member-gender'
import { resolveRoleActionChipLabel } from './role-action-chip-label'

@Component({
  selector: 'app-role-action-chip',
  host: {
    '[class.role-action-chip-host--equipe]': 'density() === "equipe"',
  },
  imports: [],
  templateUrl: './role-action-chip.html',
  styleUrl: './role-action-chip.scss',
})
export class RoleActionChip {
  readonly roleKey = input.required<string>()
  readonly gender = input<MemberGender | null | undefined>(undefined)
  readonly hasAssignee = input(false)
  readonly interactive = input(false)
  readonly active = input(false)
  readonly ariaLabel = input<string | null>(null)
  readonly ariaExpanded = input<boolean | null>(null)
  readonly density = input<'default' | 'equipe'>('default')
  readonly testId = input<string | null>(null)

  readonly actionClick = output<MouseEvent>()

  protected readonly emoji = computed(
    () => resolveRoleActionChipLabel(this.roleKey(), this.labelOptions()).emoji,
  )

  protected readonly label = computed(
    () => resolveRoleActionChipLabel(this.roleKey(), this.labelOptions()).label,
  )

  protected onClick(event: MouseEvent): void {
    this.actionClick.emit(event)
  }

  private labelOptions() {
    return {
      gender: this.gender(),
      hasAssignee: this.hasAssignee(),
    }
  }
}
