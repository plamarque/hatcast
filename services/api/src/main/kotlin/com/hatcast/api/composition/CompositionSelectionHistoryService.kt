package com.hatcast.api.composition

import com.hatcast.api.availability.draw.CategoryCompartmentHistoryScope
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
    private val compartmentHistory: CategoryCompartmentHistoryScope,
) {
    /**
     * Counts validated assignments per (participant, role) for draw weights and Dispos % (FR19/FR24).
     * Scoped to the event's spectacle category compartment (ex-17.9, hardened in 19.8).
     *
     * @see SelectionHistoryMode
     */
    fun pastSelectionCountByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> =
        compartmentHistory.pastSelectionCountByParticipantAndRole(event, mode)

    /**
     * All-category validated assignment counts (explainability breakdown only — story 19.8).
     */
    fun pastSelectionCountUnscopedByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> =
        compartmentHistory.pastSelectionCountUnscopedByParticipantAndRole(event, mode)

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
