package com.hatcast.api.notification

import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class NotificationReminderMarkService(
    private val repository: NotificationReminderMarkRepository,
) {
    /**
     * Claims a deduplication mark for a notification.
     * Returns true if the mark was newly created (should dispatch), false if already exists (skip).
     * REQUIRES_NEW ensures the mark is committed independently of any outer transaction,
     * preventing rollbacks from undoing the claim.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun tryClaimReminderMark(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        reminderWindow: NotificationReminderWindow,
    ): Boolean {
        if (repository.existsByIntentAndEventIdAndUserIdAndReminderWindow(intent, eventId, userId, reminderWindow)) {
            return false
        }
        return try {
            repository.save(
                NotificationReminderMarkEntity(
                    intent = intent,
                    eventId = eventId,
                    userId = userId,
                    reminderWindow = reminderWindow,
                ),
            )
            true
        } catch (_: DataIntegrityViolationException) {
            false
        }
    }
}
