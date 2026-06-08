package com.hatcast.api.composition

import org.slf4j.LoggerFactory
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

    fun notifyTeamValidatedFyi(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    )

    fun notifyTeamCompleteMember(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID?,
    )

    fun notifyTeamCompleteOrganizer(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID?,
    )

    fun notifyAssigneeDeclined(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        assigneeDisplayName: String,
        roleKey: String,
        slotIndex: Int,
    )

    fun notifyAssigneeRemoved(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
        formerAssigneeParticipantId: UUID,
        roleKey: String,
        slotIndex: Int,
    )

    fun notifyReconfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    )
}

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

    override fun notifyTeamValidatedFyi(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "team_validated_fyi eventId={} seasonId={} actorUserId={}",
            eventId,
            seasonId,
            actorUserId,
        )
    }

    override fun notifyTeamCompleteMember(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID?,
    ) {
        log.debug(
            "team_complete_member eventId={} seasonId={} actorUserId={}",
            eventId,
            seasonId,
            actorUserId,
        )
    }

    override fun notifyTeamCompleteOrganizer(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID?,
    ) {
        log.debug(
            "team_complete_organizer eventId={} seasonId={} troupeId={} actorUserId={}",
            eventId,
            seasonId,
            troupeId,
            actorUserId,
        )
    }

    override fun notifyAssigneeDeclined(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        assigneeDisplayName: String,
        roleKey: String,
        slotIndex: Int,
    ) {
        log.debug(
            "assignee_declined eventId={} seasonId={} troupeId={} actorUserId={} roleKey={} slotIndex={}",
            eventId,
            seasonId,
            troupeId,
            actorUserId,
            roleKey,
            slotIndex,
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
        log.debug(
            "assignee_removed eventId={} seasonId={} formerAssigneeParticipantId={} roleKey={} slotIndex={} actorUserId={}",
            eventId,
            seasonId,
            formerAssigneeParticipantId,
            roleKey,
            slotIndex,
            actorUserId,
        )
    }

    override fun notifyReconfirmationForAssignees(
        eventId: UUID,
        seasonId: UUID,
        assigneeParticipantIds: List<UUID>,
        actorUserId: UUID,
    ) {
        log.debug(
            "reconfirmation_requested eventId={} seasonId={} assigneeParticipantIds={} actorUserId={}",
            eventId,
            seasonId,
            assigneeParticipantIds,
            actorUserId,
        )
    }
}
