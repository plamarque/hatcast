package com.hatcast.api.notification

import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.role.RoleLabels
import com.hatcast.api.user.MemberGender
import org.springframework.stereotype.Component

@Component
class NotificationEmailBodyBuilder(
    private val emailProperties: NotificationEmailProperties,
    private val payloadBuilder: NotificationPayloadBuilder,
) {
    fun buildHtml(
        intent: NotificationIntent,
        event: EventEntity,
        recipientName: String,
        recipientGender: MemberGender?,
        category: NotificationCategory,
        roleKey: String?,
        actorDisplayName: String?,
        proxyChangeSummary: ProxyChangeSummary?,
        customMessageBody: String?,
        eventDetailsChangeSummary: EventDetailsChangeSummary?,
        reasonSummary: String?,
        reminderWindow: NotificationReminderWindow?,
        relativeUrl: String,
    ): String {
        val eventTitle = event.title
        val eventDate = payloadBuilder.formattedEventDate(event)
        val roleLabel =
            roleKey?.let { key ->
                RoleLabels.label(key, MemberGender.effective(recipientGender))
            }
        val actor = actorDisplayName?.trim()?.takeIf { it.isNotEmpty() } ?: "Un orga"
        val troupeName = event.season.troupe.name
        val seasonTitle = event.season.title

        val paragraphs =
            when (intent) {
                NotificationIntent.AVAILABILITY_OPENED ->
                    availabilityOpenedParagraphs(eventTitle, eventDate)
                NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE ->
                    manualAvailabilityAnnounceParagraphs(
                        eventTitle,
                        eventDate,
                        customMessageBody,
                    )
                NotificationIntent.MANUAL_AVAILABILITY_NUDGE ->
                    availabilityNudgeParagraphs(eventTitle, eventDate, prefix = null)
                NotificationIntent.AVAILABILITY_PENDING_REMINDER ->
                    availabilityNudgeParagraphs(eventTitle, eventDate, prefix = "Rappel automatique — ")
                NotificationIntent.CONFIRMATION_REQUEST ->
                    confirmationRequestParagraphs(eventTitle, eventDate, roleLabel, recipientGender)
                NotificationIntent.RECONFIRMATION_REQUEST ->
                    reconfirmationRequestParagraphs(eventTitle, eventDate, roleLabel)
                NotificationIntent.REMOVED_FROM_COMPOSITION ->
                    removedFromCompositionParagraphs(eventTitle, eventDate, roleLabel)
                NotificationIntent.ASSIGNEE_PRESENCE_REMINDER ->
                    assigneePresenceReminderParagraphs(
                        eventTitle,
                        eventDate,
                        roleLabel,
                        recipientGender,
                        reminderWindow,
                    )
                NotificationIntent.TEAM_COMPLETE_MEMBER ->
                    teamCompleteMemberParagraphs(eventTitle, eventDate)
                NotificationIntent.PROXY_AVAILABILITY_RECORDED ->
                    proxyAvailabilityParagraphs(
                        eventTitle,
                        eventDate,
                        actor,
                        proxyChangeSummary as? ProxyChangeSummary.Availability,
                    )
                NotificationIntent.PROXY_CONFIRMATION_RECORDED ->
                    proxyConfirmationParagraphs(
                        eventTitle,
                        eventDate,
                        actor,
                        roleLabel,
                        proxyChangeSummary as? ProxyChangeSummary.Participation,
                    )
                NotificationIntent.EVENT_DETAILS_CHANGED ->
                    eventDetailsChangedParagraphs(
                        eventTitle,
                        eventDate,
                        eventDetailsChangeSummary,
                    )
                NotificationIntent.EVENT_ARCHIVED ->
                    eventArchivedParagraphs(eventTitle, eventDate)
                NotificationIntent.EVENT_DRAFT_CREATED ->
                    eventDraftCreatedParagraphs(
                        eventTitle,
                        eventDate,
                        actor,
                        troupeName,
                        seasonTitle,
                        recipientGender,
                    )
                NotificationIntent.COMPOSITION_SHARED ->
                    compositionSharedParagraphs(eventTitle, eventDate, actor)
                NotificationIntent.SLA_OPEN_AVAILABILITY ->
                    slaOpenAvailabilityParagraphs(eventTitle, eventDate)
                NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY ->
                    compositionIncompleteWeeklyParagraphs(eventTitle, eventDate)
                NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7 ->
                    compositionIncompleteDailyJ7Paragraphs(eventTitle, eventDate)
                NotificationIntent.TEAM_COMPLETE ->
                    teamCompleteParagraphs(eventTitle)
                NotificationIntent.TEAM_REGRESSED ->
                    teamRegressedParagraphs(eventTitle, eventDate, reasonSummary)
                NotificationIntent.TEAM_VALIDATED_FYI,
                NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                ->
                    error("Use dedicated builder for $intent")
            }

        return renderEmail(
            recipientName = recipientName,
            paragraphs = paragraphs,
            relativeUrl = relativeUrl,
            category = category,
        )
    }

    fun buildOrganizerScopeGrantedHtml(
        recipientName: String,
        recipientGender: MemberGender?,
        roleLabel: String,
        scopeName: String,
    ): String {
        val nominated = NotificationGenderCopy.nominatedPastParticiple(recipientGender)
        val paragraphs =
            listOf(
                NotificationEmailHtml.paragraphHtml(
                    "Tu viens d'être $nominated ${NotificationEmailHtml.bold(roleLabel)} " +
                        "pour ${NotificationEmailHtml.bold(scopeName)} sur HatCast.",
                ),
                NotificationEmailHtml.paragraph(
                    "En tant qu'orga, tu peux activer les alertes qui t'intéressent depuis ton compte.",
                ),
            )
        val relativeUrl = "/compte/notifications"
        val absoluteUrl = NotificationEmailHtml.joinOrigin(emailProperties.publicWebOrigin, relativeUrl)
        return NotificationEmailHtml.wrap(
            greetingHtml = NotificationEmailHtml.greeting(recipientName),
            bodyParagraphs = paragraphs,
            ctaHtml = NotificationEmailHtml.ctaBlock(absoluteUrl, relativeUrl),
            footerHtml = NotificationEmailHtml.organizerScopeGrantedFooter(emailProperties.publicWebOrigin),
        )
    }

    private fun renderEmail(
        recipientName: String,
        paragraphs: List<String>,
        relativeUrl: String,
        category: NotificationCategory,
    ): String {
        val absoluteUrl = NotificationEmailHtml.joinOrigin(emailProperties.publicWebOrigin, relativeUrl)
        return NotificationEmailHtml.wrap(
            greetingHtml = NotificationEmailHtml.greeting(recipientName),
            bodyParagraphs = paragraphs,
            ctaHtml = NotificationEmailHtml.ctaBlock(absoluteUrl, relativeUrl),
            footerHtml =
                NotificationEmailHtml.standardPreferencesFooter(
                    emailProperties.publicWebOrigin,
                    preferenceCategoryLabel(category),
                ),
        )
    }

    private fun availabilityOpenedParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Les orgas ont ouvert la collecte des disponibilités pour le spectacle " +
                    "${NotificationEmailHtml.bold(eventTitle)}, prévu le ${NotificationEmailHtml.bold(eventDate)}.",
            ),
            NotificationEmailHtml.paragraph(
                "Merci d'indiquer si tu es disponible ou non. ☝️ Même un « pas dispo » aide l'équipe à s'organiser.",
            ),
        )

    private fun manualAvailabilityAnnounceParagraphs(
        eventTitle: String,
        eventDate: String,
        customMessageBody: String?,
    ): List<String> {
        val custom = customMessageBody?.trim()?.takeIf { it.isNotEmpty() }
        if (custom != null) {
            return listOf(NotificationEmailHtml.paragraph(custom))
        }
        return availabilityOpenedParagraphs(eventTitle, eventDate)
    }

    private fun availabilityNudgeParagraphs(
        eventTitle: String,
        eventDate: String,
        prefix: String?,
    ): List<String> {
        val intro =
            buildString {
                if (prefix != null) {
                    append(prefix)
                }
                append("Ta disponibilité n'est pas encore renseignée pour ")
                append(eventTitle)
                append(" le ")
                append(eventDate)
                append(".")
            }
        return listOf(
            NotificationEmailHtml.paragraph(intro),
            NotificationEmailHtml.paragraph(
                "Peux-tu répondre dès que possible ? Les orgas s'appuient sur ces réponses pour monter la composition.",
            ),
        )
    }

    private fun confirmationRequestParagraphs(
        eventTitle: String,
        eventDate: String,
        roleLabel: String?,
        recipientGender: MemberGender?,
    ): List<String> {
        val selected = NotificationGenderCopy.selectedPastParticiple(recipientGender)
        val rolePart = roleLabel?.let { NotificationEmailHtml.bold(it) } ?: "participant·e"
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "Tu es $selected comme $rolePart pour ${NotificationEmailHtml.bold(eventTitle)} " +
                    "le ${NotificationEmailHtml.bold(eventDate)}.",
            ),
            NotificationEmailHtml.paragraph(
                "La composition a été validée : merci de confirmer que tu es toujours partant·e, " +
                    "ou de décliner si tu n'es plus disponible.",
            ),
        )
    }

    private fun reconfirmationRequestParagraphs(
        eventTitle: String,
        eventDate: String,
        roleLabel: String?,
    ): List<String> {
        val rolePart = roleLabel?.let { NotificationEmailHtml.bold(it) } ?: "assigné·e"
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "La composition de ${NotificationEmailHtml.bold(eventTitle)} le " +
                    "${NotificationEmailHtml.bold(eventDate)} a été modifiée après validation.",
            ),
            NotificationEmailHtml.paragraphHtml(
                "Tu es toujours $rolePart, mais ta confirmation doit être renouvelée.",
            ),
        )
    }

    private fun removedFromCompositionParagraphs(
        eventTitle: String,
        eventDate: String,
        roleLabel: String?,
    ): List<String> {
        val rolePart = roleLabel?.let { " en tant que ${NotificationEmailHtml.bold(it)}" }.orEmpty()
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "La composition de ${NotificationEmailHtml.bold(eventTitle)} le " +
                    "${NotificationEmailHtml.bold(eventDate)} a été mise à jour : tu n'y figures plus$rolePart.",
            ),
            NotificationEmailHtml.paragraph(
                "Désolé pour ce changement. Tu peux consulter la composition actuelle sur HatCast.",
            ),
        )
    }

    private fun assigneePresenceReminderParagraphs(
        eventTitle: String,
        eventDate: String,
        roleLabel: String?,
        recipientGender: MemberGender?,
        reminderWindow: NotificationReminderWindow?,
    ): List<String> {
        val enrolled = NotificationGenderCopy.enrolledPastParticiple(recipientGender)
        val rolePart = roleLabel?.let { NotificationEmailHtml.bold(it) } ?: "participant·e"
        val horizon =
            when (reminderWindow) {
                NotificationReminderWindow.DAYS_1 -> " (dans 1 jour)"
                NotificationReminderWindow.DAYS_7 -> " (dans 7 jours)"
                else -> ""
            }
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "Pour rappel, tu es $enrolled comme $rolePart pour ${NotificationEmailHtml.bold(eventTitle)} " +
                    "le ${NotificationEmailHtml.bold(eventDate)}$horizon.",
            ),
            NotificationEmailHtml.paragraph(
                "Si tu es toujours disponible, tu n'as rien à faire. Sinon, merci de décliner au plus vite " +
                    "pour libérer ta place.",
            ),
        )
    }

    private fun teamCompleteMemberParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Bonne nouvelle : tout le monde a confirmé pour ${NotificationEmailHtml.bold(eventTitle)} " +
                    "le ${NotificationEmailHtml.bold(eventDate)}.",
            ),
            NotificationEmailHtml.paragraph(
                "L'équipe est au complet. Bravo et merci à tou·tes !",
            ),
        )

    private fun proxyAvailabilityParagraphs(
        eventTitle: String,
        eventDate: String,
        actor: String,
        summary: ProxyChangeSummary.Availability?,
    ): List<String> {
        val changePart =
            summary?.let { "${it.beforeLabel} → ${it.afterLabel}" } ?: "mise à jour"
        val rolesPart = summary?.roleKeysSummary ?: "—"
        val commentPart = summary?.commentSnippet?.let { "« $it »" } ?: "—"
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "${NotificationEmailHtml.bold(actor)} a enregistré ta disponibilité pour " +
                    "${NotificationEmailHtml.bold(eventTitle)} le ${NotificationEmailHtml.bold(eventDate)} :",
            ),
            """<ul>
              <li>Statut : ${NotificationEmailHtml.escape(changePart)}</li>
              <li>Rôles : ${NotificationEmailHtml.escape(rolesPart)}</li>
              <li>Commentaire : ${NotificationEmailHtml.escape(commentPart)}</li>
            </ul>""",
            NotificationEmailHtml.paragraph(
                "Vérifie que tout est correct ; tu peux corriger depuis HatCast si besoin.",
            ),
        )
    }

    private fun proxyConfirmationParagraphs(
        eventTitle: String,
        eventDate: String,
        actor: String,
        roleLabel: String?,
        summary: ProxyChangeSummary.Participation?,
    ): List<String> {
        val rolePart = summary?.roleLabel ?: roleLabel.orEmpty()
        val decision = summary?.decisionLabel
        val confirmed = ProxyNotificationLabels.participationStatusLabel(SlotParticipationStatus.CONFIRMED)
        val declined = ProxyNotificationLabels.participationStatusLabel(SlotParticipationStatus.DECLINED)
        val body =
            when (decision) {
                confirmed ->
                    "${NotificationEmailHtml.bold(actor)} a confirmé ta participation comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
                declined ->
                    "${NotificationEmailHtml.bold(actor)} a décliné ta participation comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
                else ->
                    "${NotificationEmailHtml.bold(actor)} a remis ta participation à confirmer comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
            }
        return listOf(NotificationEmailHtml.paragraphHtml(body))
    }

    private fun eventDetailsChangedParagraphs(
        eventTitle: String,
        eventDate: String,
        summary: EventDetailsChangeSummary?,
    ): List<String> {
        val lines = payloadBuilder.formattedEventDetailsDeltaLines(summary)
        val deltaHtml =
            if (lines.isEmpty()) {
                NotificationEmailHtml.paragraph("Des informations importantes ont changé.")
            } else {
                val items = lines.joinToString("") { line -> "<li>${NotificationEmailHtml.escape(line)}</li>" }
                """<ul>$items</ul>"""
            }
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "Des informations importantes ont changé pour ${NotificationEmailHtml.bold(eventTitle)} " +
                    "le ${NotificationEmailHtml.bold(eventDate)} :",
            ),
            deltaHtml,
            NotificationEmailHtml.paragraph(
                "Pense à vérifier que tu es toujours disponible au nouveau créneau ou au nouveau lieu.",
            ),
        )
    }

    private fun eventArchivedParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Le spectacle ${NotificationEmailHtml.bold(eventTitle)} prévu le " +
                    "${NotificationEmailHtml.bold(eventDate)} a été archivé : il n'est plus accessible dans HatCast.",
            ),
            NotificationEmailHtml.paragraph(
                "Tu n'as rien à faire de plus ; cet email est une confirmation pour les personnes " +
                    "déjà engagées sur ce spectacle.",
            ),
        )

    private fun eventDraftCreatedParagraphs(
        eventTitle: String,
        eventDate: String,
        actor: String,
        troupeName: String,
        seasonTitle: String,
        recipientGender: MemberGender?,
    ): List<String> {
        val ready = NotificationGenderCopy.readyAdjective(recipientGender)
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "${NotificationEmailHtml.bold(actor)} vient d'ajouter un nouveau spectacle dans " +
                    "${NotificationEmailHtml.bold(troupeName)} : ${NotificationEmailHtml.bold(seasonTitle)} :",
            ),
            NotificationEmailHtml.paragraphHtml(
                "Le ${NotificationEmailHtml.bold(eventDate)} : ${NotificationEmailHtml.bold(eventTitle)}",
            ),
            NotificationEmailHtml.paragraph(
                "Quand tu seras $ready, pense bien à le publier pour lancer la collecte des dispos.",
            ),
        )
    }

    private fun compositionSharedParagraphs(
        eventTitle: String,
        eventDate: String,
        actor: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "${NotificationEmailHtml.bold(actor)} a proposé une composition pour " +
                    "${NotificationEmailHtml.bold(eventTitle)} le ${NotificationEmailHtml.bold(eventDate)}.",
            ),
            NotificationEmailHtml.paragraph(
                "En tant qu'orga, tu peux la consulter, la commenter ou la valider selon votre processus.",
            ),
        )

    private fun slaOpenAvailabilityParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "La date de ${NotificationEmailHtml.bold(eventTitle)} approche " +
                    "(${NotificationEmailHtml.bold(eventDate)}), mais la collecte des disponibilités " +
                    "n'est pas encore ouverte sur HatCast.",
            ),
            NotificationEmailHtml.paragraph(
                "Pense à publier le spectacle (ou à ouvrir la collecte) pour que le roster puisse répondre.",
            ),
        )

    private fun compositionIncompleteWeeklyParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Rappel hebdomadaire : il manque encore des personnes pour boucler la composition de " +
                    "${NotificationEmailHtml.bold(eventTitle)} le ${NotificationEmailHtml.bold(eventDate)}.",
            ),
            NotificationEmailHtml.paragraph(
                "Consulte les postes vacants et relance le roster si besoin.",
            ),
        )

    private fun compositionIncompleteDailyJ7Paragraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Attention, on est à J-7 et la composition de ${NotificationEmailHtml.bold(eventTitle)} le " +
                    "${NotificationEmailHtml.bold(eventDate)} n'est toujours pas complète.",
            ),
            NotificationEmailHtml.paragraph(
                "C'est le dernier rappel automatique avant le spectacle : vérifie les places à pourvoir " +
                    "et les confirmations en attente.",
            ),
        )

    private fun teamCompleteParagraphs(eventTitle: String): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Bonne nouvelle, toutes les confirmations attendues pour la compo de " +
                    "${NotificationEmailHtml.bold(eventTitle)} ont été reçues.",
            ),
        )

    private fun teamRegressedParagraphs(
        eventTitle: String,
        eventDate: String,
        reasonSummary: String?,
    ): List<String> {
        val reason = reasonSummary?.trim()?.takeIf { it.isNotEmpty() } ?: "équipe non complète"
        return listOf(
            NotificationEmailHtml.paragraphHtml(
                "Mauvaise nouvelle, la composition de l'équipe pour ${NotificationEmailHtml.bold(eventTitle)} le " +
                    "${NotificationEmailHtml.bold(eventDate)} est de nouveau incomplète.",
            ),
            NotificationEmailHtml.paragraphHtml("Motif : ${NotificationEmailHtml.bold(reason)}"),
            NotificationEmailHtml.paragraph(
                "Action suggérée : rouvrir la compo, combler le trou ou relancer les personnes concernées.",
            ),
        )
    }

    private fun preferenceCategoryLabel(category: NotificationCategory): String =
        when (category) {
            NotificationCategory.AVAILABILITY_REQUEST -> "demandes de disponibilité"
            NotificationCategory.AVAILABILITY_WEEKLY_REMINDER -> "rappels de disponibilité"
            NotificationCategory.CONFIRMATION_REQUEST -> "demandes de confirmation"
            NotificationCategory.REMINDER_7_DAYS,
            NotificationCategory.REMINDER_1_DAY,
            -> "rappels avant spectacle"
            NotificationCategory.EVENT_DETAILS_CHANGED,
            NotificationCategory.EVENT_ARCHIVED,
            -> "changements sur un spectacle"
            NotificationCategory.TEAM_CONFIRMED -> "équipe au complet"
            NotificationCategory.ORG_EVENT_DRAFT_CREATED -> "nouveau spectacle"
            NotificationCategory.ORG_DRAFT_COMPOSITION -> "compo proposée"
            NotificationCategory.ORG_SLA_OPEN_AVAILABILITY -> "ouvrir les dispos"
            NotificationCategory.ORG_COMPOSITION_INCOMPLETE -> "compo incomplète"
            NotificationCategory.ORG_TEAM_COMPLETE -> "compo bouclée"
            NotificationCategory.ORG_TEAM_REGRESSED -> "équipe plus complète"
            NotificationCategory.ORG_SCOPE_GRANTED -> "nouveau rôle orga"
            NotificationCategory.COMPOSITION_SHARED -> category.label.lowercase()
        }
}
