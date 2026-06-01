package com.hatcast.api.notification

import com.hatcast.api.event.EventRepository
import com.hatcast.api.user.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus

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

            val category = context.intent.toCategory()
            for (recipient in recipients) {
                if (!isCategoryAllowed(recipient.userId, category)) {
                    continue
                }
                val payload = payloadBuilder.build(context.intent, event, recipient.displayName)
                val emailSubject = payloadBuilder.buildEmailSubject(context.intent, event)
                deliverPush(recipient.userId, payload, context.intent, context.eventId)
                deliverEmail(recipient.userId, emailSubject, payload, context.intent, context.eventId)
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

    private fun resolveRecipients(context: NotificationDispatchContext): List<NotificationRecipient> =
        when (context.intent) {
            NotificationIntent.AVAILABILITY_OPENED ->
                recipientResolver.resolveConcernedRosterRecipients(context.seasonId, context.eventId)
            NotificationIntent.CONFIRMATION_REQUEST ->
                if (context.assigneeParticipantIds.isNotEmpty()) {
                    recipientResolver.resolveAssigneeRecipients(context.assigneeParticipantIds)
                } else {
                    recipientResolver.resolveValidatedAssigneeRecipients(context.eventId)
                }
        }

    private fun isCategoryAllowed(
        userId: java.util.UUID,
        category: NotificationCategory,
    ): Boolean {
        val port = preferenceEligibilityPort.ifAvailable ?: return true
        return port.isCategoryEnabled(userId, category)
    }

    private fun deliverPush(
        userId: java.util.UUID,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: java.util.UUID,
    ) {
        if (!pushEligibilityPort.isPushEnabled(userId)) {
            return
        }
        val result = pushSender.sendPush(userId, payload, intent, eventId)
        if (result.status != NotificationDeliveryStatus.SKIPPED) {
            persistDeliveryLog(intent, userId, result, eventId)
        }
    }

    private fun deliverEmail(
        userId: java.util.UUID,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: java.util.UUID,
    ) {
        val user = userRepository.findById(userId).orElse(null) ?: return
        val email = user.email?.trim().orEmpty()
        if (email.isBlank()) {
            return
        }
        val result = emailSender.sendEmail(userId, email, subject, payload, intent, eventId)
        if (result.status != NotificationDeliveryStatus.SKIPPED) {
            persistDeliveryLog(intent, userId, result, eventId)
        }
    }

    private fun persistDeliveryLog(
        intent: NotificationIntent,
        userId: java.util.UUID,
        result: NotificationDeliveryResult,
        eventId: java.util.UUID,
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
