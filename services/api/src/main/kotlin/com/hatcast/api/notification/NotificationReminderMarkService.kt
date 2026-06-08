package com.hatcast.api.notification

import com.hatcast.api.event.EventRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Service
class NotificationReminderMarkService(
    private val repository: NotificationReminderMarkRepository,
    private val eventRepository: EventRepository,
) {
    fun findEventTroupeId(eventId: UUID): UUID? =
        eventRepository.findById(eventId).orElse(null)?.season?.troupe?.id
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

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun tryClaimPeriodicReminderMark(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        civilDate: LocalDate,
    ): Boolean {
        if (repository.existsByIntentAndEventIdAndUserIdAndReminderCivilDate(intent, eventId, userId, civilDate)) {
            return false
        }
        return try {
            repository.save(
                NotificationReminderMarkEntity(
                    intent = intent,
                    eventId = eventId,
                    userId = userId,
                    reminderWindow = NotificationReminderWindow.ONCE,
                    reminderCivilDate = civilDate,
                ),
            )
            true
        } catch (_: DataIntegrityViolationException) {
            false
        }
    }

    fun findLatestSentAt(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
    ): Instant? =
        repository
            .findTopByIntentAndEventIdAndUserIdAndReminderCivilDateNotOrderBySentAtDesc(
                intent,
                eventId,
                userId,
                NotificationReminderMarkEntity.LEGACY_CIVIL_DATE,
            )?.sentAt
}
