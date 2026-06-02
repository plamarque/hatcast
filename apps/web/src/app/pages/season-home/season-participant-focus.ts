import type { AvailabilityStatus } from '../../core/availability/availability-status'
import { availabilityBadgeLabel } from '../../core/availability/availability-status'
import { roleLabelSingular, type RoleKey } from '../../shared/event-roles/event-roles'

export interface ParticipantFocusSummary {
  availabilityStatus: AvailabilityStatus
  compositionRoleKey?: string | null
  inTeam: boolean
  slotParticipationStatus?: 'pending' | 'confirmed' | 'declined' | null
}

/** Pill Historique (UX-DR19 — ex. « Comédien·ne · dans l'équipe »). */
export function formatParticipantFocusLabel(focus: ParticipantFocusSummary): string {
  if (focus.inTeam && focus.compositionRoleKey) {
    const role = roleLabelSingular(focus.compositionRoleKey as RoleKey)
    return `${role} · dans l'équipe`
  }
  const dispo = availabilityBadgeLabel(focus.availabilityStatus)
  if (focus.availabilityStatus === 'available') {
    return `${dispo} · pas sélectionné`
  }
  return dispo
}

export function participantFocusFromEvent(ev: {
  myAvailabilityStatus?: AvailabilityStatus | null
  participantFocus?: ParticipantFocusSummary | null
}): ParticipantFocusSummary {
  if (ev.participantFocus) {
    return ev.participantFocus
  }
  return {
    availabilityStatus: ev.myAvailabilityStatus ?? 'unknown',
    inTeam: false,
  }
}

/** Keeps list cards in sync after the availability dialog (UI reads participantFocus first). */
export function applyAvailabilityUpdateToAgendaEvent<
  T extends {
    myAvailabilityStatus?: AvailabilityStatus | null
    participantFocus?: ParticipantFocusSummary | null
  },
>(ev: T, status: AvailabilityStatus): T {
  if (!ev.participantFocus) {
    return { ...ev, myAvailabilityStatus: status }
  }
  return {
    ...ev,
    myAvailabilityStatus: status,
    participantFocus: { ...ev.participantFocus, availabilityStatus: status },
  }
}
