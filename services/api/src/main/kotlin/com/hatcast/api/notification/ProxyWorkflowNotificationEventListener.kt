package com.hatcast.api.notification

import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class ProxyWorkflowNotificationEventListener(
    private val notificationPort: ProxyNotificationPort,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onProxyAvailabilityRecorded(event: ProxyAvailabilityRecordedEvent) {
        notificationPort.notifyProxyAvailabilityRecorded(
            eventId = event.eventId,
            seasonId = event.seasonId,
            troupeId = event.troupeId,
            actorUserId = event.actorUserId,
            subjectUserId = event.subjectUserId,
            change = event.change,
        )
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onProxyParticipationRecorded(event: ProxyParticipationRecordedEvent) {
        notificationPort.notifyProxyParticipationRecorded(
            eventId = event.eventId,
            seasonId = event.seasonId,
            troupeId = event.troupeId,
            actorUserId = event.actorUserId,
            subjectUserId = event.subjectUserId,
            roleKey = event.roleKey,
            participationStatus = event.participationStatus,
            beforeParticipationStatus = event.beforeParticipationStatus,
        )
    }
}
