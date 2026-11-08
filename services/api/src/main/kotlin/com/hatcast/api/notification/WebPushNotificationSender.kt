package com.hatcast.api.notification

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import nl.martijndwars.webpush.Notification
import nl.martijndwars.webpush.PushService
import nl.martijndwars.webpush.Subscription
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import org.springframework.transaction.annotation.Transactional

@Component
class WebPushNotificationSender(
    private val webPushProperties: WebPushProperties,
    private val subscriptionRepository: UserPushSubscriptionRepository,
    private val adventDevices: AdventReminderDeviceRepository,
    private val pushSubscriptions: UserPushSubscriptionService,
) : NotificationDeliveryPort {
    private val log = LoggerFactory.getLogger(javaClass)
    private val mapper = jacksonObjectMapper()

    override fun sendPush(
        userId: UUID,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID?,
    ): NotificationDeliveryResult = send(userId, payload, intent.name, eventId, false)

    /** Advent has no associated event and does not belong to the event categories. */
    fun sendAdventPush(userId: UUID, payload: NotificationPayload): NotificationDeliveryResult =
        send(userId, payload, "ADVENT_REMINDER", null, true)

    @Transactional
    fun sendTestAdventPush(userId: UUID, device: RegisterPushSubscriptionRequest, payload: NotificationPayload): NotificationDeliveryResult {
        val endpoint = device.endpoint.trim()
        // Account switches and both registration paths use the same endpoint lock.
        // Keep ownership stable until the push provider has accepted or rejected this one send.
        pushSubscriptions.lockEndpoint(endpoint)
        if (!pushSubscriptions.ownsTestAdventDevice(userId, device))
            return NotificationDeliveryResult(NotificationChannel.PUSH, NotificationDeliveryStatus.SKIPPED, "device_owner_changed")
        return send(userId, payload, "ADVENT_REMINDER", null, true, endpoint)
    }

    fun isConfigured(): Boolean = webPushProperties.vapidPrivateKey.isNotBlank()

    private data class PushTarget(val endpoint: String, val p256dhKey: String, val authKey: String)

    private fun send(userId: UUID, payload: NotificationPayload, intent: String, eventId: UUID?, advent: Boolean, endpoint: String? = null): NotificationDeliveryResult {
        if (!isConfigured()) {
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

        val subscriptions = if (advent) adventDevices.findByUserId(userId).filter { endpoint == null || it.endpoint == endpoint }.map { PushTarget(it.endpoint, it.p256dhKey, it.authKey) }
            else subscriptionRepository.findByUserId(userId).map { PushTarget(it.endpoint, it.p256dhKey, it.authKey) }
        if (subscriptions.isEmpty()) {
            return NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "no_subscription",
            )
        }

        val pushService =
            try {
                PushService(
                    webPushProperties.vapidPublicKey,
                    webPushProperties.vapidPrivateKey,
                    webPushProperties.subject,
                )
            } catch (ex: Exception) {
                val error = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown")
                log.warn(
                    "notification_push_failed intent={} userId={} eventId={} channel=PUSH error={}",
                    intent,
                    userId,
                    eventId,
                    error,
                )
                return NotificationDeliveryResult(
                    channel = NotificationChannel.PUSH,
                    status = NotificationDeliveryStatus.FAILED,
                    errorMessage = error,
                )
            }
        val jsonPayload =
            mapper.writeValueAsString(
                mapOf(
                    "title" to payload.title,
                    "body" to payload.body,
                    "url" to payload.url,
                    "kind" to payload.kind,
                ),
            )

        var lastError: String? = null
        var sentCount = 0
        var ownershipChangedCount = 0
        for (subscription in subscriptions) {
            // A browser may have changed accounts since the initial recipient lookup.
            // Never hold a database lock over network I/O: HatCast must not wait for Advent.
            if (advent && !adventDevices.existsByUserIdAndEndpoint(userId, subscription.endpoint)) {
                ownershipChangedCount++
                continue
            }
            try {
                val webPushSubscription =
                    Subscription(
                        subscription.endpoint,
                        Subscription.Keys(subscription.p256dhKey, subscription.authKey),
                    )
                val notification = Notification(webPushSubscription, jsonPayload)
                val response = pushService.send(notification)
                if (advent && response.statusLine.statusCode !in 200..299)
                    throw IllegalStateException("push_provider_rejected_" + response.statusLine.statusCode)
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

        return if (sentCount == 0 && ownershipChangedCount == subscriptions.size) {
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SKIPPED, errorMessage = "device_owner_changed")
        } else if (sentCount > 0 && lastError == null) {
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SENT)
        } else if (sentCount > 0) {
            NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.PARTIAL,
                errorMessage = lastError,
            )
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
