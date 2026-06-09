import type { SummaryParticipant } from '../../core/availability/availability-api.service'
import type { ParticipantSelector } from '../../core/participants/participant-api.service'

/** Maps availability summary rows to subject-selector options for the current event. */
export function summaryParticipantsToSelectors(
  participants: SummaryParticipant[],
): ParticipantSelector[] {
  return participants.map((p) => ({
    id: p.participantId,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl ?? null,
    kind: p.userId ? 'LINKED' : 'NAME_ONLY',
    userId: p.userId ?? null,
    gender: p.gender,
  }))
}

export function resolveDefaultSubjectParticipantId(
  participants: SummaryParticipant[],
  options: {
    currentUserId: string
    linkedParticipantId: string | null
    canSwitchSubject: boolean
  },
): string | null {
  if (!participants.length) {
    return null
  }

  if (options.currentUserId) {
    const self = participants.find((p) => p.userId === options.currentUserId)
    if (self) {
      return self.participantId
    }
  }

  if (
    options.linkedParticipantId &&
    participants.some((p) => p.participantId === options.linkedParticipantId)
  ) {
    return options.linkedParticipantId
  }

  if (options.canSwitchSubject) {
    return participants[0].participantId
  }

  return null
}
