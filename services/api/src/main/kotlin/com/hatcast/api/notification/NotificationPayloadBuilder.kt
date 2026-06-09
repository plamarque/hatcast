package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventService
import com.hatcast.api.role.RoleLabels
import com.hatcast.api.user.MemberGender
import org.springframework.stereotype.Component
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Component
class NotificationPayloadBuilder {
    fun build(
        intent: NotificationIntent,
        event: EventEntity,
        recipientName: String,
        roleKey: String? = null,
        actorDisplayName: String? = null,
        proxyChangeSummary: ProxyChangeSummary? = null,
        customMessageBody: String? = null,
        recipientGender: MemberGender? = null,
        eventDetailsChangeSummary: EventDetailsChangeSummary? = null,
        reasonSummary: String? = null,
    ): NotificationPayload {
        val seasonSlug = event.season.slug
        val eventSlug = event.slug
        val eventTitle = event.title
        val eventDate = formatEventDate(event)
        val roleLabel =
            roleKey?.let { key ->
                RoleLabels.label(key, MemberGender.effective(recipientGender))
            }

        return when (intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                NotificationPayload(
                    title = "🎯 Disponibilité demandée",
                    body = availabilityOpenedDefaultBody(eventTitle, eventDate),
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE -> {
                val body =
                    customMessageBody?.trim()?.takeIf { it.isNotEmpty() }
                        ?: availabilityOpenedDefaultBody(eventTitle, eventDate)
                NotificationPayload(
                    title = "📢 Annonce spectacle",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE -> {
                val body =
                    customMessageBody?.trim()?.takeIf { it.isNotEmpty() }
                        ?: availabilityNudgeDefaultBody(eventTitle, eventDate)
                NotificationPayload(
                    title = "⏰ Rappel disponibilité",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.AVAILABILITY_PENDING_REMINDER ->
                NotificationPayload(
                    title = "⏰ Rappel disponibilité",
                    body = availabilityNudgeDefaultBody(eventTitle, eventDate),
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            NotificationIntent.COMPOSITION_SHARED ->
                NotificationPayload(
                    title = "👥 Compo proposée",
                    body = "Composition proposée pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.EVENT_DRAFT_CREATED ->
                NotificationPayload(
                    title = "📝 Nouveau spectacle",
                    body = "« $eventTitle » a été créé en brouillon ($eventDate).",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=infos",
                )
            NotificationIntent.SLA_OPEN_AVAILABILITY ->
                NotificationPayload(
                    title = "⏰ Ouvrir les dispos",
                    body =
                        "$eventTitle le $eventDate approche. " +
                            "Penser à publier pour ouvrir la collecte des disponibilités.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=infos",
                )
            NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY ->
                NotificationPayload(
                    title = "⚠️ Compo à compléter",
                    body = "Il manque encore du monde pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7 ->
                NotificationPayload(
                    title = "⚠️⚠️ Compo incomplète (J-7)",
                    body =
                        "Attention, on est à J-7 de $eventTitle " +
                            "et la composition n'est pas complète.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.TEAM_COMPLETE ->
                NotificationPayload(
                    title = "✅ Compo bouclée",
                    body = "Tout le monde a confirmé pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.TEAM_REGRESSED -> {
                val reason = reasonSummary?.trim()?.takeIf { it.isNotEmpty() } ?: "équipe non complète"
                NotificationPayload(
                    title = "⚠️ L'équipe n'est plus complète !",
                    body =
                        "Attention, l'équipe confirmée n'est plus complète " +
                            "pour $eventTitle le $eventDate : ($reason).",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            }
            NotificationIntent.CONFIRMATION_REQUEST -> {
                val body =
                    roleLabel?.let { "$it pour $eventTitle le $eventDate" }
                        ?: "$eventTitle le $eventDate"
                NotificationPayload(
                    title = "👍 Confirme ta participation !",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?showConfirm=true",
                )
            }
            NotificationIntent.TEAM_VALIDATED_FYI ->
                NotificationPayload(
                    title = "✅ Équipe validée",
                    body = "L'équipe pour $eventTitle le $eventDate a été validée.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.TEAM_COMPLETE_MEMBER ->
                NotificationPayload(
                    title = "🎉 Équipe au complet",
                    body = "Tous les participant·es ont confirmé pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER -> {
                val body =
                    roleLabel?.let { "Toujours OK ? $it pour $eventTitle le $eventDate." }
                        ?: "Toujours OK ? $eventTitle le $eventDate."
                NotificationPayload(
                    title = "📅 Rappel spectacle",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            }
            NotificationIntent.REMOVED_FROM_COMPOSITION -> {
                val rolePart = roleLabel?.let { " ($it)" }.orEmpty()
                NotificationPayload(
                    title = "😔 Composition mise à jour",
                    body =
                        "Désolé, tu n'es plus dans la composition$rolePart " +
                            "pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            }
            NotificationIntent.RECONFIRMATION_REQUEST ->
                NotificationPayload(
                    title = "🔄 Reconfirme ta participation",
                    body = "La composition a changé pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?showConfirm=true",
                )
            NotificationIntent.PROXY_AVAILABILITY_RECORDED -> {
                val actor = actorDisplayName ?: "Un organisateur"
                val summary = proxyChangeSummary as? ProxyChangeSummary.Availability
                val changePart =
                    summary?.let { "${it.beforeLabel} → ${it.afterLabel}" } ?: "mise à jour"
                val rolesPart =
                    summary?.roleKeysSummary?.let { " · Rôles : $it" }.orEmpty()
                val commentPart =
                    summary?.commentSnippet?.let { " · « $it »" }.orEmpty()
                NotificationPayload(
                    title = "✅ Disponibilité enregistrée",
                    body =
                        "$actor a enregistré ta disponibilité pour $eventTitle le $eventDate : " +
                            "$changePart$rolesPart$commentPart",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.PROXY_CONFIRMATION_RECORDED -> {
                val actor = actorDisplayName ?: "Un organisateur"
                val summary = proxyChangeSummary as? ProxyChangeSummary.Participation
                val rolePart = summary?.roleLabel ?: roleLabel.orEmpty()
                val decision = summary?.decisionLabel ?: "mise à jour"
                val verb = ProxyNotificationLabels.participationProxyVerb(decision)
                val title = ProxyNotificationLabels.participationProxyNotificationTitle(decision)
                val url =
                    if (ProxyNotificationLabels.participationProxyUsesShowConfirmDeepLink(decision)) {
                        "/saison/$seasonSlug/event/$eventSlug?showConfirm=true"
                    } else {
                        "/saison/$seasonSlug/event/$eventSlug?tab=equipe"
                    }
                NotificationPayload(
                    title = title,
                    body =
                        if (rolePart.isNotBlank()) {
                            "$actor $verb pour $eventTitle ($rolePart) le $eventDate"
                        } else {
                            "$actor $verb pour $eventTitle le $eventDate"
                        },
                    url = url,
                )
            }
            NotificationIntent.EVENT_DETAILS_CHANGED -> {
                val deltaPhrase = formatEventDetailsDelta(eventDetailsChangeSummary)
                NotificationPayload(
                    title = "📅 Spectacle modifié",
                    body =
                        if (deltaPhrase.isNotBlank()) {
                            "$eventTitle le $eventDate — $deltaPhrase"
                        } else {
                            "$eventTitle le $eventDate — des informations importantes ont changé."
                        },
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=infos",
                )
            }
            NotificationIntent.EVENT_ARCHIVED ->
                NotificationPayload(
                    title = "🚫 Spectacle archivé",
                    body = "$eventTitle le $eventDate n'a plus lieu (archivé).",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=infos",
                )
            NotificationIntent.ORGANIZER_SCOPE_GRANTED ->
                error("ORGANIZER_SCOPE_GRANTED is built by OrganizerScopeGrantedNotificationService")
        }
    }

    fun buildEmailSubject(
        intent: NotificationIntent,
        event: EventEntity,
        proxyChangeSummary: ProxyChangeSummary? = null,
        roleKey: String? = null,
        recipientGender: MemberGender? = null,
    ): String {
        val eventTitle = event.title
        val eventDate = formatEventDate(event)
        val roleLabel =
            roleKey?.let { key ->
                RoleLabels.label(key, MemberGender.effective(recipientGender))
            }
        return when (intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                "🎯 Disponibilité demandée · $eventTitle ($eventDate)"
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE ->
                "📢 Annonce spectacle · $eventTitle ($eventDate)"
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE ->
                "⏰ Rappel disponibilité · $eventTitle ($eventDate)"
            NotificationIntent.AVAILABILITY_PENDING_REMINDER ->
                "⏰ Rappel disponibilité · $eventTitle ($eventDate)"
            NotificationIntent.COMPOSITION_SHARED ->
                "👥 Compo proposée · $eventTitle ($eventDate)"
            NotificationIntent.EVENT_DRAFT_CREATED ->
                "📝 Nouveau spectacle (brouillon) · $eventTitle ($eventDate)"
            NotificationIntent.SLA_OPEN_AVAILABILITY ->
                "⏰ Ouvrir les dispos · $eventTitle ($eventDate)"
            NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY ->
                "⚠️ Compo à compléter · $eventTitle ($eventDate)"
            NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7 ->
                "⚠️⚠️ Compo incomplète (J-7) · $eventTitle ($eventDate)"
            NotificationIntent.TEAM_COMPLETE ->
                "✅ Compo bouclée · $eventTitle ($eventDate)"
            NotificationIntent.TEAM_REGRESSED ->
                "⚠️ L'équipe n'est plus complète · $eventTitle ($eventDate)"
            NotificationIntent.CONFIRMATION_REQUEST -> {
                val rolePart = roleLabel ?: "Participation"
                "👍 Confirmation requise · $rolePart pour $eventTitle le $eventDate"
            }
            NotificationIntent.TEAM_VALIDATED_FYI ->
                "✅ Équipe validée · $eventTitle ($eventDate)"
            NotificationIntent.TEAM_COMPLETE_MEMBER ->
                "🎉 Équipe au complet · $eventTitle ($eventDate)"
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER -> {
                val rolePart = roleLabel ?: "Participation"
                "📅 Rappel · $rolePart pour $eventTitle le $eventDate"
            }
            NotificationIntent.REMOVED_FROM_COMPOSITION ->
                "😔 Composition mise à jour · $eventTitle"
            NotificationIntent.RECONFIRMATION_REQUEST ->
                "🔄 Reconfirmation requise · $eventTitle ($eventDate)"
            NotificationIntent.PROXY_AVAILABILITY_RECORDED ->
                "✅ Disponibilité enregistrée · $eventTitle ($eventDate)"
            NotificationIntent.PROXY_CONFIRMATION_RECORDED -> {
                val decision =
                    (proxyChangeSummary as? ProxyChangeSummary.Participation)?.decisionLabel
                        ?: "mise à jour"
                "${ProxyNotificationLabels.participationProxyNotificationTitle(decision)} · $eventTitle ($eventDate)"
            }
            NotificationIntent.EVENT_DETAILS_CHANGED ->
                "📅 Spectacle modifié · $eventTitle ($eventDate)"
            NotificationIntent.EVENT_ARCHIVED ->
                "🚫 Spectacle archivé · $eventTitle ($eventDate)"
            NotificationIntent.ORGANIZER_SCOPE_GRANTED ->
                error("ORGANIZER_SCOPE_GRANTED is built by OrganizerScopeGrantedNotificationService")
        }
    }

    fun formattedEventDate(event: EventEntity): String = formatEventDate(event)

    fun formattedEventDetailsDeltaLines(summary: EventDetailsChangeSummary?): List<String> {
        val delta = formatEventDetailsDelta(summary)
        if (delta.isBlank()) {
            return emptyList()
        }
        return delta.split(" · ")
    }

    private fun availabilityOpenedDefaultBody(eventTitle: String, eventDate: String): String =
        "Donne tes dispos pour $eventTitle le $eventDate !"

    private fun availabilityNudgeDefaultBody(eventTitle: String, eventDate: String): String =
        "N'oublie pas de donner tes dispos pour $eventTitle le $eventDate"

    private fun formatEventDetailsDelta(summary: EventDetailsChangeSummary?): String {
        if (summary == null) return ""
        val parts = mutableListOf<String>()
        summary.startsAtChange?.let { change ->
            parts.add(
                "Date : ${formatInstant(change.oldValue)} → ${formatInstant(change.newValue)}",
            )
        }
        summary.locationChange?.let { change ->
            val oldLabel = change.oldValue?.takeIf { it.isNotBlank() } ?: "non renseigné"
            val newLabel = change.newValue?.takeIf { it.isNotBlank() } ?: "non renseigné"
            parts.add("Lieu : $oldLabel → $newLabel")
        }
        summary.templateTypeChange?.let { change ->
            parts.add(
                "Format : ${templateTypeLabel(change.oldValue)} → ${templateTypeLabel(change.newValue)}",
            )
        }
        return parts.joinToString(" · ")
    }

    private fun templateTypeLabel(templateType: String): String =
        TEMPLATE_TYPE_LABELS[templateType] ?: templateType

    private fun formatInstant(instant: java.time.Instant): String {
        val zoned = instant.atZone(ZONE)
        return EVENT_DATE_FORMAT.format(zoned)
    }

    private fun formatEventDate(event: EventEntity): String {
        val zoned = event.startsAt.atZone(ZONE)
        return EVENT_DATE_FORMAT.format(zoned)
    }

    companion object {
        private val ZONE: ZoneId = EventService.AGENDA_ZONE
        private val EVENT_DATE_FORMAT: DateTimeFormatter =
            DateTimeFormatter.ofPattern("EEEE d MMMM yyyy 'à' HH'h'mm", Locale.FRENCH)
        private val TEMPLATE_TYPE_LABELS: Map<String, String> =
            mapOf(
                "cabaret" to "Cabaret",
                "longform" to "Longform",
                "freeform" to "Freeform",
                "match" to "Match",
                "catch" to "Catch",
                "deplacement" to "Déplacement",
                "survey" to "Sondage",
                "custom" to "Custom",
            )
    }
}
