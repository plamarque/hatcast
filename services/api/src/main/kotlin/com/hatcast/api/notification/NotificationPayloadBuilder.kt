package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventService
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
    ): NotificationPayload {
        val seasonSlug = event.season.slug
        val eventSlug = event.slug
        val eventTitle = event.title
        val eventDate = formatEventDate(event)

        return when (intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                NotificationPayload(
                    title = "🎯 Nouvel événement !",
                    body = "🎭 On a besoin de toi pour $eventTitle le $eventDate !",
                    url = "/saison/$seasonSlug/event/$eventSlug?tab=dispos",
                )
            NotificationIntent.CONFIRMATION_REQUEST ->
                NotificationPayload(
                    title = "🎭 Confirme ta participation !",
                    body = "🕺 Prépares-toi à briller pour $eventTitle le $eventDate!",
                    url = "/saison/$seasonSlug/event/$eventSlug?showConfirm=true",
                )
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
            NotificationIntent.CONFIRMATION_REQUEST ->
                "🎭 Equipe pour $eventTitle"
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
