package com.hatcast.api.notification

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import nl.martijndwars.webpush.Notification
import nl.martijndwars.webpush.PushService
import nl.martijndwars.webpush.Subscription
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WebPushNotificationSender(
    private val webPushProperties: WebPushProperties,
    private val subscriptionRepository: UserPushSubscriptionRepository,
) : NotificationDeliveryPort {
    private val log = LoggerFactory.getLogger(javaClass)
    private val mapper = jacksonObjectMapper()

    override fun sendPush(
        userId: UUID,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID?,
    ): NotificationDeliveryResult {
        if (webPushProperties.vapidPrivateKey.isBlank()) {
            log.warn(
                "notification_push_skipped reason=missing_vapid_private_key intent={} userId={} eventId={}",
                intent,
                userId,
                eventId,
            )
            return NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "missing_vapid_private_key",
            )
        }

        val subscriptions = subscriptionRepository.findByUserId(userId)
        if (subscriptions.isEmpty()) {
            return NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "no_subscription",
            )
        }

        val pushService =
            PushService(
                webPushProperties.vapidPublicKey,
                webPushProperties.vapidPrivateKey,
                webPushProperties.subject,
            )
        val jsonPayload =
            mapper.writeValueAsString(
                mapOf(
                    "title" to payload.title,
                    "body" to payload.body,
                    "url" to payload.url,
                ),
            )

        var lastError: String? = null
        var sentCount = 0
        for (subscription in subscriptions) {
            try {
                val webPushSubscription =
                    Subscription(
                        subscription.endpoint,
                        Subscription.Keys(subscription.p256dhKey, subscription.authKey),
                    )
                val notification = Notification(webPushSubscription, jsonPayload)
                pushService.send(notification)
                sentCount++
            } catch (ex: Exception) {
                lastError = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown")
                log.warn(
                    "notification_push_failed intent={} userId={} eventId={} channel=PUSH error={}",
                    intent,
                    userId,
                    eventId,
                    lastError,
                )
            }
        }

        return if (sentCount > 0) {
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SENT)
        } else {
            NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.FAILED,
                errorMessage = lastError ?: "all_subscriptions_failed",
            )
        }
    }

    override fun sendEmail(
        userId: UUID,
        email: String,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID?,
    ): NotificationDeliveryResult {
        throw UnsupportedOperationException("Use EmailNotificationSender for email delivery")
    }
}
