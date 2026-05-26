package com.hatcast.api.composition

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

interface CompositionNotificationPort {
    fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    )

    fun requestCompositionConfirmation(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    )

    fun requestConfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    )

    fun requestManualAnnouncement(
        eventId: UUID,
        seasonId: UUID,
        intent: String,
        messagePreview: String,
        actorUserId: UUID,
    )
}

@Component
class NoOpCompositionNotificationAdapter : CompositionNotificationPort {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "draft_composition_shared eventId={} seasonId={} actorUserId={}",
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
        log.debug(
            "composition_confirmation_requested eventId={} seasonId={} actorUserId={}",
            eventId,
            seasonId,
            actorUserId,
        )
    }

    override fun requestConfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    ) {
        log.debug(
            "gap_fill_confirmation_requested eventId={} seasonId={} assigneeParticipantIds={} actorUserId={}",
            eventId,
            seasonId,
            assigneeParticipantIds,
            actorUserId,
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
