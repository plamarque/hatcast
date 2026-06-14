package com.hatcast.api.availability.draw

import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.RoleSelectionCountProjection
import com.hatcast.api.composition.SelectionHistoryMode
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.SpectacleCategory
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class CategoryCompartmentHistoryScopeTest {
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val scope = CategoryCompartmentHistoryScope(slotRepository)

    private fun event(
        id: UUID = UUID.randomUUID(),
        seasonId: UUID = UUID.randomUUID(),
        templateType: String = "match",
        category: String? = null,
    ): EventEntity {
        val season = mock<com.hatcast.api.season.SeasonEntity>()
        whenever(season.id).thenReturn(seasonId)
        return EventEntity(
            id = id,
            season = season,
            title = "Show",
            slug = "show",
            startsAt = Instant.parse("2031-06-01T19:00:00Z"),
            createdAt = Instant.parse("2031-01-01T12:00:00Z"),
            templateType = templateType,
            category = category,
        )
    }

    @Test
    fun `categorySlug resolves principal deplacements and glossary`() {
        assertEquals(SpectacleCategory.PRINCIPAL, scope.categorySlug(event()))
        assertEquals(
            SpectacleCategory.DEPLACEMENTS,
            scope.categorySlug(event(templateType = "deplacement")),
        )
        assertEquals(
            SpectacleCategory.DEPLACEMENTS,
            scope.categorySlug(event(category = "deplacements")),
        )
        assertEquals("aperock", scope.categorySlug(event(category = "aperock")))
    }

    @Test
    fun `scoped operational query forwards compartment slug to repository`() {
        val target = event(category = "aperock")
        whenever(
            slotRepository.countValidatedSelectionsBySeasonAndCategory(
                target.season.id,
                target.id,
                "aperock",
            ),
        ).thenReturn(emptyList())

        scope.pastSelectionCountByParticipantAndRole(target, SelectionHistoryMode.OPERATIONAL)

        verify(slotRepository).countValidatedSelectionsBySeasonAndCategory(
            target.season.id,
            target.id,
            "aperock",
        )
    }

    @Test
    fun `unscoped operational query uses all-categories repository method`() {
        val target = event()
        val participantId = UUID.randomUUID()
        val projection =
            object : RoleSelectionCountProjection {
                override fun getParticipantId(): UUID = participantId

                override fun getRoleKey(): String = "player"

                override fun getSelectionCount(): Long = 4
            }
        whenever(
            slotRepository.countValidatedSelectionsBySeasonAllCategories(
                target.season.id,
                target.id,
            ),
        ).thenReturn(listOf(projection))

        val counts =
            scope.pastSelectionCountUnscopedByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            )

        assertEquals(4, counts[participantId to "player"])
        verify(slotRepository).countValidatedSelectionsBySeasonAllCategories(
            target.season.id,
            target.id,
        )
    }

    @Test
    fun `scoped retrospective query forwards compartment slug to repository`() {
        val target = event(templateType = "deplacement")
        whenever(
            slotRepository.countValidatedSelectionsBeforeEvent(
                target.season.id,
                target.id,
                target.startsAt,
                target.createdAt,
                SpectacleCategory.DEPLACEMENTS,
            ),
        ).thenReturn(emptyList())

        scope.pastSelectionCountByParticipantAndRole(target, SelectionHistoryMode.RETROSPECTIVE)

        verify(slotRepository).countValidatedSelectionsBeforeEvent(
            target.season.id,
            target.id,
            target.startsAt,
            target.createdAt,
            SpectacleCategory.DEPLACEMENTS,
        )
    }

    @Test
    fun `retrospective unscoped query uses before-event all-categories method`() {
        val target = event()
        whenever(
            slotRepository.countValidatedSelectionsBeforeEventAllCategories(
                target.season.id,
                target.id,
                target.startsAt,
                target.createdAt,
            ),
        ).thenReturn(emptyList())

        scope.pastSelectionCountUnscopedByParticipantAndRole(
            target,
            SelectionHistoryMode.RETROSPECTIVE,
        )

        verify(slotRepository).countValidatedSelectionsBeforeEventAllCategories(
            target.season.id,
            target.id,
            target.startsAt,
            target.createdAt,
        )
    }
}
