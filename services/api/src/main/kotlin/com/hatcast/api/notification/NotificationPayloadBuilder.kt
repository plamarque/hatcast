package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventService
import com.hatcast.api.season.SeasonStatisticsService
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
    ): NotificationPayload {
        val seasonSlug = event.season.slug
        val eventSlug = event.slug
        val eventTitle = event.title
        val eventDate = formatEventDate(event)
        val roleLabel = roleKey?.let { SeasonStatisticsService.ROLE_LABELS[it] ?: it }

        return when (intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                NotificationPayload(
                    title = "🎯 Nouvel événement !",
                    body = "🎭 On a besoin de toi pour $eventTitle le $eventDate !",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE -> {
                val body =
                    customMessageBody?.trim()?.takeIf { it.isNotEmpty() }
                        ?: "🎭 On a besoin de toi pour $eventTitle le $eventDate !"
                NotificationPayload(
                    title = "📢 Annonce spectacle",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE -> {
                val body =
                    customMessageBody?.trim()?.takeIf { it.isNotEmpty() }
                        ?: "N'oublie pas de répondre pour $eventTitle le $eventDate !"
                NotificationPayload(
                    title = "⏰ Rappel disponibilité",
                    body = body,
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.CONFIRMATION_REQUEST ->
                NotificationPayload(
                    title = "🎭 Confirme ta participation !",
                    body = "🕺 Prépares-toi à briller pour $eventTitle le $eventDate!",
                    url = "/saison/$seasonSlug/event/$eventSlug?showConfirm=true",
                )
            NotificationIntent.TEAM_VALIDATED_FYI ->
                NotificationPayload(
                    title = "✅ Équipe validée",
                    body = "L'équipe pour $eventTitle le $eventDate a été validée.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER -> {
                val rolePart = roleLabel?.let { " en tant que $it" }.orEmpty()
                NotificationPayload(
                    title = "📅 Rappel spectacle",
                    body = "Tu es attendu·e$rolePart pour $eventTitle le $eventDate. Décline si tu n'es plus disponible.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            }
            NotificationIntent.REMOVED_FROM_COMPOSITION -> {
                val rolePart = roleLabel?.let { " ($it)" }.orEmpty()
                NotificationPayload(
                    title = "Composition mise à jour",
                    body = "Tu n'es plus dans la composition$rolePart pour $eventTitle le $eventDate.",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=equipe",
                )
            }
            NotificationIntent.RECONFIRMATION_REQUEST ->
                NotificationPayload(
                    title = "🔄 Reconfirme ta participation",
                    body = "La composition a changé pour $eventTitle le $eventDate. Merci de reconfirmer ta participation.",
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
                    title = "Disponibilité enregistrée",
                    body = "$actor a enregistré ta disponibilité pour $eventTitle le $eventDate : $changePart$rolesPart$commentPart",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            }
            NotificationIntent.PROXY_CONFIRMATION_RECORDED -> {
                val actor = actorDisplayName ?: "Un organisateur"
                val summary = proxyChangeSummary as? ProxyChangeSummary.Participation
                val rolePart = summary?.roleLabel ?: roleLabel.orEmpty()
                val decision = summary?.decisionLabel ?: "mise à jour"
                val verb = ProxyNotificationLabels.participationProxyVerb(decision)
                val url =
                    if (ProxyNotificationLabels.participationProxyUsesShowConfirmDeepLink(decision)) {
                        "/saison/$seasonSlug/event/$eventSlug?showConfirm=true"
                    } else {
                        "/saison/$seasonSlug/event/$eventSlug?tab=equipe"
                    }
                NotificationPayload(
                    title = "Participation enregistrée",
                    body =
                        if (rolePart.isNotBlank()) {
                            "$actor $verb pour $eventTitle ($rolePart) le $eventDate"
                        } else {
                            "$actor $verb pour $eventTitle le $eventDate"
                        },
                    url = url,
                )
            }
        }
    }

    fun buildEmailSubject(
        intent: NotificationIntent,
        event: EventEntity,
    ): String {
        val eventTitle = event.title
        val eventDate = formatEventDate(event)
        return when (intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                "Disponibilité demandée · $eventTitle ($eventDate)"
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE ->
                "Annonce spectacle · $eventTitle ($eventDate)"
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE ->
                "Rappel disponibilité · $eventTitle ($eventDate)"
            NotificationIntent.CONFIRMATION_REQUEST ->
                "🎭 Equipe pour $eventTitle"
            NotificationIntent.TEAM_VALIDATED_FYI ->
                "Équipe validée · $eventTitle ($eventDate)"
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER ->
                "Rappel · $eventTitle ($eventDate)"
            NotificationIntent.REMOVED_FROM_COMPOSITION ->
                "Composition mise à jour · $eventTitle"
            NotificationIntent.RECONFIRMATION_REQUEST ->
                "Reconfirmation · $eventTitle ($eventDate)"
            NotificationIntent.PROXY_AVAILABILITY_RECORDED ->
                "Disponibilité enregistrée · $eventTitle ($eventDate)"
            NotificationIntent.PROXY_CONFIRMATION_RECORDED ->
                "Participation enregistrée · $eventTitle ($eventDate)"
        }
    }

    private fun formatEventDate(event: EventEntity): String {
        val zoned = event.startsAt.atZone(ZONE)
        return EVENT_DATE_FORMAT.format(zoned)
    }

    companion object {
        private val ZONE: ZoneId = EventService.AGENDA_ZONE
        private val EVENT_DATE_FORMAT: DateTimeFormatter =
            DateTimeFormatter.ofPattern("EEEE d MMMM yyyy 'à' HH'h'mm", Locale.FRENCH)
    }
}
