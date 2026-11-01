package com.hatcast.api.notification

import com.hatcast.api.user.UserEntity
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "advent_reminder_devices")
class AdventReminderDeviceEntity(
    @Id val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id", nullable = false) var user: UserEntity,
    @Column(nullable = false, length = 2048, unique = true) var endpoint: String,
    @Column(name = "p256dh_key", nullable = false, length = 512) var p256dhKey: String,
    @Column(name = "auth_key", nullable = false, length = 512) var authKey: String,
    @Column(name = "user_agent", length = 512) var userAgent: String? = null,
    @Column(name = "created_at", nullable = false) val createdAt: Instant = Instant.now(),
    @Column(name = "last_used_at") var lastUsedAt: Instant? = null,
)

interface AdventReminderDeviceRepository : JpaRepository<AdventReminderDeviceEntity, UUID> {
    fun findByUserId(userId: UUID): List<AdventReminderDeviceEntity>
    fun findByEndpoint(endpoint: String): AdventReminderDeviceEntity?
    fun existsByUserIdAndEndpoint(userId: UUID, endpoint: String): Boolean
}
