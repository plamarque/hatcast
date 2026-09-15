package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID

class WebPushNotificationSenderTest {
    private val subscriptionRepository: UserPushSubscriptionRepository = mock()
    private val sender =
        WebPushNotificationSender(
            WebPushProperties(vapidPublicKey = "invalid", vapidPrivateKey = "invalid"),
            subscriptionRepository,
        )

    @Test
    fun `sendPush reads persisted subscriptions without an HTTP session`() {
        val userId = UUID.randomUUID()
        whenever(subscriptionRepository.findByUserId(userId)).thenReturn(emptyList())

        val result =
            sender.sendPush(
                userId,
                NotificationPayload(title = "Titre", body = "Corps", url = "/agenda"),
                NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                null,
            )

        assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
        assertEquals("no_subscription", result.errorMessage)
        verify(subscriptionRepository).findByUserId(userId)
    }
}
