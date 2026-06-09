package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant

class NotificationPayloadBuilderEventDetailsTest {
    private val builder = NotificationPayloadBuilder()

    @Test
    fun `EVENT_DETAILS_CHANGED payload includes delta and infos tab url`() {
        val event = eventEntity()
        val summary =
            EventDetailsChangeSummary(
                startsAtChange =
                    EventDetailsChangeSummary.StartsAtChange(
                        oldValue = Instant.parse("2033-06-01T19:00:00Z"),
                        newValue = Instant.parse("2033-07-01T19:00:00Z"),
                    ),
                locationChange =
                    EventDetailsChangeSummary.LocationChange(
                        oldValue = "Salle A",
                        newValue = "Salle B",
                    ),
            )

        val payload =
            builder.build(
                intent = NotificationIntent.EVENT_DETAILS_CHANGED,
                event = event,
                recipientName = "Alice",
                eventDetailsChangeSummary = summary,
            )

        assertEquals("📅 Spectacle modifié", payload.title)
        assertTrue(payload.body.contains("Date :"))
        assertTrue(payload.body.contains("Lieu : Salle A → Salle B"))
        assertTrue(payload.url.endsWith("?tab=infos"))
    }

    @Test
    fun `EVENT_ARCHIVED payload uses infos tab url`() {
        val event = eventEntity()

        val payload =
            builder.build(
                intent = NotificationIntent.EVENT_ARCHIVED,
                event = event,
                recipientName = "Alice",
            )

        assertEquals("🚫 Spectacle archivé", payload.title)
        assertTrue(payload.body.contains("n'a plus lieu (archivé)"))
        assertTrue(payload.url.endsWith("?tab=infos"))
    }

    private fun eventEntity(): EventEntity {
        val season =
            mock<SeasonEntity>().also {
                whenever(it.slug).thenReturn("test-saison")
            }
        return mock<EventEntity>().also {
            whenever(it.season).thenReturn(season)
            whenever(it.slug).thenReturn("test-event")
            whenever(it.title).thenReturn("Mon spectacle")
            whenever(it.startsAt).thenReturn(Instant.parse("2033-06-01T19:00:00Z"))
        }
    }
}
