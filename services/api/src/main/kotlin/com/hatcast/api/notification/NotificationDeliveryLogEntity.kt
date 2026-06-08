package com.hatcast.api.notification

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class NotificationChannel {
    PUSH,
    EMAIL,
}

enum class NotificationDeliveryStatus {
    SENT,
    FAILED,
    SKIPPED,
    PARTIAL,
}

@Entity
@Table(name = "notification_delivery_log")
class NotificationDeliveryLogEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    val intent: NotificationIntent,
    @Column(name = "user_id")
    val userId: UUID?,
    @Column(name = "recipient_email", columnDefinition = "TEXT")
    val recipientEmail: String? = null,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    val channel: NotificationChannel,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    val status: NotificationDeliveryStatus,
    @Column(name = "error_message", columnDefinition = "TEXT")
    val errorMessage: String? = null,
    @Column(name = "event_id")
    val eventId: UUID? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)
