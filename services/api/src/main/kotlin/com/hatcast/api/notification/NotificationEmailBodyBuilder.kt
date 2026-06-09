package com.hatcast.api.notification

import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.notification.NotificationEmailHtml.EmailVariant
import com.hatcast.api.notification.NotificationEmailHtml.EventEmailContext
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

        val detailsCardHtml: String? =
            when (intent) {
                NotificationIntent.PROXY_AVAILABILITY_RECORDED ->
                    buildProxyAvailabilityDetailsCard(proxyChangeSummary as? ProxyChangeSummary.Availability)
                NotificationIntent.EVENT_DETAILS_CHANGED ->
                    buildEventDetailsCard(eventDetailsChangeSummary)
                NotificationIntent.TEAM_REGRESSED ->
                    buildTeamRegressedDetailsCard(reasonSummary)
                else -> null
            }

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
                    eventDetailsChangedParagraphs()
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
                    teamRegressedParagraphs(eventTitle, eventDate)
                NotificationIntent.TEAM_VALIDATED_FYI,
                NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                ->
                    error("Use dedicated builder for $intent")
            }

        return renderEmail(
            intent = intent,
            reminderWindow = reminderWindow,
            recipientName = recipientName,
            paragraphs = paragraphs,
            detailsCardHtml = detailsCardHtml,
            relativeUrl = relativeUrl,
            category = category,
            eventContext =
                EventEmailContext(
                    eventTitle = eventTitle,
                    eventDate = eventDate,
                    troupeName = troupeName,
                    seasonTitle = seasonTitle,
                    roleBadge = roleLabel,
                    horizonBadge = horizonBadgeFor(reminderWindow),
                ),
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
            headline = roleLabel.replaceFirstChar { it.uppercase() },
            variant = EmailVariant.TRANSACTIONAL,
            publicWebOrigin = emailProperties.publicWebOrigin,
            greetingHtml = NotificationEmailHtml.greeting(recipientName),
            bodyParagraphs = paragraphs,
            ctaHtml = NotificationEmailHtml.ctaBlock(absoluteUrl, relativeUrl),
            footerHtml = NotificationEmailHtml.organizerScopeGrantedFooter(emailProperties.publicWebOrigin),
        )
    }

    private fun renderEmail(
        intent: NotificationIntent,
        reminderWindow: NotificationReminderWindow?,
        recipientName: String,
        paragraphs: List<String>,
        detailsCardHtml: String?,
        relativeUrl: String,
        category: NotificationCategory,
        eventContext: EventEmailContext,
    ): String {
        val absoluteUrl = NotificationEmailHtml.joinOrigin(emailProperties.publicWebOrigin, relativeUrl)
        val variant = variantFor(intent)
        val isOutline = variant == EmailVariant.GOOD_NEWS
        return NotificationEmailHtml.wrap(
            headline = headlineFor(intent, eventContext.eventTitle, reminderWindow),
            variant = variant,
            publicWebOrigin = emailProperties.publicWebOrigin,
            greetingHtml = NotificationEmailHtml.greeting(recipientName),
            bodyParagraphs = paragraphs,
            ctaHtml = NotificationEmailHtml.ctaBlock(absoluteUrl, relativeUrl, outline = isOutline),
            footerHtml =
                NotificationEmailHtml.standardPreferencesFooter(
                    emailProperties.publicWebOrigin,
                    preferenceCategoryLabel(category),
                    troupeName = eventContext.troupeName,
                ),
            eventContext = eventContext,
            detailsCardHtml = detailsCardHtml,
        )
    }

    // ── Paragraph builders ────────────────────────────────────────────────────

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

    /** Body paragraphs for PROXY_AVAILABILITY_RECORDED — details are rendered in a separate card. */
    private fun proxyAvailabilityParagraphs(
        actor: String,
        summary: ProxyChangeSummary.Availability?,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "${NotificationEmailHtml.bold(actor)} a enregistré ta disponibilité pour ce spectacle :",
            ),
            NotificationEmailHtml.paragraph(
                "Vérifie que tout est correct ; tu peux corriger depuis HatCast si besoin.",
            ),
        )

    private fun buildProxyAvailabilityDetailsCard(summary: ProxyChangeSummary.Availability?): String {
        val changePart = summary?.let { "${it.beforeLabel} → ${it.afterLabel}" } ?: "mise à jour"
        val rolesPart = summary?.roleKeysSummary ?: "—"
        val commentPart = summary?.commentSnippet?.let { "« $it »" } ?: "—"
        val itemStyle = "margin-bottom:4px;"
        val listHtml =
            """<ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.55;color:#1D1B20;">""" +
                """<li style="$itemStyle"><strong>Statut :</strong> ${NotificationEmailHtml.escape(changePart)}</li>""" +
                """<li style="$itemStyle"><strong>Rôles :</strong> ${NotificationEmailHtml.escape(rolesPart)}</li>""" +
                """<li style="$itemStyle"><strong>Commentaire :</strong> ${NotificationEmailHtml.escape(commentPart)}</li>""" +
                """</ul>"""
        return NotificationEmailHtml.detailsCardBlock("Détail de la modification", listHtml)
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
        val confirmed =
            ProxyNotificationLabels.participationDecisionLabel(
                SlotParticipationStatus.CONFIRMED,
                beforeStatus = null,
            )
        val body =
            when (decision) {
                confirmed ->
                    "${NotificationEmailHtml.bold(actor)} a confirmé ta participation comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
                ProxyNotificationLabels.participationDecisionLabel(
                    SlotParticipationStatus.DECLINED,
                    SlotParticipationStatus.PENDING,
                ),
                ProxyNotificationLabels.participationDecisionLabel(
                    SlotParticipationStatus.DECLINED,
                    SlotParticipationStatus.CONFIRMED,
                ),
                ProxyNotificationLabels.participationDecisionLabel(
                    SlotParticipationStatus.DECLINED,
                    beforeStatus = null,
                ),
                ->
                    "${NotificationEmailHtml.bold(actor)} " +
                        "${ProxyNotificationLabels.participationProxyVerb(decision)} comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
                else ->
                    "${NotificationEmailHtml.bold(actor)} a remis ta participation à confirmer comme " +
                        "${NotificationEmailHtml.bold(rolePart)} pour ${NotificationEmailHtml.bold(eventTitle)} " +
                        "le ${NotificationEmailHtml.bold(eventDate)}."
            }
        return listOf(NotificationEmailHtml.paragraphHtml(body))
    }

    /** Body paragraphs for EVENT_DETAILS_CHANGED — deltas are rendered in a separate card. */
    private fun eventDetailsChangedParagraphs(): List<String> =
        listOf(
            NotificationEmailHtml.paragraph(
                "Des informations importantes ont changé pour ce spectacle.",
            ),
            NotificationEmailHtml.paragraph(
                "Pense à vérifier que tu es toujours disponible au nouveau créneau ou au nouveau lieu.",
            ),
        )

    private fun buildEventDetailsCard(summary: EventDetailsChangeSummary?): String? {
        val lines = payloadBuilder.formattedEventDetailsDeltaLines(summary)
        if (lines.isEmpty()) return null
        val itemStyle = "margin-bottom:4px;"
        val items = lines.joinToString("") { line ->
            """<li style="$itemStyle">${NotificationEmailHtml.escape(line)}</li>"""
        }
        val listHtml = """<ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.55;color:#1D1B20;">$items</ul>"""
        return NotificationEmailHtml.detailsCardBlock("Modifications", listHtml)
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

    /** Body paragraphs for TEAM_REGRESSED — regression reason goes to the details card. */
    private fun teamRegressedParagraphs(
        eventTitle: String,
        eventDate: String,
    ): List<String> =
        listOf(
            NotificationEmailHtml.paragraphHtml(
                "Mauvaise nouvelle, la composition de l'équipe pour ${NotificationEmailHtml.bold(eventTitle)} le " +
                    "${NotificationEmailHtml.bold(eventDate)} est de nouveau incomplète.",
            ),
            NotificationEmailHtml.paragraph(
                "Action suggérée : rouvrir la compo, combler le trou ou relancer les personnes concernées.",
            ),
        )

    private fun buildTeamRegressedDetailsCard(reasonSummary: String?): String? {
        val reason = reasonSummary?.trim()?.takeIf { it.isNotEmpty() } ?: return null
        val listHtml =
            """<ul style="margin:0;padding:0 0 0 18px;font-size:14px;line-height:1.55;color:#1D1B20;">""" +
                """<li>${NotificationEmailHtml.escape(reason)}</li>""" +
                """</ul>"""
        return NotificationEmailHtml.detailsCardBlock("Motif", listHtml)
    }

    // ── Headline mapping ──────────────────────────────────────────────────────

    private fun headlineFor(
        intent: NotificationIntent,
        eventTitle: String,
        reminderWindow: NotificationReminderWindow?,
    ): String =
        when (intent) {
            NotificationIntent.AVAILABILITY_OPENED -> "Ta dispo pour $eventTitle ?"
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE -> "Ta dispo pour $eventTitle ?"
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE -> "Rappel — ta dispo pour $eventTitle"
            NotificationIntent.AVAILABILITY_PENDING_REMINDER -> "Rappel — ta dispo pour $eventTitle"
            NotificationIntent.CONFIRMATION_REQUEST -> "Tu es dans la compo !"
            NotificationIntent.RECONFIRMATION_REQUEST -> "Reconfirme ta participation"
            NotificationIntent.REMOVED_FROM_COMPOSITION -> "Tu n'es plus dans la compo"
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER ->
                when (reminderWindow) {
                    NotificationReminderWindow.DAYS_7 -> "C'est dans une semaine"
                    NotificationReminderWindow.DAYS_1 -> "C'est demain !"
                    else -> "C'est bientôt !"
                }
            NotificationIntent.PROXY_AVAILABILITY_RECORDED -> "Ta dispo a été mise à jour"
            NotificationIntent.PROXY_CONFIRMATION_RECORDED -> "Ta participation a été mise à jour"
            NotificationIntent.EVENT_DETAILS_CHANGED -> "Infos modifiées pour $eventTitle"
            NotificationIntent.EVENT_ARCHIVED -> "Spectacle archivé"
            NotificationIntent.TEAM_COMPLETE_MEMBER -> "L'équipe est au complet !"
            NotificationIntent.COMPOSITION_SHARED -> "Nouvelle compo proposée"
            NotificationIntent.EVENT_DRAFT_CREATED -> "Nouveau spectacle en brouillon"
            NotificationIntent.SLA_OPEN_AVAILABILITY -> "Ouvre la collecte des dispos"
            NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY -> "Compo encore incomplète"
            NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7 -> "J-7 — compo incomplète"
            NotificationIntent.TEAM_COMPLETE -> "Compo bouclée"
            NotificationIntent.TEAM_REGRESSED -> "La compo n'est plus complète"
            NotificationIntent.TEAM_VALIDATED_FYI,
            NotificationIntent.ORGANIZER_SCOPE_GRANTED,
            -> eventTitle
        }

    // ── Variant mapping ───────────────────────────────────────────────────────

    private fun variantFor(intent: NotificationIntent): EmailVariant =
        when (intent) {
            NotificationIntent.TEAM_COMPLETE_MEMBER -> EmailVariant.GOOD_NEWS
            NotificationIntent.SLA_OPEN_AVAILABILITY,
            NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY,
            NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7,
            NotificationIntent.TEAM_COMPLETE,
            NotificationIntent.TEAM_REGRESSED,
            NotificationIntent.EVENT_DRAFT_CREATED,
            NotificationIntent.COMPOSITION_SHARED,
            -> EmailVariant.ORGA_ALERT
            else -> EmailVariant.ACTION
        }

    // ── Horizon badge ─────────────────────────────────────────────────────────

    private fun horizonBadgeFor(reminderWindow: NotificationReminderWindow?): String? =
        when (reminderWindow) {
            NotificationReminderWindow.DAYS_7 -> "J-7"
            NotificationReminderWindow.DAYS_1 -> "J-1"
            else -> null
        }

    // ── Category label ────────────────────────────────────────────────────────

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
