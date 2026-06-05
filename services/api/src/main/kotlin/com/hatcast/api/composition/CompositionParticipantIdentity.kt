package com.hatcast.api.composition

import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import java.util.UUID

/**
 * Canonical identity for composition slot assignees (season id and/or linked user id).
 * Used when matching the same person across events even if slot storage differs (season vs event participant id).
 */
internal data class CompositionParticipantIdentity(
    val seasonParticipantId: UUID?,
    val userId: UUID?,
) {
    fun matchesRoleWith(
        roleKey: String,
        otherRoleKey: String,
        other: CompositionParticipantIdentity,
    ): Boolean {
        if (roleKey != otherRoleKey) {
            return false
        }
        if (seasonParticipantId != null && seasonParticipantId == other.seasonParticipantId) {
            return true
        }
        if (userId != null && userId == other.userId) {
            return true
        }
        return false
    }
}

internal object CompositionParticipantIdentityResolver {
    fun identitiesForSlots(
        slots: List<EventCompositionSlotEntity>,
        seasonParticipantRepository: SeasonParticipantRepository,
        eventParticipantRepository: EventParticipantRepository,
    ): Map<UUID, CompositionParticipantIdentity> {
        val seasonIds = slots.mapNotNull { it.seasonParticipantId }.toSet()
        val eventIds = slots.mapNotNull { it.eventParticipantId }.toSet()

        val seasonRowsById =
            if (seasonIds.isEmpty()) {
                emptyMap()
            } else {
                seasonParticipantRepository.findAllById(seasonIds).associateBy { it.id }
            }
        val eventRowsById =
            if (eventIds.isEmpty()) {
                emptyMap()
            } else {
                eventParticipantRepository.findAllById(eventIds).associateBy { it.id }
            }

        return slots.mapNotNull { slot ->
            val assignedId = slot.assignedParticipantId() ?: return@mapNotNull null
            assignedId to identityForSlot(slot, seasonRowsById, eventRowsById)
        }.toMap()
    }

    private fun identityForSlot(
        slot: EventCompositionSlotEntity,
        seasonRowsById: Map<UUID, com.hatcast.api.participant.SeasonParticipantEntity>,
        eventRowsById: Map<UUID, com.hatcast.api.participant.EventParticipantEntity>,
    ): CompositionParticipantIdentity {
        slot.seasonParticipantId?.let { seasonId ->
            val row = seasonRowsById[seasonId]
            return CompositionParticipantIdentity(
                seasonParticipantId = seasonId,
                userId = row?.user?.id,
            )
        }
        slot.eventParticipantId?.let { eventParticipantId ->
            val row = eventRowsById[eventParticipantId]
            return CompositionParticipantIdentity(
                seasonParticipantId = row?.seasonParticipant?.id,
                userId = row?.user?.id,
            )
        }
        return CompositionParticipantIdentity(null, null)
    }
}
