package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class NotificationPayloadBuilderManualNudgeTest {
    private val builder = NotificationPayloadBuilder()

    @Test
    fun `MANUAL_AVAILABILITY_NUDGE uses custom body when provided`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                event = event,
                recipientName = "Alice",
                customMessageBody = "⏰ Message orga personnalisé",
            )

        assertEquals("⏰ Rappel disponibilité", payload.title)
        assertEquals("⏰ Message orga personnalisé", payload.body)
        assertTrue(payload.url.contains("?tab=dispos"))
    }

    @Test
    fun `MANUAL_AVAILABILITY_NUDGE email subject matches reminder template`() {
        val event = sampleEvent()
        val subject = builder.buildEmailSubject(NotificationIntent.MANUAL_AVAILABILITY_NUDGE, event)
        assertTrue(subject.startsWith("Rappel disponibilité · "))
    }

    private fun sampleEvent(): EventEntity {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(troupe = troupe, slug = "saison-a", title = "Saison")
        return EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "Spectacle test",
            slug = "spectacle-test",
            startsAt = Instant.parse("2032-06-01T19:00:00Z"),
        )
    }
}
