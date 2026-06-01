package com.hatcast.api.notification

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface NotificationReminderMarkRepository : JpaRepository<NotificationReminderMarkEntity, UUID> {
    fun existsByIntentAndEventIdAndUserIdAndReminderWindow(
        intent: NotificationIntent,
        eventId: UUID,
        userId: UUID,
        reminderWindow: NotificationReminderWindow,
    ): Boolean
}
