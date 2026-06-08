import { auditRoleDisplay } from '../../../core/audit/audit-display-labels'
import type { MemberGender } from '../../../core/account/member-gender'
import type { RoleKey } from '../../../core/events/event-types'
import { getRoleLabel, roleEmoji, roleLabelSingular } from '../event-roles'

export type RoleActionChipLabelOptions = {
  gender?: MemberGender | null | undefined
  hasAssignee?: boolean
}

export function resolveRoleActionChipLabel(
  roleKey: string,
  options: RoleActionChipLabelOptions = {},
): { emoji: string; label: string } {
  const key = roleKey as RoleKey
  if (options.hasAssignee) {
    return {
      emoji: roleEmoji(key),
      label: getRoleLabel(key, options.gender),
    }
  }
  return {
    emoji: roleEmoji(key),
    label: roleLabelSingular(key),
  }
}

/** Full pill text — gender-aware when assigned, inclusive baseline when empty slot. */
export function roleActionChipDisplayText(
  roleKey: string,
  options: RoleActionChipLabelOptions = {},
): string {
  if (options.hasAssignee) {
    const { emoji, label } = resolveRoleActionChipLabel(roleKey, options)
    return `${emoji} ${label}`
  }
  return auditRoleDisplay(roleKey)
}
