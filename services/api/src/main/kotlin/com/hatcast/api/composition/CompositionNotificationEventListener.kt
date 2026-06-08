package com.hatcast.api.composition

import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class CompositionNotificationEventListener(
    private val notificationPort: CompositionNotificationPort,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onDraftCompositionShared(event: DraftCompositionSharedEvent) {
        notificationPort.publishDraftCompositionShared(
            event.eventId,
            event.seasonId,
            event.actorUserId,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onConfirmationRequested(event: CompositionConfirmationRequestedEvent) {
        if (event.assigneeParticipantIds.isEmpty()) {
            notificationPort.requestCompositionConfirmation(
                event.eventId,
                event.seasonId,
                event.actorUserId,
            )
        } else {
            notificationPort.requestConfirmationForAssignees(
                event.eventId,
                event.seasonId,
                event.assigneeParticipantIds,
                event.actorUserId,
            )
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onTeamValidatedFyiRequested(event: TeamValidatedFyiRequestedEvent) {
        notificationPort.notifyTeamValidatedFyi(
            event.eventId,
            event.seasonId,
            event.actorUserId,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onTeamCompleteMemberRequested(event: TeamCompleteMemberRequestedEvent) {
        notificationPort.notifyTeamCompleteMember(
            event.eventId,
            event.seasonId,
            event.actorUserId,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onTeamCompleteOrganizerRequested(event: TeamCompleteOrganizerRequestedEvent) {
        notificationPort.notifyTeamCompleteOrganizer(
            event.eventId,
            event.seasonId,
            event.troupeId,
            event.actorUserId,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onAssigneeDeclined(event: AssigneeDeclinedEvent) {
        notificationPort.notifyAssigneeDeclined(
            event.eventId,
            event.seasonId,
            event.troupeId,
            event.actorUserId,
            event.assigneeDisplayName,
            event.roleKey,
            event.slotIndex,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onAssigneeRemoved(event: CompositionAssigneeRemovedEvent) {
        notificationPort.notifyAssigneeRemoved(
            event.eventId,
            event.seasonId,
            event.actorUserId,
            event.formerAssigneeParticipantId,
            event.roleKey,
            event.slotIndex,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onReconfirmationRequested(event: CompositionReconfirmationRequestedEvent) {
        notificationPort.notifyReconfirmationForAssignees(
            event.eventId,
            event.seasonId,
            event.assigneeParticipantIds,
            event.actorUserId,
        )
    }
}
