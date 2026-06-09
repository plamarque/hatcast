package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import java.time.Instant

class NotificationPayloadBuilderOrganizerOpsTest {
    private val builder = NotificationPayloadBuilder()

    private fun sampleEvent(): EventEntity {
        val season = SeasonEntity(id = java.util.UUID.randomUUID(), troupe = mock(), title = "S", slug = "s")
        return EventEntity(
            id = java.util.UUID.randomUUID(),
            season = season,
            title = "Gala test",
            slug = "gala-test",
            startsAt = Instant.parse("2034-06-15T19:00:00Z"),
            templateType = "cabaret",
            roleSlots = mapOf("player" to 4),
        ).also { it.season.slug = "saison-test" }
    }

    @Test
    fun `organizer ops payloads use normative French copy`() {
        val event = sampleEvent()

        val compositionShared = builder.build(NotificationIntent.COMPOSITION_SHARED, event, "")
        assertEquals("👥 Compo proposée", compositionShared.title)
        assertEquals(true, compositionShared.body.contains("Composition proposée"))

        val draftCreated = builder.build(NotificationIntent.EVENT_DRAFT_CREATED, event, "")
        assertEquals("📝 Nouveau spectacle", draftCreated.title)

        val teamComplete = builder.build(NotificationIntent.TEAM_COMPLETE, event, "")
        assertEquals("✅ Compo bouclée", teamComplete.title)
        assertEquals(true, teamComplete.body.contains("Tout le monde a confirmé"))

        val regressed =
            builder.build(
                NotificationIntent.TEAM_REGRESSED,
                event,
                "",
                reasonSummary = "déclin de Alice",
            )
        assertEquals("⚠️ L'équipe n'est plus complète !", regressed.title)
        assertEquals(true, regressed.body.contains("déclin de Alice"))
    }

    @Test
    fun `organizer ops email subjects match catalogue`() {
        val event = sampleEvent()
        assertEquals(
            "👥 Compo proposée · Gala test",
            builder.buildEmailSubject(NotificationIntent.COMPOSITION_SHARED, event).substringBefore(" ("),
        )
        assertEquals(
            "✅ Compo bouclée · Gala test",
            builder.buildEmailSubject(NotificationIntent.TEAM_COMPLETE, event).substringBefore(" ("),
        )
        assertEquals(
            "⚠️ L'équipe n'est plus complète · Gala test",
            builder.buildEmailSubject(NotificationIntent.TEAM_REGRESSED, event).substringBefore(" ("),
        )
    }
}
