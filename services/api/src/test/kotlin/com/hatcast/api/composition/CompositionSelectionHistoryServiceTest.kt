package com.hatcast.api.composition

import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class CompositionSelectionHistoryServiceTest {
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val service = CompositionSelectionHistoryService(slotRepository)

    private fun event(
        id: UUID = UUID.randomUUID(),
        seasonId: UUID = UUID.randomUUID(),
        startsAt: Instant = Instant.parse("2031-06-01T19:00:00Z"),
    ): EventEntity {
        val season = mock<com.hatcast.api.season.SeasonEntity>()
        whenever(season.id).thenReturn(seasonId)
        return EventEntity(
            id = id,
            season = season,
            title = "Show",
            slug = "show",
            startsAt = startsAt,
            createdAt = Instant.parse("2031-01-01T12:00:00Z"),
        )
    }

    @Test
    fun `maps projection rows to participant role counts in operational mode`() {
        val target = event()
        val participantId = UUID.randomUUID()
        val projection =
            object : RoleSelectionCountProjection {
                override fun getParticipantId(): UUID = participantId

                override fun getRoleKey(): String = "player"

                override fun getSelectionCount(): Long = 3
            }
        whenever(
            slotRepository.countValidatedSelectionsBySeasonAndCategory(
                target.season.id,
                target.id,
                SpectacleCategory.PRINCIPAL,
            ),
        ).thenReturn(listOf(projection))

        val counts =
            service.pastSelectionCountByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(3, counts[participantId to "player"])
        assertEquals(3, service.pastSelectionCountFor(counts, participantId, "player"))
        assertEquals(
            mapOf(participantId to 3),
            service.pastSelectionCountByParticipant(counts, "player"),
        )
    }

    @Test
    fun `retrospective mode queries only events before target`() {
        val target = event()
        whenever(
            slotRepository.countValidatedSelectionsBeforeEvent(
                target.season.id,
                target.id,
                target.startsAt,
                target.createdAt,
                SpectacleCategory.PRINCIPAL,
            ),
        ).thenReturn(emptyList())

        service.pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.RETROSPECTIVE,
        )

        verify(slotRepository).countValidatedSelectionsBeforeEvent(
            target.season.id,
            target.id,
            target.startsAt,
            target.createdAt,
            SpectacleCategory.PRINCIPAL,
        )
    }

    @Test
    fun `operational mode forwards compartment slug to repository`() {
        val seasonId = UUID.randomUUID()
        val season = mock<com.hatcast.api.season.SeasonEntity>()
        whenever(season.id).thenReturn(seasonId)
        val target =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Away",
                slug = "away",
                startsAt = Instant.parse("2031-06-01T19:00:00Z"),
                templateType = "deplacement",
            )
        whenever(
            slotRepository.countValidatedSelectionsBySeasonAndCategory(
                seasonId,
                target.id,
                SpectacleCategory.DEPLACEMENTS,
            ),
        ).thenReturn(emptyList())

        service.pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.OPERATIONAL,
        )

        verify(slotRepository).countValidatedSelectionsBySeasonAndCategory(
            seasonId,
            target.id,
            SpectacleCategory.DEPLACEMENTS,
        )
    }
}
