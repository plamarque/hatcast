package com.hatcast.api.composition

import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class SelectionHistoryModeResolverTest {
    @Test
    fun `past event uses retrospective mode`() {
        val event =
            EventEntity(
                id = UUID.randomUUID(),
                season = mockSeason(),
                title = "Past",
                slug = "past",
                startsAt = Instant.parse("2020-01-01T19:00:00Z"),
            )
        assertEquals(
            SelectionHistoryMode.RETROSPECTIVE,
            SelectionHistoryModeResolver.forEvent(event, Instant.parse("2025-01-01T00:00:00Z")),
        )
    }

    @Test
    fun `future event uses operational mode`() {
        val event =
            EventEntity(
                id = UUID.randomUUID(),
                season = mockSeason(),
                title = "Future",
                slug = "future",
                startsAt = Instant.parse("2030-01-01T19:00:00Z"),
            )
        assertEquals(
            SelectionHistoryMode.OPERATIONAL,
            SelectionHistoryModeResolver.forEvent(event, Instant.parse("2025-01-01T00:00:00Z")),
        )
    }

    private fun mockSeason(): com.hatcast.api.season.SeasonEntity {
        val troupe = org.mockito.kotlin.mock<com.hatcast.api.troupe.TroupeEntity>()
        return com.hatcast.api.season.SeasonEntity(
            troupe = troupe,
            slug = "test",
            title = "Test",
        )
    }
}
