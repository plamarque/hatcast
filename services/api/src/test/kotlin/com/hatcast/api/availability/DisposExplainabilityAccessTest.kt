package com.hatcast.api.availability

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class DisposExplainabilityAccessTest {
    @Test
    fun `published non-archived event allows member explainability`() {
        val event = event(availabilityOpenedAt = Instant.parse("2026-01-01T00:00:00Z"))
        assert(DisposExplainabilityAccess.canShowExplainability(event, canManageComposition = false))
    }

    @Test
    fun `draft event denies member explainability`() {
        val event = event(availabilityOpenedAt = null)
        assert(!DisposExplainabilityAccess.canShowExplainability(event, canManageComposition = false))
    }

    @Test
    fun `draft event allows organizer explainability`() {
        val event = event(availabilityOpenedAt = null)
        assert(DisposExplainabilityAccess.canShowExplainability(event, canManageComposition = true))
    }

    @Test
    fun `archived event denies explainability even when published`() {
        val event =
            event(
                availabilityOpenedAt = Instant.parse("2026-01-01T00:00:00Z"),
                archived = true,
            )
        assert(!DisposExplainabilityAccess.canShowExplainability(event, canManageComposition = true))
    }

    private fun event(
        availabilityOpenedAt: Instant?,
        archived: Boolean = false,
    ): EventEntity {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "T", slug = "t")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, title = "S", slug = "s")
        return EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "E",
            slug = "e",
            startsAt = Instant.parse("2031-01-01T19:00:00Z"),
            availabilityOpenedAt = availabilityOpenedAt,
            archived = archived,
        )
    }
}
