package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.user.MemberGender
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
            val linkedUserIds = recipients.mapNotNull { it.userId }.toSet()
            val genderByUserId =
                if (linkedUserIds.isEmpty()) {
                    emptyMap()
                } else {
                    userRepository
                        .findAllById(linkedUserIds)
                        .associate { it.id to it.gender }
                }
            for (recipient in recipients) {
                deliverToRecipient(context, recipient, event, category, genderByUserId)
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
        genderByUserId: Map<UUID, MemberGender?>,
    ) {
        try {
            if (recipient.userId == null) {
                deliverGuestEmailOnly(context, recipient, event, category)
                return
            }
            val recipientGender = genderByUserId[recipient.userId]
            val payload =
                payloadBuilder.build(
                    intent = context.intent,
                    event = event,
                    recipientName = recipient.displayName,
                    roleKey = context.roleKey,
                    actorDisplayName = context.actorDisplayName,
                    proxyChangeSummary = context.proxyChangeSummary,
                    customMessageBody = context.customMessageBody,
                    recipientGender = recipientGender,
                    eventDetailsChangeSummary = context.eventDetailsChangeSummary,
                    reasonSummary = context.reasonSummary,
                )
            val emailSubject =
                payloadBuilder.buildEmailSubject(context.intent, event, context.proxyChangeSummary)
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

    private fun deliverGuestEmailOnly(
        context: NotificationDispatchContext,
        recipient: NotificationRecipient,
        event: EventEntity,
        category: NotificationCategory,
    ) {
        val email = recipient.email?.trim().orEmpty()
        if (email.isBlank()) {
            return
        }
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
                    recipientGender = null,
                    eventDetailsChangeSummary = context.eventDetailsChangeSummary,
                )
            val emailSubject =
                payloadBuilder.buildEmailSubject(context.intent, event, context.proxyChangeSummary)
            deliverGuestEmail(email, emailSubject, payload, context.intent, context.eventId)
        } catch (ex: Exception) {
            log.error(
                "notification_guest_email_unexpected_error intent={} email={} eventId={} error={}",
                context.intent,
                email,
                context.eventId,
                ex.message,
                ex,
            )
        }
    }

    private fun deliverGuestEmail(
        email: String,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID,
    ) {
        try {
            val result = emailSender.sendEmail(null, email, subject, payload, intent, eventId)
            persistDeliveryLogSafely(intent, null, result, eventId, email)
        } catch (ex: Exception) {
            log.warn(
                "notification_guest_email_unexpected_error intent={} email={} eventId={} channel=EMAIL error={}",
                intent,
                email,
                eventId,
                ex.message,
                ex,
            )
            persistDeliveryLogSafely(
                intent,
                null,
                NotificationDeliveryResult(
                    channel = NotificationChannel.EMAIL,
                    status = NotificationDeliveryStatus.FAILED,
                    errorMessage = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown"),
                ),
                eventId,
                email,
            )
        }
    }

    private fun resolveRecipients(context: NotificationDispatchContext): List<NotificationRecipient> =
        when (context.intent) {
            NotificationIntent.AVAILABILITY_OPENED,
            NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE,
            ->
                recipientResolver.resolveConcernedRosterRecipients(context.seasonId, context.eventId)
            NotificationIntent.MANUAL_AVAILABILITY_NUDGE ->
                recipientResolver.resolveUnknownAvailabilityRecipients(context.seasonId, context.eventId)
            NotificationIntent.AVAILABILITY_PENDING_REMINDER ->
                if (context.recipientUserIds.isNotEmpty()) {
                    recipientsFromExplicitUserIds(context.recipientUserIds)
                } else {
                    recipientResolver.resolveUnknownAvailabilityRecipients(context.seasonId, context.eventId)
                }
            NotificationIntent.COMPOSITION_SHARED ->
                recipientResolver.resolveEventOrganizerRecipients(
                    context.eventId,
                    context.actorUserId,
                )
            NotificationIntent.EVENT_DRAFT_CREATED ->
                if (context.recipientUserIds.isNotEmpty()) {
                    recipientsFromExplicitUserIds(context.recipientUserIds)
                } else {
                    recipientResolver.resolveSeasonOrganizerRecipients(
                        context.seasonId,
                        context.actorUserId,
                    )
                }
            NotificationIntent.SLA_OPEN_AVAILABILITY,
            NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY,
            NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7,
            ->
                if (context.recipientUserIds.isNotEmpty()) {
                    recipientsFromExplicitUserIds(context.recipientUserIds)
                } else {
                    recipientResolver.resolveEventAndSeasonOrganizerRecipients(
                        context.eventId,
                        context.seasonId,
                        context.actorUserId,
                    )
                }
            NotificationIntent.TEAM_COMPLETE,
            NotificationIntent.TEAM_REGRESSED,
            ->
                if (context.recipientUserIds.isNotEmpty()) {
                    recipientsFromExplicitUserIds(context.recipientUserIds)
                } else {
                    recipientResolver.resolveEventOrganizerRecipients(
                        context.eventId,
                        context.actorUserId,
                    )
                }
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
                    recipientsFromExplicitUserIds(context.recipientUserIds)
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
            NotificationIntent.EVENT_DETAILS_CHANGED ->
                recipientResolver.resolveEngagedEventRosterRecipients(context.seasonId, context.eventId)
            NotificationIntent.EVENT_ARCHIVED ->
                recipientResolver.resolveEventArchivedRecipients(context.seasonId, context.eventId)
            NotificationIntent.TEAM_COMPLETE_MEMBER ->
                recipientResolver.resolveTeamCompleteMemberRecipients(context.eventId)
            NotificationIntent.ORGANIZER_SCOPE_GRANTED -> emptyList()
        }

    private fun recipientsFromExplicitUserIds(userIds: List<UUID>): List<NotificationRecipient> {
        if (userIds.isEmpty()) {
            return emptyList()
        }
        val usersById = userRepository.findAllById(userIds.toSet()).associateBy { it.id }
        return userIds.map { userId ->
            val user = usersById[userId]
            NotificationRecipient(
                userId = userId,
                displayName =
                    user
                        ?.displayName
                        ?.trim()
                        .orEmpty()
                        .ifEmpty { user?.email?.substringBefore('@').orEmpty() },
            )
        }
    }

    private fun resolveProxySubjectRecipients(context: NotificationDispatchContext): List<NotificationRecipient> {
        val subjectUserId = context.subjectUserId ?: return emptyList()
        if (context.actorUserId != null && subjectUserId == context.actorUserId) {
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
        userId: UUID?,
        result: NotificationDeliveryResult,
        eventId: UUID,
        recipientEmail: String? = null,
    ) {
        try {
            persistDeliveryLog(intent, userId, result, eventId, recipientEmail)
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
        userId: UUID?,
        result: NotificationDeliveryResult,
        eventId: UUID,
        recipientEmail: String? = null,
    ) {
        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = intent,
                userId = userId,
                recipientEmail = recipientEmail,
                channel = result.channel,
                status = result.status,
                errorMessage = result.errorMessage,
                eventId = eventId,
            ),
        )
    }
}
