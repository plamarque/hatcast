import type { AvailabilityStatus } from '../../core/availability/availability-status'
import type { StatisticsEventCell } from '../../core/seasons/season-statistics-api.service'
import { getRoleLabel, type RoleKey } from '../event-roles/event-roles'
import type { MemberGender } from '../../core/account/member-gender'
import type { ParticipantFocusSummary } from '../../pages/season-home/season-participant-focus'
import { participantFocusFromEvent } from '../../pages/season-home/season-participant-focus'

export type SlotParticipationStatus = 'pending' | 'confirmed' | 'declined'

export interface AgendaParticipationStatusView {
  cell: StatisticsEventCell
  availabilityEditable: boolean
}

export function agendaParticipationStatusFromFocus(
  focus: ParticipantFocusSummary,
  canEditAvailability = false,
  gender?: MemberGender | unknown,
): AgendaParticipationStatusView {
  if (focus.inTeam && focus.compositionRoleKey) {
    const roleKey = focus.compositionRoleKey as RoleKey
    const roleLabel = getRoleLabel(roleKey, gender)
    if (focus.slotParticipationStatus === 'pending') {
      return {
        cell: {
          status: 'pending',
          label: roleLabel,
          roleKey,
          tooltip: `${roleLabel} — En attente de confirmation`,
        },
        availabilityEditable: false,
      }
    }
    if (focus.slotParticipationStatus === 'declined') {
      return {
        cell: {
          status: 'declined',
          label: roleLabel,
          roleKey,
          tooltip: `${roleLabel} — Décliné`,
        },
        availabilityEditable: false,
      }
    }
    return {
      cell: {
        status: 'selected',
        label: roleLabel,
        roleKey,
        tooltip: roleLabel,
      },
      availabilityEditable: false,
    }
  }

  switch (focus.availabilityStatus) {
    case 'available':
      return {
        cell: { status: 'available', label: 'Dispo', tooltip: 'Dispo' },
        availabilityEditable: canEditAvailability,
      }
    case 'unavailable':
      return {
        cell: { status: 'unavailable', label: 'Pas dispo', tooltip: 'Pas dispo' },
        availabilityEditable: canEditAvailability,
      }
    default:
      return {
        cell: { status: 'neutral', label: 'Non renseigné', tooltip: 'Non renseigné' },
        availabilityEditable: canEditAvailability,
      }
  }
}

export function agendaParticipationStatusFromEvent(
  ev: {
    myAvailabilityStatus?: AvailabilityStatus | null
    participantFocus?: ParticipantFocusSummary | null
  },
  canEditAvailability = false,
  gender?: MemberGender | unknown,
): AgendaParticipationStatusView {
  return agendaParticipationStatusFromFocus(
    participantFocusFromEvent(ev),
    canEditAvailability,
    gender,
  )
}

export function agendaParticipationStatusAriaLabel(view: AgendaParticipationStatusView): string {
  return view.cell.tooltip ?? view.cell.label
}
