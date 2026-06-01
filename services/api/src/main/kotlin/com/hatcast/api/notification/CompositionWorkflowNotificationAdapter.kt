package com.hatcast.api.notification

import com.hatcast.api.composition.CompositionNotificationPort
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CompositionWorkflowNotificationAdapter(
    private val dispatcher: NotificationDispatcher,
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
        log.debug(
            "manual_announcement_requested eventId={} seasonId={} intent={} messagePreviewLength={} actorUserId={}",
            eventId,
            seasonId,
            intent,
            messagePreview.length,
            actorUserId,
        )
    }
}
