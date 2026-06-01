package com.hatcast.api.event

import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class EventNotificationEventListener(
    private val notificationPort: EventNotificationPort,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onAvailabilityOpened(event: EventAvailabilityOpenedEvent) {
        notificationPort.publishAvailabilityOpened(
            event.eventId,
            event.seasonId,
            event.troupeId,
            event.actorUserId,
        )
    }
}
