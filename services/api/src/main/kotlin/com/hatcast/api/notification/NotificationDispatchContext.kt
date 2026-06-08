package com.hatcast.api.notification

import java.time.Instant
import java.util.UUID

data class NotificationDispatchContext(
    val intent: NotificationIntent,
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID?,
    val actorUserId: UUID,
    val assigneeParticipantIds: List<UUID> = emptyList(),
    val recipientUserIds: List<UUID> = emptyList(),
    val roleKey: String? = null,
    val slotIndex: Int? = null,
    val reminderWindow: NotificationReminderWindow? = null,
    val subjectUserId: UUID? = null,
    val actorDisplayName: String? = null,
    val proxyChangeSummary: ProxyChangeSummary? = null,
    val customMessageBody: String? = null,
    val eventDetailsChangeSummary: EventDetailsChangeSummary? = null,
)

data class EventDetailsChangeSummary(
    val startsAtChange: StartsAtChange? = null,
    val locationChange: LocationChange? = null,
    val templateTypeChange: TemplateTypeChange? = null,
) {
    data class StartsAtChange(val oldValue: Instant, val newValue: Instant)
    data class LocationChange(val oldValue: String?, val newValue: String?)
    data class TemplateTypeChange(val oldValue: String, val newValue: String)
}

sealed class ProxyChangeSummary {
    data class Availability(
        val beforeLabel: String,
        val afterLabel: String,
        val roleKeysSummary: String? = null,
        val commentSnippet: String? = null,
    ) : ProxyChangeSummary()

    data class Participation(
        val decisionLabel: String,
        val roleLabel: String,
    ) : ProxyChangeSummary()
}

data class NotificationRecipient(
    val userId: UUID?,
    val displayName: String,
    val email: String? = null,
)

data class NotificationPayload(
    val title: String,
    val body: String,
    val url: String,
)
