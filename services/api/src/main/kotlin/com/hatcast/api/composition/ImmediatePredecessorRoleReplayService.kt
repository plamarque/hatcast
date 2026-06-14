package com.hatcast.api.composition

import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.stereotype.Service
import java.util.UUID

/** Result of batch immediate-predecessor same-role replay lookup (story 19.9). */
data class ImmediatePredecessorReplaySnapshot(
    val predecessor: EventEntity?,
    val playedSameRoleOnImmediatePredecessorByParticipant: Map<UUID, Boolean>,
)

@Service
class ImmediatePredecessorRoleReplayService(
    private val immediatePredecessorEventResolver: ImmediatePredecessorEventResolver,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
) {
    /**
     * Batch predicate: did each pool participant hold [roleKey] on the immediate validated predecessor
     * in the same category compartment (non-DECLINED slot)?
     */
    fun playedSameRoleOnImmediatePredecessorByParticipant(
        currentEvent: EventEntity,
        roleKey: String,
        eligibleInPool: List<CompositionEligibleParticipant>,
    ): ImmediatePredecessorReplaySnapshot {
        val participantIdentities = identitiesForEligibleParticipants(eligibleInPool)
        val predecessor =
            immediatePredecessorEventResolver.resolve(currentEvent)
                ?: return ImmediatePredecessorReplaySnapshot(null, participantIdentities.mapValues { false })

        val predecessorSlots = validatedPredecessorSlots(predecessor)
        if (predecessorSlots.isEmpty()) {
            return ImmediatePredecessorReplaySnapshot(predecessor, participantIdentities.mapValues { false })
        }

        val predecessorIdentities =
            CompositionParticipantIdentityResolver.identitiesForSlots(
                predecessorSlots,
                seasonParticipantRepository,
                eventParticipantRepository,
            )

        val triggered =
            participantIdentities.mapValues { (_, identity) ->
                playedSameRoleOnPredecessor(
                    roleKey = roleKey,
                    candidateIdentity = identity,
                    predecessorSlots = predecessorSlots,
                    predecessorIdentities = predecessorIdentities,
                )
            }
        return ImmediatePredecessorReplaySnapshot(predecessor, triggered)
    }

    internal fun playedSameRoleOnPredecessor(
        roleKey: String,
        candidateIdentity: CompositionParticipantIdentity,
        predecessorSlots: List<EventCompositionSlotEntity>,
        predecessorIdentities: Map<UUID, CompositionParticipantIdentity>,
    ): Boolean =
        predecessorSlots.any { predecessorSlot ->
            val predecessorParticipantId =
                predecessorSlot.assignedParticipantId() ?: return@any false
            val predecessorIdentity = predecessorIdentities[predecessorParticipantId] ?: return@any false
            candidateIdentity.matchesRoleWith(
                roleKey,
                predecessorSlot.roleKey,
                predecessorIdentity,
            )
        }

    private fun validatedPredecessorSlots(predecessor: EventEntity): List<EventCompositionSlotEntity> =
        slotRepository
            .findByEventId(predecessor.id)
            .filter { it.hasAssignee() && it.participationStatus != SlotParticipationStatus.DECLINED }

    private fun identitiesForEligibleParticipants(
        eligible: List<CompositionEligibleParticipant>,
    ): Map<UUID, CompositionParticipantIdentity> =
        eligible.associate { row ->
            row.participantId to identityForEligibleParticipant(row)
        }

    private fun identityForEligibleParticipant(
        row: CompositionEligibleParticipant,
    ): CompositionParticipantIdentity =
        when (row.source) {
            CompositionParticipantSource.SEASON ->
                CompositionParticipantIdentity(
                    seasonParticipantId = row.participantId,
                    userId = row.userId,
                )
            CompositionParticipantSource.EVENT -> {
                val eventRow = eventParticipantRepository.findById(row.participantId).orElse(null)
                CompositionParticipantIdentity(
                    seasonParticipantId = eventRow?.seasonParticipant?.id,
                    userId = row.userId ?: eventRow?.user?.id,
                )
            }
        }
}
