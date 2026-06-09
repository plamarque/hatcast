package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant

class NotificationPayloadBuilderTeamCompleteMemberTest {
    private val builder = NotificationPayloadBuilder()

    @Test
    fun `TEAM_COMPLETE_MEMBER copy is distinct from TEAM_VALIDATED_FYI`() {
        val event = eventEntity()

        val teamComplete =
            builder.build(
                intent = NotificationIntent.TEAM_COMPLETE_MEMBER,
                event = event,
                recipientName = "Alice",
            )
        val teamValidated =
            builder.build(
                intent = NotificationIntent.TEAM_VALIDATED_FYI,
                event = event,
                recipientName = "Alice",
            )

        assertEquals("🎉 Équipe au complet", teamComplete.title)
        assertEquals("✅ Équipe validée", teamValidated.title)
        assertNotEquals(teamComplete.body, teamValidated.body)
        assertTrue(
            builder.buildEmailSubject(NotificationIntent.TEAM_COMPLETE_MEMBER, event)
                .startsWith("🎉 Équipe au complet · Spectacle test ("),
        )
        assertTrue(
            builder.buildEmailSubject(NotificationIntent.TEAM_VALIDATED_FYI, event)
                .startsWith("✅ Équipe validée · Spectacle test ("),
        )
        assertEquals("/saison/saison-test/event/spectacle-test?tab=equipe", teamComplete.url)
    }

    private fun eventEntity(): EventEntity {
        val season = SeasonEntity(troupe = mock(), slug = "saison-test", title = "Saison")
        whenever(season.troupe.slug).thenReturn("troupe-test")
        return EventEntity(
            season = season,
            title = "Spectacle test",
            slug = "spectacle-test",
            startsAt = Instant.parse("2032-01-15T19:00:00Z"),
        )
    }
}
