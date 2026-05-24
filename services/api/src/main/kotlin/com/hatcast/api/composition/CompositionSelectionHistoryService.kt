package com.hatcast.api.composition

import org.springframework.stereotype.Service
import java.util.UUID

interface RoleSelectionCountProjection {
    fun getParticipantId(): UUID

    fun getRoleKey(): String

    fun getSelectionCount(): Long
}

@Service
class CompositionSelectionHistoryService(
    private val slotRepository: EventCompositionSlotRepository,
) {
    /**
     * Counts validated assignments per (participant, role) in the season, excluding the current event,
     * archived events, and declined slots (FR19/FR24).
     */
    fun pastSelectionCountByParticipantAndRole(
        seasonId: UUID,
        excludeEventId: UUID,
    ): Map<Pair<UUID, String>, Int> {
        val rows = slotRepository.countValidatedSelectionsBySeason(seasonId, excludeEventId)
        return rows.associate { row ->
            Pair(row.getParticipantId(), row.getRoleKey()) to row.getSelectionCount().toInt()
        }
    }

    fun pastSelectionCountFor(
        counts: Map<Pair<UUID, String>, Int>,
        participantId: UUID,
        roleKey: String,
    ): Int = counts[participantId to roleKey] ?: 0

    fun pastSelectionCountByParticipant(
        counts: Map<Pair<UUID, String>, Int>,
        roleKey: String,
    ): Map<UUID, Int> =
        counts
            .filterKeys { it.second == roleKey }
            .mapKeys { it.key.first }
            .mapValues { it.value }
}
