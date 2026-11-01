package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.mockito.Mockito
import nl.martijndwars.webpush.PushService
import com.hatcast.api.user.UserEntity
import java.util.UUID

class WebPushNotificationSenderTest {
    private val subscriptionRepository: UserPushSubscriptionRepository = mock()
    private val sender =
        WebPushNotificationSender(
            WebPushProperties(vapidPublicKey = "invalid", vapidPrivateKey = "invalid"),
            subscriptionRepository,
            mock(),
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

    @Test
    fun `advent push skips a device transferred after the initial lookup`() {
        val user = UserEntity()
        val devices: AdventReminderDeviceRepository = mock()
        val device = AdventReminderDeviceEntity(user = user, endpoint = "https://push.example.test/device", p256dhKey = "key", authKey = "auth")
        whenever(devices.findByUserId(user.id)).thenReturn(listOf(device))
        whenever(devices.existsByUserIdAndEndpoint(user.id, device.endpoint)).thenReturn(false)
        Mockito.mockConstruction(PushService::class.java).use { construction ->
            val sender = WebPushNotificationSender(WebPushProperties(vapidPublicKey = "test", vapidPrivateKey = "test"), subscriptionRepository, devices)
            val result = sender.sendAdventPush(user.id, NotificationPayload("Quiz", "Le quiz t’attend", "/avent"))
            assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
            assertEquals("device_owner_changed", result.errorMessage)
            Mockito.verifyNoInteractions(construction.constructed().single())
        }
    }
}
