package com.hatcast.api.availability

import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.user.UserEntity
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class StoredAvailabilityStatus {
    AVAILABLE,
    UNAVAILABLE,
}

@Entity
@Table(name = "event_availability")
class EventAvailabilityEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    var event: EventEntity,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: UserEntity? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_participant_id")
    var seasonParticipant: SeasonParticipantEntity? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_participant_id")
    var eventParticipant: EventParticipantEntity? = null,
    @Column(name = "recorded_by_user_id")
    var recordedByUserId: UUID? = null,
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
        recordedByUserId: UUID? = null,
        now: Instant = Instant.now(),
    ) : this(
        event = event,
        user = user,
        status = status,
        roleKeys = roleKeys,
        recordedByUserId = recordedByUserId,
        createdAt = now,
        updatedAt = now,
    )

    constructor(
        event: EventEntity,
        seasonParticipant: SeasonParticipantEntity,
        status: StoredAvailabilityStatus,
        roleKeys: List<String> = emptyList(),
        recordedByUserId: UUID,
        now: Instant = Instant.now(),
    ) : this(
        event = event,
        seasonParticipant = seasonParticipant,
        status = status,
        roleKeys = roleKeys,
        recordedByUserId = recordedByUserId,
        createdAt = now,
        updatedAt = now,
    )

    constructor(
        event: EventEntity,
        eventParticipant: EventParticipantEntity,
        status: StoredAvailabilityStatus,
        roleKeys: List<String> = emptyList(),
        recordedByUserId: UUID,
        now: Instant = Instant.now(),
    ) : this(
        event = event,
        eventParticipant = eventParticipant,
        status = status,
        roleKeys = roleKeys,
        recordedByUserId = recordedByUserId,
        createdAt = now,
        updatedAt = now,
    )
}
