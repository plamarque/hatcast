import { getRoleLabel, type RoleKey } from '../../shared/event-roles/event-roles'
import type { MemberGender } from '../account/member-gender'
import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'

export interface ConsecutiveShowWarning {
  previousEventId: string
  previousEventTitle: string
  previousEventStartsAt: string
  events?: { eventId: string; title: string; startsAt: string; category: string; scopes: ('global' | 'category')[] }[]
}

/** Compact label on the équipe row (story 6.20 UX). */
export const CONSECUTIVE_SHOW_WARNING_SHORT_LABEL = 'Joue deux fois de suite'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: AGENDA_TIME_ZONE,
})

export function formatConsecutiveShowWarningDate(startsAt: string): string {
  return dateFormatter.format(new Date(startsAt))
}

/** Full detail for tooltip / aria-label on click. */
export function formatConsecutiveShowWarningTooltip(
  warning: ConsecutiveShowWarning,
  _participantDisplayName: string,
): string {
  const shortDate = (startsAt: string) => new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', timeZone: AGENDA_TIME_ZONE,
  }).format(new Date(startsAt))
  const events = warning.events?.length
    ? warning.events
    : [{ title: warning.previousEventTitle, startsAt: warning.previousEventStartsAt }]
  return events.map(event => `- ${shortDate(event.startsAt)} : ${event.title}`).join('\n')
}

/** @deprecated Use short label + tooltip — kept for API parity / legacy callers. */
export function formatConsecutiveShowWarningMessage(
  warning: ConsecutiveShowWarning,
  roleKey: RoleKey | string,
  assigneeGender?: MemberGender | unknown,
): string {
  const roleLabel = getRoleLabel(roleKey as RoleKey, assigneeGender)
  const formattedDate = formatConsecutiveShowWarningDate(warning.previousEventStartsAt)
  return `Déjà en ${roleLabel} au spectacle « ${warning.previousEventTitle} » (${formattedDate}).`
}
