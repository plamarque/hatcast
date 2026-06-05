import { roleLabelSingular, type RoleKey } from '../../shared/event-roles/event-roles'
import { AGENDA_TIME_ZONE } from '../../pages/season-home/season-events.utils'

export interface ConsecutiveShowWarning {
  previousEventId: string
  previousEventTitle: string
  previousEventStartsAt: string
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
  participantDisplayName: string,
): string {
  const formattedDate = formatConsecutiveShowWarningDate(warning.previousEventStartsAt)
  const name = participantDisplayName.trim() || 'Cette personne'
  return `${name} est dans la composition du spectacle précédent du ${formattedDate} : « ${warning.previousEventTitle} ».`
}

/** @deprecated Use short label + tooltip — kept for API parity / legacy callers. */
export function formatConsecutiveShowWarningMessage(
  warning: ConsecutiveShowWarning,
  roleKey: RoleKey | string,
): string {
  const roleLabel = roleLabelSingular(roleKey as RoleKey)
  const formattedDate = formatConsecutiveShowWarningDate(warning.previousEventStartsAt)
  return `Déjà en ${roleLabel} au spectacle « ${warning.previousEventTitle} » (${formattedDate}).`
}
