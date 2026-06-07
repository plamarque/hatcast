package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class NotificationPayloadBuilderAvailabilityPendingReminderTest {
    private val builder = NotificationPayloadBuilder()

    @Test
    fun `AVAILABILITY_PENDING_REMINDER payload matches manual nudge tone`() {
        val event = sampleEvent()

        val payload =
            builder.build(
                intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                event = event,
                recipientName = "Alice",
            )

        assertEquals("⏰ Rappel disponibilité", payload.title)
        assertEquals(
            "N'oublie pas de répondre pour Spectacle le jeudi 15 janvier 2032 à 20h00 !",
            payload.body,
        )
        assertEquals("/saison/saison-test/event/spectacle-test?tab=dispos", payload.url)
    }

    @Test
    fun `AVAILABILITY_PENDING_REMINDER email subject aligns with push title`() {
        val event = sampleEvent()
        val subject = builder.buildEmailSubject(NotificationIntent.AVAILABILITY_PENDING_REMINDER, event)
        assertEquals("Rappel disponibilité · Spectacle (jeudi 15 janvier 2032 à 20h00)", subject)
    }

    private fun sampleEvent(): EventEntity {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Test", slug = "test")
        val season = SeasonEntity(troupe = troupe, slug = "saison-test", title = "Saison")
        return EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "Spectacle",
            slug = "spectacle-test",
            startsAt = Instant.parse("2032-01-15T19:00:00Z"),
        )
    }
}
