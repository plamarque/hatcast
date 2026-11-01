package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.mockito.Mockito
import nl.martijndwars.webpush.PushService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import com.hatcast.api.notification.dto.PushSubscriptionKeysDto
import java.util.UUID

class WebPushNotificationSenderTest {
    private val subscriptionRepository: UserPushSubscriptionRepository = mock()
    private val sender =
        WebPushNotificationSender(
            WebPushProperties(vapidPublicKey = "invalid", vapidPrivateKey = "invalid"),
            subscriptionRepository,
            mock(),
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
            val sender = WebPushNotificationSender(WebPushProperties(vapidPublicKey = "test", vapidPrivateKey = "test"), subscriptionRepository, devices, mock())
            val result = sender.sendAdventPush(user.id, NotificationPayload("Quiz", "Le quiz t’attend", "/avent"))
            assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
            assertEquals("device_owner_changed", result.errorMessage)
            Mockito.verifyNoInteractions(construction.constructed().single())
        }
    }
    @Test
    fun `test push checks ownership and never looks up other devices for delivery`() {
        val user = UserEntity()
        val devices: AdventReminderDeviceRepository = mock()
        val ownership: UserPushSubscriptionService = mock()
        val one = AdventReminderDeviceEntity(user = user, endpoint = "https://push.example.test/one", p256dhKey = "key", authKey = "auth")
        val two = AdventReminderDeviceEntity(user = user, endpoint = "https://push.example.test/two", p256dhKey = "key", authKey = "auth")
        val target = RegisterPushSubscriptionRequest(one.endpoint, PushSubscriptionKeysDto("key", "auth"))
        whenever(ownership.ownsTestAdventDevice(user.id, target)).thenReturn(true)
        whenever(devices.findByUserId(user.id)).thenReturn(listOf(one, two))
        whenever(devices.existsByUserIdAndEndpoint(user.id, one.endpoint)).thenReturn(false)
        Mockito.mockConstruction(PushService::class.java).use { construction ->
            val sender = WebPushNotificationSender(WebPushProperties(vapidPublicKey = "test", vapidPrivateKey = "test"), subscriptionRepository, devices, ownership)
            val result = sender.sendTestAdventPush(user.id, target, NotificationPayload("Quiz", "Rappel", "/avent?jour=1"))
            assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
            verify(ownership).lockEndpoint(one.endpoint)
            verify(devices).existsByUserIdAndEndpoint(user.id, one.endpoint)
            org.mockito.kotlin.verify(devices, org.mockito.kotlin.never()).existsByUserIdAndEndpoint(user.id, two.endpoint)
            Mockito.verifyNoInteractions(construction.constructed().single())
        }
    }

    @Test
    fun `test push delivers exactly once to the selected device`() {
        val user = UserEntity()
        val devices: AdventReminderDeviceRepository = mock()
        val ownership: UserPushSubscriptionService = mock()
        val one = AdventReminderDeviceEntity(user = user, endpoint = "https://push.example.test/one", p256dhKey = "key", authKey = "auth")
        val two = AdventReminderDeviceEntity(user = user, endpoint = "https://push.example.test/two", p256dhKey = "key", authKey = "auth")
        val target = RegisterPushSubscriptionRequest(one.endpoint, PushSubscriptionKeysDto("key", "auth"))
        whenever(ownership.ownsTestAdventDevice(user.id, target)).thenReturn(true)
        whenever(devices.findByUserId(user.id)).thenReturn(listOf(one, two))
        whenever(devices.existsByUserIdAndEndpoint(user.id, one.endpoint)).thenReturn(true)
        val response: org.apache.http.HttpResponse = mock()
        val status: org.apache.http.StatusLine = mock()
        whenever(response.statusLine).thenReturn(status)
        whenever(status.statusCode).thenReturn(201)
        val targets = mutableListOf<String>()
        Mockito.mockConstruction(nl.martijndwars.webpush.Notification::class.java) { _, context ->
            targets.add((context.arguments()[0] as nl.martijndwars.webpush.Subscription).endpoint)
        }.use {
            Mockito.mockConstruction(PushService::class.java) { service, _ ->
                whenever(service.send(org.mockito.kotlin.any<nl.martijndwars.webpush.Notification>())).thenReturn(response)
            }.use { construction ->
                val sender = WebPushNotificationSender(WebPushProperties(vapidPublicKey = "test", vapidPrivateKey = "test"), subscriptionRepository, devices, ownership)
                assertEquals(NotificationDeliveryStatus.SENT, sender.sendTestAdventPush(user.id, target, adventReminderPayload(5, true)).status)
                assertEquals(listOf(one.endpoint), targets)
                verify(construction.constructed().single(), org.mockito.kotlin.times(1)).send(org.mockito.kotlin.any<nl.martijndwars.webpush.Notification>())
            }
        }
    }

    @Test
    fun `normal and test reminders use the same presentation and their selected destination`() {
        val normal = adventReminderPayload(7)
        val test = adventReminderPayload(5, true)
        assertEquals(normal.title, test.title)
        assertEquals(normal.body, test.body)
        assertEquals(normal.kind, test.kind)
        assertEquals("/avent?jour=7", normal.url)
        assertEquals("/avent?jour=5&test=1", test.url)
    }

}
