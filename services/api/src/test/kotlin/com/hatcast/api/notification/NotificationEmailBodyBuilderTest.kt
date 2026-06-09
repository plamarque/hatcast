package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertFalse
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

    // ── Existing content assertions ───────────────────────────────────────────

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
        assertFalse(html.contains("logistique"))
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
        assertFalse(html.contains("Pour ne plus recevoir ce type d'email"))
    }

    // ── Shell structure assertions (AC-8) ─────────────────────────────────────

    @Test
    fun `AVAILABILITY_OPENED email has accent bar styled CTA button and headline`() {
        val html = buildForIntent(NotificationIntent.AVAILABILITY_OPENED)

        assertTrue(html.contains("#6750A4"), "Accent bar / primary color missing")
        assertTrue(html.contains("border-radius:24px"), "Styled CTA pill button missing")
        assertTrue(html.contains("<h1"), "H1 headline missing")
        assertTrue(html.contains("Ta dispo pour Gala"), "Headline text missing")
        assertTrue(html.contains("changez vos préférences de notification"), "Footer prefs link missing")
    }

    @Test
    fun `TEAM_COMPLETE_MEMBER email is variant B with good news icon and outline CTA`() {
        val html = buildForIntent(NotificationIntent.TEAM_COMPLETE_MEMBER)

        assertTrue(html.contains("L'équipe est au complet !"), "Headline missing")
        assertTrue(html.contains("E8F5E0") || html.contains("✓"), "Good news icon / success container missing")
        assertTrue(html.contains("border:2px solid"), "Outline CTA button missing")
        assertTrue(html.contains("<h1"), "H1 headline missing")
    }

    @Test
    fun `TEAM_REGRESSED email is variant C with orga chip and details card`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.TEAM_REGRESSED,
                event = sampleEvent(),
                recipientName = "Patrice",
                recipientGender = MemberGender.MALE,
                category = NotificationCategory.ORG_TEAM_REGRESSED,
                roleKey = null,
                actorDisplayName = null,
                proxyChangeSummary = null,
                customMessageBody = null,
                eventDetailsChangeSummary = null,
                reasonSummary = "déclinaison de Camille",
                reminderWindow = null,
                relativeUrl = "/saison/saison-test/event/gala?tab=equipe",
            )

        assertTrue(html.contains("La compo n'est plus complète"), "Headline missing")
        assertTrue(html.contains("Alerte organisateur"), "Orga chip missing")
        assertTrue(html.contains("déclinaison de Camille"), "Reason in details card missing")
        assertTrue(html.contains("MOTIF") || html.contains("Motif"), "Details card title missing")
        assertTrue(html.contains("<h1"), "H1 headline missing")
        assertTrue(html.contains("changez vos préférences de notification"), "Footer prefs link missing")
    }

    @Test
    fun `CONFIRMATION_REQUEST email has shell structure with event context block`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.CONFIRMATION_REQUEST,
                event = sampleEvent(),
                recipientName = "Alice",
                recipientGender = MemberGender.NON_SPECIFIED,
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

        assertTrue(html.contains("Tu es dans la compo !"), "Headline missing")
        assertTrue(html.contains("<h1"), "H1 missing")
        assertTrue(html.contains("border-radius:24px"), "CTA button missing")
        assertTrue(html.contains("📅"), "Event context icon missing")
        assertTrue(html.contains("Les Improbots"), "Troupe in event context missing")
    }

    @Test
    fun `PROXY_AVAILABILITY_RECORDED email has details card with statut roles commentaire`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.PROXY_AVAILABILITY_RECORDED,
                event = sampleEvent(),
                recipientName = "Alice",
                recipientGender = MemberGender.NON_SPECIFIED,
                category = NotificationCategory.AVAILABILITY_REQUEST,
                roleKey = null,
                actorDisplayName = "Patrice",
                proxyChangeSummary =
                    ProxyChangeSummary.Availability(
                        beforeLabel = "Pas dispo",
                        afterLabel = "Disponible",
                        roleKeysSummary = "Joueur, MC",
                        commentSnippet = "Dispo sauf urgence",
                    ),
                customMessageBody = null,
                eventDetailsChangeSummary = null,
                reasonSummary = null,
                reminderWindow = null,
                relativeUrl = "/saison/saison-test/event/gala?tab=dispos",
            )

        assertTrue(html.contains("Ta dispo a été mise à jour"), "Headline missing")
        assertTrue(html.contains("Détail de la modification") || html.contains("DÉTAIL"), "Details card title missing")
        assertTrue(html.contains("Pas dispo"), "Before status in details card missing")
        assertTrue(html.contains("Disponible"), "After status in details card missing")
        assertTrue(html.contains("Joueur, MC"), "Roles in details card missing")
    }

    @Test
    fun `organizer scope granted email has shell structure without event context`() {
        val html =
            builder.buildOrganizerScopeGrantedHtml(
                recipientName = "Patrice",
                recipientGender = MemberGender.MALE,
                roleLabel = "organisateur de saison",
                scopeName = "Saison test",
            )

        assertTrue(html.contains("<h1"), "H1 headline missing")
        assertTrue(html.contains("border-radius:24px"), "Styled CTA button missing")
        assertTrue(html.contains("#6750A4"), "Primary color / accent bar missing")
        assertFalse(html.contains("📅"), "Should not have event context block")
        assertTrue(html.contains("— L'équipe HatCast"), "Transactional sign-off missing")
    }

    @Test
    fun `footer contains troupe name for event-linked notifications`() {
        val html = buildForIntent(NotificationIntent.AVAILABILITY_OPENED)

        assertTrue(html.contains("Les Improbots"), "Troupe name in footer missing")
    }

    @Test
    fun `ASSIGNEE_PRESENCE_REMINDER J7 has horizon badge and headline`() {
        val html =
            builder.buildHtml(
                intent = NotificationIntent.ASSIGNEE_PRESENCE_REMINDER,
                event = sampleEvent(),
                recipientName = "Bob",
                recipientGender = MemberGender.MALE,
                category = NotificationCategory.REMINDER_7_DAYS,
                roleKey = "dj",
                actorDisplayName = null,
                proxyChangeSummary = null,
                customMessageBody = null,
                eventDetailsChangeSummary = null,
                reasonSummary = null,
                reminderWindow = NotificationReminderWindow.DAYS_7,
                relativeUrl = "/saison/saison-test/event/gala?tab=equipe",
            )

        assertTrue(html.contains("C'est dans une semaine"), "J-7 headline missing")
        assertTrue(html.contains("J-7"), "Horizon badge J-7 missing")
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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
            reasonSummary = if (intent == NotificationIntent.TEAM_REGRESSED) "déclinaison de Bob" else null,
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
