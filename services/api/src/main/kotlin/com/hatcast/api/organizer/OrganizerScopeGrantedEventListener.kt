package com.hatcast.api.organizer

import com.hatcast.api.notification.OrganizerScopeGrantedNotificationService
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class OrganizerScopeGrantedEventListener(
    private val scopeGrantedNotificationService: OrganizerScopeGrantedNotificationService,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onScopeGranted(event: OrganizerScopeGrantedEvent) {
        scopeGrantedNotificationService.notifyScopeGranted(event)
    }
}
