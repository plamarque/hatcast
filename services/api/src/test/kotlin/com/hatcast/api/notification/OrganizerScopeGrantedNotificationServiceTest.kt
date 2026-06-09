package com.hatcast.api.notification

import com.hatcast.api.organizer.OrganizerScopeGrantedEvent
import com.hatcast.api.organizer.OrganizerScopeKind
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider
import java.util.Optional
import java.util.UUID

class OrganizerScopeGrantedNotificationServiceTest {
    private val userRepository: UserRepository = mock()
    private val emailSender: EmailNotificationSender = mock()
    private val pushSender: WebPushNotificationSender = mock()
    private val reminderMarkService: NotificationReminderMarkService = mock()
    private val preferenceEligibilityPortProvider: ObjectProvider<NotificationPreferenceEligibilityPort> = mock()
    private val pushEligibilityPort: PushNotificationEligibilityPort = mock()

    private val service =
        OrganizerScopeGrantedNotificationService(
            userRepository = userRepository,
            emailSender = emailSender,
            pushSender = pushSender,
            reminderMarkService = reminderMarkService,
            preferenceEligibilityPort = preferenceEligibilityPortProvider,
            pushEligibilityPort = pushEligibilityPort,
        )

    private val userId = UUID.randomUUID()
    private val scopeId = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        whenever(preferenceEligibilityPortProvider.ifAvailable).thenReturn(null)
        whenever(userRepository.findById(userId)).thenReturn(
            Optional.of(
                UserEntity(
                    id = userId,
                    googleSub = "sub-scope-svc",
                    email = "scope-svc@example.com",
                    displayName = "Scope Svc",
                ),
            ),
        )
        whenever(
            reminderMarkService.tryClaimReminderMark(
                intent = NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                eventId = scopeId,
                userId = userId,
                reminderWindow = NotificationReminderWindow.ONCE,
            ),
        ).thenReturn(true)
        whenever(emailSender.sendEmail(any(), any(), any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
            ),
        )
        whenever(pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.ORG_SCOPE_GRANTED))
            .thenReturn(false)
    }

    @Test
    fun `notifyScopeGranted sends transactional email with role label`() {
        service.notifyScopeGranted(
            OrganizerScopeGrantedEvent(
                userId = userId,
                scopeKind = OrganizerScopeKind.SEASON,
                scopeId = scopeId,
                scopeName = "Saison test",
            ),
        )

        verify(emailSender, times(1)).sendEmail(
            eq(userId),
            eq("scope-svc@example.com"),
            eq("Tu es organisateur de saison sur HatCast"),
            any(),
            eq(NotificationIntent.ORGANIZER_SCOPE_GRANTED),
            eq(scopeId),
        )
        verify(pushSender, never()).sendPush(any(), any(), any(), any())
    }

    @Test
    fun `notifyScopeGranted dedupes via reminder mark`() {
        whenever(
            reminderMarkService.tryClaimReminderMark(
                intent = NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                eventId = scopeId,
                userId = userId,
                reminderWindow = NotificationReminderWindow.ONCE,
            ),
        ).thenReturn(false)

        service.notifyScopeGranted(
            OrganizerScopeGrantedEvent(
                userId = userId,
                scopeKind = OrganizerScopeKind.EVENT,
                scopeId = scopeId,
                scopeName = "Gala",
            ),
        )

        verify(emailSender, never()).sendEmail(any(), any(), any(), any(), any(), any())
    }

    @Test
    fun `notifyScopeGranted skips when user has no email`() {
        whenever(userRepository.findById(userId)).thenReturn(
            Optional.of(
                UserEntity(
                    id = userId,
                    googleSub = "sub-no-email",
                    email = null,
                    displayName = "No Email",
                ),
            ),
        )

        service.notifyScopeGranted(
            OrganizerScopeGrantedEvent(
                userId = userId,
                scopeKind = OrganizerScopeKind.TROUPE_ADMIN,
                scopeId = scopeId,
                scopeName = "Les Improbots",
            ),
        )

        verify(emailSender, never()).sendEmail(any(), any(), any(), any(), any(), any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `notifyScopeGranted sends push when ORG_SCOPE_GRANTED pref is on`() {
        whenever(pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.ORG_SCOPE_GRANTED))
            .thenReturn(true)
        val preferencePort: NotificationPreferenceEligibilityPort = mock()
        whenever(preferenceEligibilityPortProvider.ifAvailable).thenReturn(preferencePort)
        whenever(
            preferencePort.isAllowed(
                userId,
                NotificationCategory.ORG_SCOPE_GRANTED,
                NotificationChannel.PUSH,
            ),
        ).thenReturn(true)
        whenever(pushSender.sendPush(any(), any(), any(), any())).thenReturn(
            NotificationDeliveryResult(
                channel = NotificationChannel.PUSH,
                status = NotificationDeliveryStatus.SENT,
            ),
        )

        service.notifyScopeGranted(
            OrganizerScopeGrantedEvent(
                userId = userId,
                scopeKind = OrganizerScopeKind.EVENT,
                scopeId = scopeId,
                scopeName = "Gala",
            ),
        )

        verify(emailSender, times(1)).sendEmail(any(), any(), any(), any(), any(), any())
        verify(pushSender, times(1)).sendPush(
            eq(userId),
            any(),
            eq(NotificationIntent.ORGANIZER_SCOPE_GRANTED),
            eq(scopeId),
        )
    }
}
