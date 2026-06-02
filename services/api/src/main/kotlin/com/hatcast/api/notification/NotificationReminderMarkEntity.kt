package com.hatcast.api.notification

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
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
)
