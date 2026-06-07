package com.hatcast.api.notification

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "notification_reminder_marks")
class NotificationReminderMarkEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    val intent: NotificationIntent,
    @Column(name = "event_id", nullable = false)
    val eventId: UUID,
    @Column(name = "user_id", nullable = false)
    val userId: UUID,
    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_window", nullable = false, length = 16)
    val reminderWindow: NotificationReminderWindow,
    @Column(name = "sent_at", nullable = false)
    val sentAt: Instant = Instant.now(),
    @Column(name = "reminder_civil_date", nullable = false)
    val reminderCivilDate: LocalDate = LEGACY_CIVIL_DATE,
) {
    companion object {
        /** Sentinel for one-shot / window marks (J-7, J-1, ONCE) — not a periodic cadence row. */
        val LEGACY_CIVIL_DATE: LocalDate = LocalDate.of(1970, 1, 1)
    }
}
