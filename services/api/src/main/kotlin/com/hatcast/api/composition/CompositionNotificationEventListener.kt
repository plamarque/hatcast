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
}
