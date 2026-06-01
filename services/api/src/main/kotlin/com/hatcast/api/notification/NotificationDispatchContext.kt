package com.hatcast.api.notification

import java.util.UUID

data class NotificationDispatchContext(
    val intent: NotificationIntent,
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID?,
    val actorUserId: UUID,
    val assigneeParticipantIds: List<UUID> = emptyList(),
)

data class NotificationRecipient(
    val userId: UUID,
    val displayName: String,
)

data class NotificationPayload(
    val title: String,
    val body: String,
    val url: String,
)
