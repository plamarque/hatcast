package com.hatcast.api.notification

import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "user_push_subscriptions")
class UserPushSubscriptionEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    var user: UserEntity,
    @Column(nullable = false, length = 2048, unique = true)
    var endpoint: String,
    @Column(name = "p256dh_key", nullable = false, length = 512)
    var p256dhKey: String,
    @Column(name = "auth_key", nullable = false, length = 512)
    var authKey: String,
    @Column(name = "user_agent", length = 512)
    var userAgent: String? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "last_used_at")
    var lastUsedAt: Instant? = null,
)
