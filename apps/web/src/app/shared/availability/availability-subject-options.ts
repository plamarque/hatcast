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
