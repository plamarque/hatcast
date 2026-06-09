package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

class NotificationPayloadBuilderProxyTest {
    private val builder = NotificationPayloadBuilder()

    @Test
    fun `proxy availability payload includes actor change date and dispos deep link`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.PROXY_AVAILABILITY_RECORDED,
                event = event,
                recipientName = "Alice",
                actorDisplayName = "Bob Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Availability(
                        beforeLabel = "Non renseigné",
                        afterLabel = "Dispo",
                        roleKeysSummary = "Joueur",
                    ),
            )

        assertTrue(payload.body.contains("Bob Orga"))
        assertTrue(payload.body.contains("ta disponibilité"))
        assertTrue(payload.body.contains("Non renseigné → Dispo"))
        assertTrue(payload.body.contains("Joueur"))
        assertTrue(payload.body.contains("janvier 2032"))
        assertEquals("/saison/saison-test/event/spectacle-test?tab=dispos", payload.url)
    }

    @Test
    fun `proxy participation confirmed uses equipe tab`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                event = event,
                recipientName = "Alice",
                roleKey = "player",
                actorDisplayName = "Bob Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Participation(
                        decisionLabel = "Confirmé",
                        roleLabel = "Joueur",
                    ),
            )

        assertTrue(payload.body.contains("a confirmé ta participation"))
        assertEquals("👍 Participation confirmée", payload.title)
        assertTrue(payload.body.contains("Joueur"))
        assertTrue(payload.body.contains("janvier 2032"))
        assertEquals("/saison/saison-test/event/spectacle-test?tab=equipe", payload.url)
    }

    @Test
    fun `proxy participation declined from pending uses declinaison copy`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                event = event,
                recipientName = "Alice",
                roleKey = "player",
                actorDisplayName = "Bob Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Participation(
                        decisionLabel = "Refusé",
                        roleLabel = "Joueur",
                    ),
            )

        assertTrue(payload.body.contains("a refusé ta participation"))
        assertEquals("👎 Déclinaison enregistrée", payload.title)
        assertTrue(payload.body.contains("janvier 2032"))
        assertEquals("/saison/saison-test/event/spectacle-test?tab=equipe", payload.url)
    }

    @Test
    fun `proxy participation declined from confirmed uses desistement copy`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                event = event,
                recipientName = "Alice",
                roleKey = "player",
                actorDisplayName = "Bob Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Participation(
                        decisionLabel = "Désisté",
                        roleLabel = "Joueur",
                    ),
            )

        assertTrue(payload.body.contains("a enregistré ton désistement"))
        assertEquals("👎 Désistement enregistré", payload.title)
        assertEquals("/saison/saison-test/event/spectacle-test?tab=equipe", payload.url)
    }

    @Test
    fun `proxy participation pending uses showConfirm deep link`() {
        val event = sampleEvent()
        val payload =
            builder.build(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                event = event,
                recipientName = "Alice",
                roleKey = "player",
                actorDisplayName = "Bob Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Participation(
                        decisionLabel = "À confirmer",
                        roleLabel = "Joueur",
                    ),
            )

        assertTrue(payload.body.contains("a remis à confirmer ta participation"))
        assertEquals("⏳ Participation à confirmer", payload.title)
        assertEquals("/saison/saison-test/event/spectacle-test?showConfirm=true", payload.url)
    }

    private fun sampleEvent(): EventEntity {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Test", slug = "test")
        val season = SeasonEntity(troupe = troupe, slug = "saison-test", title = "Saison")
        return EventEntity(
            season = season,
            title = "Spectacle test",
            slug = "spectacle-test",
            startsAt = Instant.parse("2032-01-15T19:00:00Z"),
        )
    }
}
