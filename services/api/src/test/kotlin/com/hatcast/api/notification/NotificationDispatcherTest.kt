package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider
import java.time.Instant
import java.util.Optional
import java.util.UUID

class NotificationDispatcherTest {
    private val recipientResolver: NotificationRecipientResolver = mock()
    private val payloadBuilder: NotificationPayloadBuilder = NotificationPayloadBuilder()
    private val pushSender: WebPushNotificationSender = mock()
    private val emailSender: EmailNotificationSender = mock()
    private val pushEligibilityPort: PushNotificationEligibilityPort = mock()
    private val preferenceEligibilityPort: ObjectProvider<NotificationPreferenceEligibilityPort> = mock()
    private val userRepository: UserRepository = mock()
    private val eventRepository: EventRepository = mock()
    private val deliveryLogRepository: NotificationDeliveryLogRepository = mock()

    private val dispatcher =
        NotificationDispatcher(
            recipientResolver = recipientResolver,
            payloadBuilder = payloadBuilder,
            pushSender = pushSender,
            emailSender = emailSender,
            pushEligibilityPort = pushEligibilityPort,
            preferenceEligibilityPort = preferenceEligibilityPort,
            userRepository = userRepository,
            eventRepository = eventRepository,
            deliveryLogRepository = deliveryLogRepository,
        )

    @Test
    fun `push failure is logged without propagating to caller`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val troupe = TroupeEntity(id = troupeId, name = "Test", slug = "test")
        val season = SeasonEntity(troupe = troupe, slug = "saison-test", title = "Saison")
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Spectacle test",
                slug = "spectacle-test",
                startsAt = Instant.parse("2032-01-15T19:00:00Z"),
            )
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveConcernedRosterRecipients(seasonId, eventId)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(any(), any())).thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(null)
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity(email = "alice@example.com")))
        whenever(
            pushSender.sendPush(any(), any(), any(), any()),
        ).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.FAILED,
                errorMessage = "WebPushException: gone",
            ),
        )
        whenever(emailSender.sendEmail(any(), any(), any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SKIPPED,
            ),
        )

        assertDoesNotThrow {
            dispatcher.dispatch(
                NotificationDispatchContext(
                    intent = NotificationIntent.AVAILABILITY_OPENED,
                    eventId = eventId,
                    seasonId = seasonId,
                    troupeId = troupe.id,
                    actorUserId = UUID.randomUUID(),
                ),
            )
        }
    }

    @Test
    fun `skipped push delivery is persisted for observability`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveConcernedRosterRecipients(seasonId, eventId)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(any(), any())).thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(null)
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity(email = null)))
        whenever(pushSender.sendPush(any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "missing_vapid_private_key",
            ),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.AVAILABILITY_OPENED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = UUID.randomUUID(),
            ),
        )

        verify(deliveryLogRepository).save(
            argThat {
                channel == NotificationChannel.PUSH &&
                    status == NotificationDeliveryStatus.SKIPPED &&
                    errorMessage == "missing_vapid_private_key"
            },
        )
    }

    @Test
    fun `unexpected push error does not stop following recipients`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val firstUserId = UUID.randomUUID()
        val secondUserId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveConcernedRosterRecipients(seasonId, eventId)).thenReturn(
            listOf(
                NotificationRecipient(userId = firstUserId, displayName = "Alice"),
                NotificationRecipient(userId = secondUserId, displayName = "Bob"),
            ),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(any(), any())).thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(null)
        whenever(userRepository.findById(firstUserId)).thenReturn(Optional.of(UserEntity(email = null)))
        whenever(userRepository.findById(secondUserId)).thenReturn(Optional.of(UserEntity(email = null)))
        whenever(pushSender.sendPush(any(), any(), any(), any()))
            .thenThrow(RuntimeException("boom"))
            .thenReturn(NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SENT))

        assertDoesNotThrow {
            dispatcher.dispatch(
                NotificationDispatchContext(
                    intent = NotificationIntent.AVAILABILITY_OPENED,
                    eventId = eventId,
                    seasonId = seasonId,
                    troupeId = troupeId,
                    actorUserId = UUID.randomUUID(),
                ),
            )
        }

        verify(pushSender, times(2)).sendPush(any(), any(), any(), any())
        verify(deliveryLogRepository, times(2)).save(any())
    }

    private fun notificationEvent(
        eventId: UUID,
        troupeId: UUID,
    ): EventEntity {
        val troupe = TroupeEntity(id = troupeId, name = "Test", slug = "test")
        val season = SeasonEntity(troupe = troupe, slug = "saison-test", title = "Saison")
        return EventEntity(
            id = eventId,
            season = season,
            title = "Spectacle test",
            slug = "spectacle-test",
            startsAt = Instant.parse("2032-01-15T19:00:00Z"),
        )
    }
}
