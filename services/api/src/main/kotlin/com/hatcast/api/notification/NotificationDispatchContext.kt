package com.hatcast.api.notification

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
)

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
    val userId: UUID,
    val displayName: String,
)

data class NotificationPayload(
    val title: String,
    val body: String,
    val url: String,
)
