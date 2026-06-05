import { roleLabelSingular, type RoleKey } from '../../shared/event-roles/event-roles'

export interface MultiRoleOnEventWarning {
  otherRoleKeys: string[]
}

export function formatMultiRoleOnEventWarningMessage(
  warning: MultiRoleOnEventWarning,
): string {
  const labels = warning.otherRoleKeys.map((key) => roleLabelSingular(key as RoleKey))
  if (labels.length === 1) {
    return `Attention : cette personne est aussi composée comme ${labels[0]}.`
  }
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1).join(', ')
  return `Attention : cette personne est aussi composée comme ${rest} et ${last}.`
}
