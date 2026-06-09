package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

class NotificationEmailBodyBuilderTest {
    private val payloadBuilder = NotificationPayloadBuilder()
    private val builder =
        NotificationEmailBodyBuilder(
            NotificationEmailProperties(publicWebOrigin = "https://localhost:4200"),
            payloadBuilder,
        )

    @Test
    fun `AVAILABILITY_OPENED email includes greeting orgas copy CTA and preferences footer`() {
        val html = buildForIntent(NotificationIntent.AVAILABILITY_OPENED)

        assertTrue(html.contains("Bonjour Alice,"))
        assertTrue(html.contains("Les orgas ont ouvert"))
        assertTrue(html.contains("☝️ Même un"))
        assertTrue(html.contains("Indiquer mes disponibilités"))
        assertTrue(html.contains("https://localhost:4200/saison/saison-test/event/gala?tab=dispos"))
        assertTrue(html.contains("changez vos préférences de notification"))
        assertTrue(html.contains("https://localhost:4200/compte/notifications"))
        assertTrue(html.contains("demandes de disponibilité"))
    }

    @Test
    fun `CONFIRMATION_REQUEST email uses gendered selection copy`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.CONFIRMATION_REQUEST,
                event = sampleEvent(),
                recipientName = "Camille",
                recipientGender = MemberGender.FEMALE,
                category = NotificationCategory.CONFIRMATION_REQUEST,
                roleKey = "player",
                actorDisplayName = null,
                proxyChangeSummary = null,
                customMessageBody = null,
                eventDetailsChangeSummary = null,
                reasonSummary = null,
                reminderWindow = null,
                relativeUrl = "/saison/saison-test/event/gala?showConfirm=true",
            )

        assertTrue(html.contains("Tu es sélectionnée"))
        assertTrue(html.contains("Confirmer ma participation"))
    }

    @Test
    fun `TEAM_COMPLETE orga email uses compo bouclée copy without second logistics paragraph`() {
        val html = buildForIntent(NotificationIntent.TEAM_COMPLETE)

        assertTrue(html.contains("Bonne nouvelle, toutes les confirmations attendues"))
        assertTrue(html.contains("compo bouclée") || html.contains("compo de"))
        assertTrue(!html.contains("logistique"))
    }

    @Test
    fun `EVENT_DRAFT_CREATED email includes actor troupe and season`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.EVENT_DRAFT_CREATED,
                event = sampleEvent(),
                recipientName = "Orga",
                recipientGender = MemberGender.MALE,
                category = NotificationCategory.ORG_EVENT_DRAFT_CREATED,
                roleKey = null,
                actorDisplayName = "Patrice",
                proxyChangeSummary = null,
                customMessageBody = null,
                eventDetailsChangeSummary = null,
                reasonSummary = null,
                reminderWindow = null,
                relativeUrl = "/saison/saison-test/event/gala?tab=infos",
            )

        assertTrue(html.contains("Patrice"))
        assertTrue(html.contains("Les Improbots"))
        assertTrue(html.contains("Saison 2026"))
        assertTrue(html.contains("Quand tu seras prêt"))
    }

    @Test
    fun `organizer scope granted email uses transactional footer`() {
        val html =
            builder.buildOrganizerScopeGrantedHtml(
                recipientName = "Lee",
                recipientGender = MemberGender.FEMALE,
                roleLabel = "organisateur de saison",
                scopeName = "Saison test",
            )

        assertTrue(html.contains("nommée"))
        assertTrue(html.contains("Gérer mes notifications"))
        assertTrue(html.contains("Cet email confirme un changement de rôle"))
        assertTrue(!html.contains("Pour ne plus recevoir ce type d'email"))
    }

    private fun buildForIntent(intent: NotificationIntent): String =
        builder.buildHtml(
            intent = intent,
            event = sampleEvent(),
            recipientName = "Alice",
            recipientGender = MemberGender.NON_SPECIFIED,
            category = intent.toCategory(),
            roleKey = if (intent == NotificationIntent.CONFIRMATION_REQUEST) "player" else null,
            actorDisplayName = "Patrice",
            proxyChangeSummary = null,
            customMessageBody = null,
            eventDetailsChangeSummary = null,
            reasonSummary = if (intent == NotificationIntent.TEAM_REGRESSED) "déclin de Bob" else null,
            reminderWindow = null,
            relativeUrl = "/saison/saison-test/event/gala?tab=dispos",
        )

    private fun sampleEvent(): EventEntity {
        val troupe =
            mock<TroupeEntity>().also {
                whenever(it.name).thenReturn("Les Improbots")
            }
        val season =
            SeasonEntity(
                id = UUID.randomUUID(),
                troupe = troupe,
                slug = "saison-test",
                title = "Saison 2026",
            )
        return EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "Gala",
            slug = "gala",
            startsAt = Instant.parse("2034-06-15T19:00:00Z"),
        )
    }
}
