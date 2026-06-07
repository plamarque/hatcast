package com.hatcast.api.notification

import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

interface NotificationReminderMarkRepository : JpaRepository<NotificationReminderMarkEntity, UUID> {
    fun existsByIntentAndEventIdAndUserIdAndReminderWindow(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        reminderWindow: NotificationReminderWindow,
    ): Boolean

    fun existsByIntentAndEventIdAndUserIdAndReminderCivilDate(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        reminderCivilDate: LocalDate,
    ): Boolean

    fun findTopByIntentAndEventIdAndUserIdAndReminderCivilDateNotOrderBySentAtDesc(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        reminderCivilDate: LocalDate,
    ): NotificationReminderMarkEntity?
}
