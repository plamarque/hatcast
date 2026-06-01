package com.hatcast.api.notification

import com.hatcast.api.composition.CompositionNotificationPort
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CompositionWorkflowNotificationAdapter(
    private val dispatcher: NotificationDispatcher,
    private val recipientResolver: NotificationRecipientResolver,
    private val reminderMarkService: NotificationReminderMarkService,
) : CompositionNotificationPort {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "draft_composition_shared eventId={} seasonId={} actorUserId={} member_dispatch=skipped",
            eventId,
            seasonId,
            actorUserId,
        )
    }

    override fun requestCompositionConfirmation(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.CONFIRMATION_REQUEST,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = null,
                actorUserId = actorUserId,
            ),
        )
    }

    override fun requestConfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    ) {
        if (assigneeParticipantIds.isEmpty()) {
            return
        }
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.CONFIRMATION_REQUEST,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = null,
                actorUserId = actorUserId,
                assigneeParticipantIds = assigneeParticipantIds,
            ),
        )
    }

    override fun requestManualAnnouncement(
        eventId: UUID,
        seasonId: UUID,
        intent: String,
        messagePreview: String,
        actorUserId: UUID,
    ) {
        if (intent == "availability_nudge") {
            dispatcher.dispatch(
                NotificationDispatchContext(
                    intent = NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                    eventId = eventId,
                    seasonId = seasonId,
                    troupeId = null,
                    actorUserId = actorUserId,
                    customMessageBody = messagePreview,
                ),
            )
            return
        }
        log.debug(
            "manual_announcement_requested eventId={} seasonId={} intent={} messagePreviewLength={} actorUserId={}",
            eventId,
            seasonId,
            intent,
            messagePreview.length,
            actorUserId,
        )
    }

    override fun notifyTeamValidatedFyi(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.TEAM_VALIDATED_FYI,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = null,
                actorUserId = actorUserId,
            ),
        )
    }

    override fun notifyAssigneeRemoved(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
        formerAssigneeParticipantId: UUID,
        roleKey: String,
        slotIndex: Int,
    ) {
        val userId =
            recipientResolver
                .resolveAssigneeRecipients(listOf(formerAssigneeParticipantId))
                .firstOrNull()
                ?.userId ?: return
        if (!reminderMarkService.tryClaimReminderMark(
                intent = NotificationIntent.REMOVED_FROM_COMPOSITION,
                eventId = eventId,
                userId = userId,
                reminderWindow = NotificationReminderWindow.ONCE,
            )
        ) {
            return
        }
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.REMOVED_FROM_COMPOSITION,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = null,
                actorUserId = actorUserId,
                assigneeParticipantIds = listOf(formerAssigneeParticipantId),
                roleKey = roleKey,
                slotIndex = slotIndex,
            ),
        )
    }

    override fun notifyReconfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    ) {
        if (assigneeParticipantIds.isEmpty()) {
            return
        }
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.RECONFIRMATION_REQUEST,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = null,
                actorUserId = actorUserId,
                assigneeParticipantIds = assigneeParticipantIds,
            ),
        )
    }
}
