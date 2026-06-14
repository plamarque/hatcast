package com.hatcast.api.availability.draw

import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.RoleSelectionCountProjection
import com.hatcast.api.composition.SelectionHistoryMode
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.SpectacleCategory
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Single module for spectacle category compartment history (story 19.8, ex-17.9).
 *
 * [categorySlug] resolution and [SpectacleCategory.eventInCategory] must stay aligned with JPQL
 * in [com.hatcast.api.composition.EventCompositionSlotRepository.countValidatedSelectionsBySeasonAndCategory]
 * and [countValidatedSelectionsBeforeEvent] — do not change those filters without green golden tests.
 */
@Component
class CategoryCompartmentHistoryScope(
    private val slotRepository: EventCompositionSlotRepository,
) {
    fun categorySlug(event: EventEntity): String = SpectacleCategory.slug(event)

    fun pastSelectionCountByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> {
        val slug = categorySlug(event)
        return queryRows(event, mode, slug).toParticipantRoleCountMap()
    }

    /**
     * Validated selection counts across **all** spectacle categories in the season (breakdown only).
     * Uses dedicated unscoped JPQL — same participation rules as scoped queries, no category filter.
     */
    fun pastSelectionCountUnscopedByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> =
        queryUnscopedRows(event, mode).toParticipantRoleCountMap()

    private fun queryRows(
        event: EventEntity,
        mode: SelectionHistoryMode,
        categorySlug: String,
    ): List<RoleSelectionCountProjection> =
        when (mode) {
            SelectionHistoryMode.OPERATIONAL ->
                slotRepository.countValidatedSelectionsBySeasonAndCategory(
                    event.season.id,
                    event.id,
                    categorySlug,
                )
            SelectionHistoryMode.RETROSPECTIVE ->
                slotRepository.countValidatedSelectionsBeforeEvent(
                    event.season.id,
                    event.id,
                    event.startsAt,
                    event.createdAt,
                    categorySlug,
                )
        }

    private fun queryUnscopedRows(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): List<RoleSelectionCountProjection> =
        when (mode) {
            SelectionHistoryMode.OPERATIONAL ->
                slotRepository.countValidatedSelectionsBySeasonAllCategories(
                    event.season.id,
                    event.id,
                )
            SelectionHistoryMode.RETROSPECTIVE ->
                slotRepository.countValidatedSelectionsBeforeEventAllCategories(
                    event.season.id,
                    event.id,
                    event.startsAt,
                    event.createdAt,
                )
        }

    private fun List<RoleSelectionCountProjection>.toParticipantRoleCountMap(): Map<Pair<UUID, String>, Int> =
        associate { row ->
            Pair(row.getParticipantId(), row.getRoleKey()) to row.getSelectionCount().toInt()
        }
}
