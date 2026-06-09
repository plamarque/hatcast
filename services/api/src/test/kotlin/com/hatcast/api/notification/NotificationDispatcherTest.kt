package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.mock
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider
import java.time.Instant
import java.util.Optional
import java.util.UUID

class NotificationDispatcherTest {
    private val recipientResolver: NotificationRecipientResolver = mock()
    private val payloadBuilder: NotificationPayloadBuilder = NotificationPayloadBuilder()
    private val emailBodyBuilder =
        NotificationEmailBodyBuilder(
            NotificationEmailProperties(publicWebOrigin = "https://localhost:4200"),
            payloadBuilder,
        )
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
            emailBodyBuilder = emailBodyBuilder,
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
        verify(deliveryLogRepository, times(4)).save(any())
    }

    @Test
    fun `AVAILABILITY_PENDING_REMINDER skips push when weekly reminder preference disabled`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        val preferencePort: NotificationPreferenceEligibilityPort = mock()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.AVAILABILITY_WEEKLY_REMINDER))
            .thenReturn(false)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(preferencePort)
        whenever(
            preferencePort.isAllowed(userId, NotificationCategory.AVAILABILITY_WEEKLY_REMINDER, NotificationChannel.EMAIL),
        ).thenReturn(true)
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity(email = "alice@example.com")))
        whenever(emailSender.sendEmail(any(), any(), any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(channel = NotificationChannel.EMAIL, status = NotificationDeliveryStatus.SENT),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = userId,
                recipientUserIds = listOf(userId),
            ),
        )

        verify(pushSender, org.mockito.kotlin.never()).sendPush(any(), any(), any(), any())
        verify(deliveryLogRepository).save(
            argThat {
                channel == NotificationChannel.PUSH &&
                    status == NotificationDeliveryStatus.SKIPPED &&
                    errorMessage == "push_not_allowed"
            },
        )
    }

    @Test
    fun `AVAILABILITY_PENDING_REMINDER skips email when weekly reminder preference disabled`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        val preferencePort: NotificationPreferenceEligibilityPort = mock()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.AVAILABILITY_WEEKLY_REMINDER))
            .thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(preferencePort)
        whenever(
            preferencePort.isAllowed(userId, NotificationCategory.AVAILABILITY_WEEKLY_REMINDER, NotificationChannel.EMAIL),
        ).thenReturn(false)
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity(email = "alice@example.com")))
        whenever(pushSender.sendPush(any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SENT),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = userId,
                recipientUserIds = listOf(userId),
            ),
        )

        verify(emailSender, org.mockito.kotlin.never()).sendEmail(any(), any(), any(), any(), any(), any())
        verify(deliveryLogRepository).save(
            argThat {
                channel == NotificationChannel.EMAIL &&
                    status == NotificationDeliveryStatus.SKIPPED &&
                    errorMessage == "email_preference_disabled"
            },
        )
    }

    @Test
    fun `category mapping covers all intents`() {
        assertEquals(
            NotificationCategory.TEAM_CONFIRMED,
            NotificationIntent.TEAM_VALIDATED_FYI.toCategory(),
        )
        assertEquals(
            NotificationCategory.REMINDER_7_DAYS,
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER.toCategory(NotificationReminderWindow.DAYS_7),
        )
        assertEquals(
            NotificationCategory.REMINDER_1_DAY,
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER.toCategory(NotificationReminderWindow.DAYS_1),
        )
        assertEquals(
            NotificationCategory.CONFIRMATION_REQUEST,
            NotificationIntent.REMOVED_FROM_COMPOSITION.toCategory(),
        )
        assertEquals(
            NotificationCategory.CONFIRMATION_REQUEST,
            NotificationIntent.RECONFIRMATION_REQUEST.toCategory(),
        )
        assertEquals(
            NotificationCategory.AVAILABILITY_REQUEST,
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE.toCategory(),
        )
        assertEquals(
            NotificationCategory.AVAILABILITY_REQUEST,
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE.toCategory(),
        )
        assertEquals(
            NotificationCategory.AVAILABILITY_WEEKLY_REMINDER,
            NotificationIntent.AVAILABILITY_PENDING_REMINDER.toCategory(),
        )
        assertEquals(
            NotificationCategory.ORG_DRAFT_COMPOSITION,
            NotificationIntent.COMPOSITION_SHARED.toCategory(),
        )
        assertEquals(
            NotificationCategory.ORG_TEAM_COMPLETE,
            NotificationIntent.TEAM_COMPLETE.toCategory(),
        )
        assertEquals(
            NotificationCategory.ORG_TEAM_REGRESSED,
            NotificationIntent.TEAM_REGRESSED.toCategory(),
        )
        assertEquals(
            NotificationCategory.AVAILABILITY_REQUEST,
            NotificationIntent.PROXY_AVAILABILITY_RECORDED.toCategory(),
        )
        assertEquals(
            NotificationCategory.CONFIRMATION_REQUEST,
            NotificationIntent.PROXY_CONFIRMATION_RECORDED.toCategory(),
        )
        assertEquals(
            NotificationCategory.EVENT_DETAILS_CHANGED,
            NotificationIntent.EVENT_DETAILS_CHANGED.toCategory(),
        )
        assertEquals(
            NotificationCategory.EVENT_ARCHIVED,
            NotificationIntent.EVENT_ARCHIVED.toCategory(),
        )
        assertEquals(
            NotificationCategory.TEAM_CONFIRMED,
            NotificationIntent.TEAM_COMPLETE_MEMBER.toCategory(),
        )
    }

    @Test
    fun `COMPOSITION_SHARED dispatch resolves event organizer recipients`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(
            recipientResolver.resolveEventOrganizerRecipients(eventId, null),
        ).thenReturn(listOf(NotificationRecipient(userId = userId, displayName = "Orga")))

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.COMPOSITION_SHARED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
            ),
        )

        verify(recipientResolver).resolveEventOrganizerRecipients(eventId, null)
    }

    @Test
    fun `scheduled intent with explicit recipientUserIds loads displayName from user repository`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(userRepository.findAllById(setOf(userId))).thenReturn(
            listOf(UserEntity(id = userId, email = "pierrick@seed.improbots.test", displayName = "Pierrick")),
        )
        whenever(userRepository.findById(userId)).thenReturn(
            Optional.of(UserEntity(id = userId, email = "pierrick@seed.improbots.test", displayName = "Pierrick")),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(any(), any())).thenReturn(false)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(null)

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.SLA_OPEN_AVAILABILITY,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                recipientUserIds = listOf(userId),
            ),
        )

        org.mockito.kotlin.verify(userRepository, org.mockito.kotlin.atLeastOnce()).findAllById(setOf(userId))
        org.mockito.kotlin.verify(recipientResolver, org.mockito.kotlin.never())
            .resolveEventAndSeasonOrganizerRecipients(any(), any(), any())
    }

    @Test
    fun `TEAM_COMPLETE_MEMBER skips email when TEAM_CONFIRMED preference disabled`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        val preferencePort: NotificationPreferenceEligibilityPort = mock()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveTeamCompleteMemberRecipients(eventId)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.TEAM_CONFIRMED))
            .thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(preferencePort)
        whenever(
            preferencePort.isAllowed(userId, NotificationCategory.TEAM_CONFIRMED, NotificationChannel.EMAIL),
        ).thenReturn(false)
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(UserEntity(email = "alice@example.com")))
        whenever(pushSender.sendPush(any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SENT),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.TEAM_COMPLETE_MEMBER,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = userId,
            ),
        )

        verify(emailSender, org.mockito.kotlin.never()).sendEmail(any(), any(), any(), any(), any(), any())
        verify(deliveryLogRepository).save(
            argThat {
                channel == NotificationChannel.EMAIL &&
                    status == NotificationDeliveryStatus.SKIPPED &&
                    errorMessage == "email_preference_disabled"
            },
        )
    }

    @Test
    fun `proxy intents resolve explicit subject only`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val subjectUserId = UUID.randomUUID()
        val actorUserId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveSubjectRecipient(subjectUserId)).thenReturn(
            listOf(NotificationRecipient(userId = subjectUserId, displayName = "")),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(any(), any())).thenReturn(true)
        whenever(preferenceEligibilityPort.ifAvailable).thenReturn(null)
        whenever(userRepository.findById(subjectUserId)).thenReturn(Optional.of(UserEntity(email = null)))
        whenever(pushSender.sendPush(any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(channel = NotificationChannel.PUSH, status = NotificationDeliveryStatus.SKIPPED),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.PROXY_AVAILABILITY_RECORDED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
                subjectUserId = subjectUserId,
                actorDisplayName = "Orga",
                proxyChangeSummary =
                    ProxyChangeSummary.Availability(
                        beforeLabel = "Non renseigné",
                        afterLabel = "Dispo",
                    ),
            ),
        )

        verify(recipientResolver).resolveSubjectRecipient(subjectUserId)
        verify(recipientResolver, org.mockito.kotlin.never()).resolveConcernedRosterRecipients(any(), any())
        verify(recipientResolver, org.mockito.kotlin.never()).resolveAssigneeRecipients(any())
    }

    @Test
    fun `proxy intent skips when subject equals actor`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = userId,
                subjectUserId = userId,
            ),
        )

        verify(recipientResolver, org.mockito.kotlin.never()).resolveSubjectRecipient(any())
        verify(pushSender, org.mockito.kotlin.never()).sendPush(any(), any(), any(), any())
    }

    @Test
    fun `EVENT_DETAILS_CHANGED guest email sends email only without push or prefs`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val event = notificationEvent(eventId, troupeId)
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(recipientResolver.resolveEngagedEventRosterRecipients(seasonId, eventId)).thenReturn(
            listOf(
                NotificationRecipient(
                    userId = null,
                    displayName = "Guest Externe",
                    email = "guest@example.com",
                ),
            ),
        )
        whenever(emailSender.sendEmail(any(), any(), any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
            ),
        )

        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.EVENT_DETAILS_CHANGED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = UUID.randomUUID(),
                eventDetailsChangeSummary =
                    EventDetailsChangeSummary(
                        locationChange =
                            EventDetailsChangeSummary.LocationChange("A", "B"),
                    ),
            ),
        )

        verify(emailSender, times(1)).sendEmail(
            org.mockito.kotlin.eq(null),
            org.mockito.kotlin.eq("guest@example.com"),
            any(),
            any(),
            org.mockito.kotlin.eq(NotificationIntent.EVENT_DETAILS_CHANGED),
            org.mockito.kotlin.eq(eventId),
        )
        verify(pushSender, org.mockito.kotlin.never()).sendPush(any(), any(), any(), any())
        verifyNoInteractions(userRepository)
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
