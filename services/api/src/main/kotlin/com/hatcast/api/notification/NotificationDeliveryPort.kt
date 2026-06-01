package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity

interface NotificationDeliveryPort {
    fun sendPush(
        userId: java.util.UUID,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: java.util.UUID?,
    ): NotificationDeliveryResult

    fun sendEmail(
        userId: java.util.UUID,
        email: String,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: java.util.UUID?,
    ): NotificationDeliveryResult
}

data class NotificationDeliveryResult(
    val channel: NotificationChannel,
    val status: NotificationDeliveryStatus,
    val errorMessage: String? = null,
)
