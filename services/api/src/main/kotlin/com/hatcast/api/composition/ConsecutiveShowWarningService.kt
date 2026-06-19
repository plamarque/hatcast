package com.hatcast.api.composition

import com.hatcast.api.composition.dto.ConsecutiveShowWarningDto
import com.hatcast.api.event.EventEntity
import org.springframework.stereotype.Service

@Service
class ConsecutiveShowWarningService(
    private val immediatePredecessorRoleReplayService: ImmediatePredecessorRoleReplayService,
    private val immediatePredecessorEventResolver: ImmediatePredecessorEventResolver,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: com.hatcast.api.participant.SeasonParticipantRepository,
    private val eventParticipantRepository: com.hatcast.api.participant.EventParticipantRepository,
) {
    /**
     * Batch warning lookup for current event slots (≤ 4 DB round-trips: predecessor + both slot lists + identity lookups).
     */
    fun warningsBySlotKey(
        currentEvent: EventEntity,
        currentSlots: List<EventCompositionSlotEntity>,
    ): Map<Pair<String, Int>, ConsecutiveShowWarningDto> {
        val predecessor =
            immediatePredecessorEventResolver.resolve(currentEvent)
                ?: return emptyMap()

        val predecessorSlots =
            slotRepository
                .findByEventId(predecessor.id)
                .filter { it.hasAssignee() && it.participationStatus != SlotParticipationStatus.DECLINED }

        if (predecessorSlots.isEmpty()) {
            return emptyMap()
        }

        val predecessorIdentities =
            CompositionParticipantIdentityResolver.identitiesForSlots(
                predecessorSlots,
                seasonParticipantRepository,
                eventParticipantRepository,
            )
        val currentIdentities =
            CompositionParticipantIdentityResolver.identitiesForSlots(
                currentSlots.filter { it.hasAssignee() },
                seasonParticipantRepository,
                eventParticipantRepository,
            )

        val warning =
            ConsecutiveShowWarningDto(
                previousEventId = predecessor.id,
                previousEventTitle = predecessor.title,
                previousEventStartsAt = predecessor.startsAt,
            )

        return currentSlots
            .mapNotNull { slot ->
                val participantId = slot.assignedParticipantId() ?: return@mapNotNull null
                val currentIdentity = currentIdentities[participantId] ?: return@mapNotNull null
                val repeatsRoleOnPredecessor =
                    immediatePredecessorRoleReplayService.playedSameRoleOnPredecessor(
                        roleKey = slot.roleKey,
                        candidateIdentity = currentIdentity,
                        predecessorSlots = predecessorSlots,
                        predecessorIdentities = predecessorIdentities,
                    )
                if (repeatsRoleOnPredecessor) {
                    (slot.roleKey to slot.slotIndex) to warning
                } else {
                    null
                }
            }.toMap()
    }
}
