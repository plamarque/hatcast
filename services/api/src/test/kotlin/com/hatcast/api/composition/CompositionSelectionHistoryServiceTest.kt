package com.hatcast.api.composition

import com.hatcast.api.availability.draw.CategoryCompartmentHistoryScope
import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class CompositionSelectionHistoryServiceTest {
    private val compartmentHistory: CategoryCompartmentHistoryScope = mock()
    private val service = CompositionSelectionHistoryService(compartmentHistory)

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
        val counts = mapOf((participantId to "player") to 3)
        whenever(
            compartmentHistory.pastSelectionCountByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            ),
        ).thenReturn(counts)

        val result =
            service.pastSelectionCountByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(3, result[participantId to "player"])
        assertEquals(3, service.pastSelectionCountFor(result, participantId, "player"))
        assertEquals(
            mapOf(participantId to 3),
            service.pastSelectionCountByParticipant(result, "player"),
        )
    }

    @Test
    fun `delegates retrospective mode to compartment history scope`() {
        val target = event()
        whenever(
            compartmentHistory.pastSelectionCountByParticipantAndRole(
                target,
                SelectionHistoryMode.RETROSPECTIVE,
            ),
        ).thenReturn(emptyMap())

        service.pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.RETROSPECTIVE,
        )

        verify(compartmentHistory).pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.RETROSPECTIVE,
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
            compartmentHistory.pastSelectionCountByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            ),
        ).thenReturn(emptyMap())

        service.pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.OPERATIONAL,
        )

        verify(compartmentHistory).pastSelectionCountByParticipantAndRole(
            target,
            SelectionHistoryMode.OPERATIONAL,
        )
    }

    @Test
    fun `unscoped counts delegate to compartment history scope`() {
        val target = event()
        val participantId = UUID.randomUUID()
        whenever(
            compartmentHistory.pastSelectionCountUnscopedByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            ),
        ).thenReturn(mapOf((participantId to "player") to 5))

        val counts =
            service.pastSelectionCountUnscopedByParticipantAndRole(
                target,
                SelectionHistoryMode.OPERATIONAL,
            )
        assertEquals(5, counts[participantId to "player"])
    }
}
