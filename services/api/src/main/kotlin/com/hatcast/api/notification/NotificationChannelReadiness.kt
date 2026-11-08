package com.hatcast.api.notification

import org.springframework.stereotype.Component

/** Whether a channel can send at all with the current configuration, for any recipient. */
@Component
class NotificationChannelReadiness(
    private val emailSender: EmailNotificationSender,
    private val pushSender: WebPushNotificationSender,
) {
    /** Null when the channel can send; otherwise the configuration reason, for logs only. */
    fun unavailableReason(channel: NotificationChannel): String? =
        when (channel) {
            NotificationChannel.EMAIL -> emailSender.unavailableReason()
            NotificationChannel.PUSH -> if (pushSender.isConfigured()) null else "missing_vapid_private_key"
        }
}
