package com.hatcast.api.composition

import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.event.EventEntity
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
     * Counts validated assignments per (participant, role) for draw weights and Dispos % (FR19/FR24).
     *
     * @see SelectionHistoryMode
     */
    fun pastSelectionCountByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> {
        val compartment = SpectacleCategory.slug(event)
        val rows =
            when (mode) {
                SelectionHistoryMode.OPERATIONAL ->
                    slotRepository.countValidatedSelectionsBySeasonAndCategory(
                        event.season.id,
                        event.id,
                        compartment,
                    )
                SelectionHistoryMode.RETROSPECTIVE ->
                    slotRepository.countValidatedSelectionsBeforeEvent(
                        event.season.id,
                        event.id,
                        event.startsAt,
                        event.createdAt,
                        compartment,
                    )
            }
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
