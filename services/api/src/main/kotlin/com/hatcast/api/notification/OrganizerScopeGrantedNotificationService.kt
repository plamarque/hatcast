package com.hatcast.api.notification

import com.hatcast.api.organizer.OrganizerScopeGrantedEvent
import com.hatcast.api.organizer.OrganizerScopeKind
import com.hatcast.api.user.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class OrganizerScopeGrantedNotificationService(
    private val userRepository: UserRepository,
    private val emailSender: EmailNotificationSender,
    private val pushSender: WebPushNotificationSender,
    private val reminderMarkService: NotificationReminderMarkService,
    private val preferenceEligibilityPort: ObjectProvider<NotificationPreferenceEligibilityPort>,
    private val pushEligibilityPort: PushNotificationEligibilityPort,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun notifyScopeGranted(event: OrganizerScopeGrantedEvent) {
        val user = userRepository.findById(event.userId).orElse(null) ?: return
        val email = user.email?.trim().orEmpty()
        if (email.isBlank()) {
            log.debug("organizer_scope_granted_skipped reason=no_email userId={}", event.userId)
            return
        }
        if (
            !reminderMarkService.tryClaimReminderMark(
                intent = NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                eventId = event.scopeId,
                userId = event.userId,
                reminderWindow = NotificationReminderWindow.ONCE,
            )
        ) {
            return
        }

        val roleLabel = roleLabelFor(event.scopeKind)
        val scopeName = event.scopeName.trim().ifEmpty { "HatCast" }
        val subject = "Tu es $roleLabel sur HatCast"
        val body =
            "Tu viens d'être nommé·e $roleLabel pour $scopeName. " +
                "Active les alertes organisateur qui t'intéressent dans Mon compte → Notifications."
        val payload =
            NotificationPayload(
                title = "Nouveau rôle orga",
                body = body,
                url = "/compte/notifications",
            )

        emailSender.sendEmail(
            userId = event.userId,
            email = email,
            subject = subject,
            payload = payload,
            intent = NotificationIntent.ORGANIZER_SCOPE_GRANTED,
            eventId = event.scopeId,
        )

        if (!isPushAllowed(event.userId)) {
            return
        }
        try {
            pushSender.sendPush(
                event.userId,
                payload,
                NotificationIntent.ORGANIZER_SCOPE_GRANTED,
                event.scopeId,
            )
        } catch (ex: Exception) {
            log.warn(
                "organizer_scope_granted_push_failed userId={} scopeId={} error={}",
                event.userId,
                event.scopeId,
                ex.message,
                ex,
            )
        }
    }

    private fun isPushAllowed(userId: UUID): Boolean {
        if (!pushEligibilityPort.isPushAllowedForCategory(userId, NotificationCategory.ORG_SCOPE_GRANTED)) {
            return false
        }
        val port = preferenceEligibilityPort.ifAvailable ?: return false
        return port.isAllowed(userId, NotificationCategory.ORG_SCOPE_GRANTED, NotificationChannel.PUSH)
    }

    private fun roleLabelFor(scopeKind: OrganizerScopeKind): String =
        when (scopeKind) {
            OrganizerScopeKind.EVENT -> "organisateur du spectacle"
            OrganizerScopeKind.SEASON -> "organisateur de saison"
            OrganizerScopeKind.TROUPE_ADMIN -> "admin de la troupe"
        }
}
