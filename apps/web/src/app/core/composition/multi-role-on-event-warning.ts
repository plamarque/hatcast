import { getRoleLabel, type RoleKey } from '../../shared/event-roles/event-roles'
import type { MemberGender } from '../account/member-gender'

export interface MultiRoleOnEventWarning {
  otherRoleKeys: string[]
}

/** Compact label on the équipe row (multi-role same-event hint). */
export const MULTI_ROLE_ON_EVENT_WARNING_SHORT_LABEL = 'Deux rôles le même soir'

function formatOtherRoleLabels(
  otherRoleKeys: string[],
  assigneeGender?: MemberGender | unknown,
): string[] {
  return otherRoleKeys.map((key) => getRoleLabel(key as RoleKey, assigneeGender))
}

/** Full detail for tooltip / aria-label on tap. */
export function formatMultiRoleOnEventWarningTooltip(
  warning: MultiRoleOnEventWarning,
  participantDisplayName: string,
  assigneeGender?: MemberGender | unknown,
): string {
  const name = participantDisplayName.trim() || 'Cette personne'
  const labels = formatOtherRoleLabels(warning.otherRoleKeys, assigneeGender)
  if (labels.length === 0) {
    return `${name} occupe plusieurs rôles dans cette compo.`
  }
  if (labels.length === 1) {
    return `${name} est également ${labels[0]} dans cette compo.`
  }
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1).join(', ')
  return `${name} est également ${rest} et ${last} dans cette compo.`
}

/** @deprecated Use short label + tooltip — kept for legacy callers. */
export function formatMultiRoleOnEventWarningMessage(
  warning: MultiRoleOnEventWarning,
  assigneeGender?: MemberGender | unknown,
): string {
  const labels = formatOtherRoleLabels(warning.otherRoleKeys, assigneeGender)
  if (labels.length === 1) {
    return `Attention : cette personne est aussi composée comme ${labels[0]}.`
  }
  const last = labels[labels.length - 1]
  const rest = labels.slice(0, -1).join(', ')
  return `Attention : cette personne est aussi composée comme ${rest} et ${last}.`
}
