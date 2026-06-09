import type { AvailabilityStatus } from '../../core/availability/availability-status'
import type { StatisticsEventCell } from '../../core/seasons/season-statistics-api.service'
import { getRoleLabel, type RoleKey } from '../event-roles/event-roles'
import type { MemberGender } from '../../core/account/member-gender'
import type { ParticipantFocusSummary } from '../../pages/season-home/season-participant-focus'
import {
  isDeclinedParticipationFocus,
  participantFocusFromEvent,
} from '../../pages/season-home/season-participant-focus'

export type SlotParticipationStatus = 'pending' | 'confirmed' | 'declined'

export interface AgendaParticipationStatusView {
  cell: StatisticsEventCell
  availabilityEditable: boolean
  participationEditable: boolean
}

export function agendaParticipationStatusFromFocus(
  focus: ParticipantFocusSummary,
  canEditAvailability = false,
  gender?: MemberGender | unknown,
  canConfirmParticipation = false,
): AgendaParticipationStatusView {
  if (isDeclinedParticipationFocus(focus)) {
    const roleKey = focus.compositionRoleKey as RoleKey
    const roleLabel = getRoleLabel(roleKey, gender)
    return {
      cell: {
        status: 'declined',
        label: roleLabel,
        roleKey,
        tooltip: `${roleLabel} — Retrait`,
      },
      availabilityEditable: false,
      participationEditable: false,
    }
  }

  if (focus.inTeam && focus.compositionRoleKey) {
    const roleKey = focus.compositionRoleKey as RoleKey
    const roleLabel = getRoleLabel(roleKey, gender)
    const participationEditable = canConfirmParticipation
    if (focus.slotParticipationStatus === 'pending') {
      return {
        cell: {
          status: 'pending',
          label: roleLabel,
          roleKey,
          tooltip: `${roleLabel} — En attente de confirmation`,
        },
        availabilityEditable: false,
        participationEditable,
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
      participationEditable,
    }
  }

  switch (focus.availabilityStatus) {
    case 'available':
      return {
        cell: { status: 'available', label: 'Dispo', tooltip: 'Dispo' },
        availabilityEditable: canEditAvailability,
        participationEditable: false,
      }
    case 'unavailable':
      return {
        cell: { status: 'unavailable', label: 'Pas dispo', tooltip: 'Pas dispo' },
        availabilityEditable: canEditAvailability,
        participationEditable: false,
      }
    default:
      return {
        cell: { status: 'neutral', label: 'Non renseigné', tooltip: 'Non renseigné' },
        availabilityEditable: canEditAvailability,
        participationEditable: false,
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
  canConfirmParticipation = false,
): AgendaParticipationStatusView {
  return agendaParticipationStatusFromFocus(
    participantFocusFromEvent(ev),
    canEditAvailability,
    gender,
    canConfirmParticipation,
  )
}

export function agendaParticipationStatusAriaLabel(view: AgendaParticipationStatusView): string {
  return view.cell.tooltip ?? view.cell.label
}
