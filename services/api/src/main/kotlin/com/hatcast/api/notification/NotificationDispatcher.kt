package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.user.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class NotificationDispatcher(
    private val recipientResolver: NotificationRecipientResolver,
    private val payloadBuilder: NotificationPayloadBuilder,
    private val pushSender: WebPushNotificationSender,
    private val emailSender: EmailNotificationSender,
    private val pushEligibilityPort: PushNotificationEligibilityPort,
    private val preferenceEligibilityPort: ObjectProvider<NotificationPreferenceEligibilityPort>,
    private val userRepository: UserRepository,
    private val eventRepository: EventRepository,
    private val deliveryLogRepository: NotificationDeliveryLogRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    fun dispatch(context: NotificationDispatchContext) {
        try {
            val event =
                eventRepository.findById(context.eventId).orElseThrow {
                    ResponseStatusException(HttpStatus.NOT_FOUND, "Événement inconnu")
                }
            val recipients = resolveRecipients(context)
            if (recipients.isEmpty()) {
                log.debug(
                    "notification_dispatch_no_recipients intent={} eventId={}",
                    context.intent,
                    context.eventId,
                )
                return
            }

            val category = context.intent.toCategory(context.reminderWindow)
            for (recipient in recipients) {
                deliverToRecipient(context, recipient, event, category)
            }
        } catch (ex: Exception) {
            log.error(
                "notification_dispatch_unexpected_error intent={} eventId={} error={}",
                context.intent,
                context.eventId,
                ex.message,
                ex,
            )
        }
    }

    private fun deliverToRecipient(
        context: NotificationDispatchContext,
        recipient: NotificationRecipient,
        event: EventEntity,
        category: NotificationCategory,
    ) {
        try {
            val payload =
                payloadBuilder.build(
                    intent = context.intent,
                    event = event,
                    recipientName = recipient.displayName,
                    roleKey = context.roleKey,
                    actorDisplayName = context.actorDisplayName,
                    proxyChangeSummary = context.proxyChangeSummary,
                    customMessageBody = context.customMessageBody,
                )
            val emailSubject = payloadBuilder.buildEmailSubject(context.intent, event)
            deliverPush(recipient.userId, category, payload, context.intent, context.eventId)
            deliverEmail(recipient.userId, category, emailSubject, payload, context.intent, context.eventId)
        } catch (ex: Exception) {
            log.error(
                "notification_recipient_unexpected_error intent={} userId={} eventId={} error={}",
                context.intent,
                recipient.userId,
                context.eventId,
                ex.message,
                ex,
            )
        }
    }

    private fun resolveRecipients(context: NotificationDispatchContext): List<NotificationRecipient> =
        when (context.intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                recipientResolver.resolveConcernedRosterRecipients(context.seasonId, context.eventId)
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE ->
                recipientResolver.resolveUnknownAvailabilityRecipients(context.seasonId, context.eventId)
            NotificationIntent.CONFIRMATION_REQUEST ->
                if (context.assigneeParticipantIds.isNotEmpty()) {
                    recipientResolver.resolveAssigneeRecipients(context.assigneeParticipantIds)
                } else {
                    recipientResolver.resolveValidatedAssigneeRecipients(context.eventId)
                }
            NotificationIntent.TEAM_VALIDATED_FYI ->
                recipientResolver.resolveNonAssignedRosterRecipients(context.seasonId, context.eventId)
            NotificationIntent.ASSIGNEE_PRESENCE_REMINDER ->
                if (context.recipientUserIds.isNotEmpty()) {
                    context.recipientUserIds.map { userId ->
                        NotificationRecipient(userId = userId, displayName = "")
                    }
                } else {
                    recipientResolver.resolveConfirmedAssigneeRecipients(context.eventId)
                }
            NotificationIntent.REMOVED_FROM_COMPOSITION ->
                if (context.assigneeParticipantIds.isNotEmpty()) {
                    recipientResolver.resolveAssigneeRecipients(context.assigneeParticipantIds)
                } else {
                    emptyList()
                }
            NotificationIntent.RECONFIRMATION_REQUEST ->
                recipientResolver.resolveAssigneeRecipients(context.assigneeParticipantIds)
            NotificationIntent.PROXY_AVAILABILITY_RECORDED,
            NotificationIntent.PROXY_CONFIRMATION_RECORDED,
            -> resolveProxySubjectRecipients(context)
        }

    private fun resolveProxySubjectRecipients(context: NotificationDispatchContext): List<NotificationRecipient> {
        val subjectUserId = context.subjectUserId ?: return emptyList()
        if (subjectUserId == context.actorUserId) {
            return emptyList()
        }
        return recipientResolver.resolveSubjectRecipient(subjectUserId)
    }

    private fun isChannelAllowed(
        userId: UUID,
        category: NotificationCategory,
        channel: NotificationChannel,
    ): Boolean {
        val port = preferenceEligibilityPort.ifAvailable ?: return true
        return port.isAllowed(userId, category, channel)
    }

    private fun deliverPush(
        userId: UUID,
        category: NotificationCategory,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID,
    ) {
        if (!pushEligibilityPort.isPushAllowedForCategory(userId, category)) {
            persistDeliveryLogSafely(
                intent,
                userId,
                NotificationDeliveryResult(
                    channel = NotificationChannel.PUSH,
                    status = NotificationDeliveryStatus.SKIPPED,
                    errorMessage = "push_not_allowed",
                ),
                eventId,
            )
            return
        }
        try {
            val result = pushSender.sendPush(userId, payload, intent, eventId)
            persistDeliveryLogSafely(intent, userId, result, eventId)
        } catch (ex: Exception) {
            log.warn(
                "notification_push_unexpected_error intent={} userId={} eventId={} channel=PUSH error={}",
                intent,
                userId,
                eventId,
                ex.message,
                ex,
            )
            persistDeliveryLogSafely(
                intent,
                userId,
                NotificationDeliveryResult(
                    channel = NotificationChannel.PUSH,
                    status = NotificationDeliveryStatus.FAILED,
                    errorMessage = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown"),
                ),
                eventId,
            )
        }
    }

    private fun deliverEmail(
        userId: UUID,
        category: NotificationCategory,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID,
    ) {
        if (!isChannelAllowed(userId, category, NotificationChannel.EMAIL)) {
            persistDeliveryLogSafely(
                intent,
                userId,
                NotificationDeliveryResult(
                    channel = NotificationChannel.EMAIL,
                    status = NotificationDeliveryStatus.SKIPPED,
                    errorMessage = "email_preference_disabled",
                ),
                eventId,
            )
            return
        }
        val user = userRepository.findById(userId).orElse(null)
        if (user == null) {
            return
        }
        val email = user.email?.trim().orEmpty()
        if (email.isBlank()) {
            persistDeliveryLogSafely(
                intent,
                userId,
                NotificationDeliveryResult(
                    channel = NotificationChannel.EMAIL,
                    status = NotificationDeliveryStatus.SKIPPED,
                    errorMessage = "missing_email",
                ),
                eventId,
            )
            return
        }
        try {
            val result = emailSender.sendEmail(userId, email, subject, payload, intent, eventId)
            persistDeliveryLogSafely(intent, userId, result, eventId)
        } catch (ex: Exception) {
            log.warn(
                "notification_email_unexpected_error intent={} userId={} eventId={} channel=EMAIL error={}",
                intent,
                userId,
                eventId,
                ex.message,
                ex,
            )
            persistDeliveryLogSafely(
                intent,
                userId,
                NotificationDeliveryResult(
                    channel = NotificationChannel.EMAIL,
                    status = NotificationDeliveryStatus.FAILED,
                    errorMessage = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown"),
                ),
                eventId,
            )
        }
    }

    private fun persistDeliveryLogSafely(
        intent: NotificationIntent,
        userId: UUID,
        result: NotificationDeliveryResult,
        eventId: UUID,
    ) {
        try {
            persistDeliveryLog(intent, userId, result, eventId)
        } catch (ex: Exception) {
            log.error(
                "notification_delivery_log_failed intent={} userId={} eventId={} channel={} status={} error={}",
                intent,
                userId,
                eventId,
                result.channel,
                result.status,
                ex.message,
                ex,
            )
        }
    }

    private fun persistDeliveryLog(
        intent: NotificationIntent,
        userId: UUID,
        result: NotificationDeliveryResult,
        eventId: UUID,
    ) {
        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = intent,
                userId = userId,
                channel = result.channel,
                status = result.status,
                errorMessage = result.errorMessage,
                eventId = eventId,
            ),
        )
    }
}
