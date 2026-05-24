package com.hatcast.api.composition

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

class CompositionSelectionHistoryServiceTest {
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val service = CompositionSelectionHistoryService(slotRepository)

    @Test
    fun `maps projection rows to participant role counts`() {
        val seasonId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val projection =
            object : RoleSelectionCountProjection {
                override fun getParticipantId(): UUID = participantId

                override fun getRoleKey(): String = "player"

                override fun getSelectionCount(): Long = 3
            }
        whenever(slotRepository.countValidatedSelectionsBySeason(seasonId, eventId))
            .thenReturn(listOf(projection))

        val counts = service.pastSelectionCountByParticipantAndRole(seasonId, eventId)
        assertEquals(3, counts[participantId to "player"])
        assertEquals(3, service.pastSelectionCountFor(counts, participantId, "player"))
        assertEquals(
            mapOf(participantId to 3),
            service.pastSelectionCountByParticipant(counts, "player"),
        )
    }
}
