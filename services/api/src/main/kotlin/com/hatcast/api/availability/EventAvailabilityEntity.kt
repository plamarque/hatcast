package com.hatcast.api.availability

import com.hatcast.api.event.EventEntity
import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.MapsId
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

enum class StoredAvailabilityStatus {
    AVAILABLE,
    UNAVAILABLE,
}

@Embeddable
data class EventAvailabilityId(
    @Column(name = "event_id")
    var eventId: UUID? = null,
    @Column(name = "user_id")
    var userId: UUID? = null,
) : Serializable

@Entity
@Table(name = "event_availability")
class EventAvailabilityEntity(
    @EmbeddedId
    var id: EventAvailabilityId = EventAvailabilityId(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("eventId")
    @JoinColumn(name = "event_id", nullable = false)
    var event: EventEntity,
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    var user: UserEntity,
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    var status: StoredAvailabilityStatus,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
    @Convert(converter = RoleKeysJsonConverter::class)
    @Column(name = "role_keys", nullable = false, length = 4096)
    var roleKeys: List<String> = emptyList(),
) {
    constructor(
        event: EventEntity,
        user: UserEntity,
        status: StoredAvailabilityStatus,
        roleKeys: List<String> = emptyList(),
        now: Instant = Instant.now(),
    ) : this(
        id = EventAvailabilityId(event.id, user.id),
        event = event,
        user = user,
        status = status,
        createdAt = now,
        updatedAt = now,
        roleKeys = roleKeys,
    )
}
