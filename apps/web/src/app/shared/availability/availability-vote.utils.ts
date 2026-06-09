import type { AvailabilityStatus } from '../../core/availability/availability-status'
import {
  normalizeCandidateRoleKeys,
  preferredRoleIntersection,
} from '../../core/availability/availability-role-rules'
import type {
  EventAvailabilitySummary,
  SummaryParticipant,
  SummaryRole,
  SummaryRoleCandidate,
} from '../../core/availability/availability-api.service'
import type { RoleKey, RoleSlots } from '../../core/events/event-types'

export type PollRowKind = 'unavailable' | 'available' | 'role'

export function roleGaugeFillPercent(candidates: number, requiredCount: number): number {
  return Math.min(100, Math.round((100 * candidates) / Math.max(1, requiredCount)))
}

export function computeVoteFromChecks(options: {
  hasRoles: boolean
  unavailableChecked: boolean
  availableChecked: boolean
  checkedRoleKeys: RoleKey[]
}): { status: AvailabilityStatus; roleKeys: RoleKey[] } {
  if (options.hasRoles) {
    if (options.unavailableChecked) {
      return { status: 'unavailable', roleKeys: [] }
    }
    if (options.checkedRoleKeys.length === 0) {
      return { status: 'unknown', roleKeys: [] }
    }
    return { status: 'available', roleKeys: options.checkedRoleKeys }
  }

  if (options.unavailableChecked) {
    return { status: 'unavailable', roleKeys: [] }
  }
  if (options.availableChecked) {
    return { status: 'available', roleKeys: [] }
  }
  return { status: 'unknown', roleKeys: [] }
}

export function checkedRoleKeysFromSubject(
  roleSlots: RoleSlots,
  subject: SummaryParticipant,
): RoleKey[] {
  if (subject.status !== 'available') {
    return []
  }
  return normalizeCandidateRoleKeys(roleSlots, subject.roleKeys, false)
}

export function isSubjectUnavailable(subject: SummaryParticipant): boolean {
  return subject.status === 'unavailable'
}

export function isSubjectAvailableFlat(subject: SummaryParticipant): boolean {
  return subject.status === 'available'
}

export function isRoleChecked(roleSlots: RoleSlots, subject: SummaryParticipant, roleKey: RoleKey): boolean {
  return checkedRoleKeysFromSubject(roleSlots, subject).includes(roleKey)
}

export function toggleRoleCheck(
  roleSlots: RoleSlots,
  currentKeys: RoleKey[],
  roleKey: RoleKey,
  checked: boolean,
  applyVolunteerRule: boolean,
): RoleKey[] {
  const next = checked
    ? [...currentKeys, roleKey]
    : currentKeys.filter((key) => key !== roleKey)
  return normalizeCandidateRoleKeys(roleSlots, next, applyVolunteerRule)
}

export function preferredRolesForPrecheck(
  roleSlots: RoleSlots,
  preferredRoleKeys: readonly string[],
): RoleKey[] {
  return preferredRoleIntersection(roleSlots, preferredRoleKeys)
}

export function participantToCandidate(participant: SummaryParticipant): SummaryRoleCandidate {
  return {
    participantId: participant.participantId,
    displayName: participant.displayName,
    avatarUrl: participant.avatarUrl ?? null,
    gender: participant.gender,
  }
}

export function patchSummaryOptimistic(
  summary: EventAvailabilitySummary,
  subjectParticipantId: string,
  nextStatus: AvailabilityStatus,
  nextRoleKeys: RoleKey[],
): EventAvailabilitySummary {
  const previous = summary.participants.find((p) => p.participantId === subjectParticipantId)
  if (!previous) {
    return summary
  }

  const participants = summary.participants.map((p) =>
    p.participantId === subjectParticipantId
      ? { ...p, status: nextStatus, roleKeys: nextRoleKeys }
      : p,
  )

  const roles = summary.roles.map((role) =>
    patchRoleCandidates(role, subjectParticipantId, previous, nextStatus, nextRoleKeys),
  )

  return { ...summary, participants, roles }
}

function patchRoleCandidates(
  role: SummaryRole,
  subjectParticipantId: string,
  previous: SummaryParticipant,
  nextStatus: AvailabilityStatus,
  nextRoleKeys: RoleKey[],
): SummaryRole {
  const wasCandidate =
    previous.status === 'available' && previous.roleKeys.includes(role.roleKey)
  const isCandidate = nextStatus === 'available' && nextRoleKeys.includes(role.roleKey as RoleKey)

  if (wasCandidate === isCandidate) {
    return role
  }

  let candidates = [...role.candidates]
  if (isCandidate && !wasCandidate) {
    candidates = [...candidates, participantToCandidate({ ...previous, status: nextStatus, roleKeys: nextRoleKeys })]
  } else if (!isCandidate && wasCandidate) {
    candidates = candidates.filter((c) => c.participantId !== subjectParticipantId)
  }
  return { ...role, candidates }
}

export function flatUnavailableCount(participants: SummaryParticipant[]): number {
  return participants.filter((p) => p.status === 'unavailable').length
}

export function flatAvailableCount(participants: SummaryParticipant[]): number {
  return participants.filter((p) => p.status === 'available').length
}
