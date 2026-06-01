package com.hatcast.api.share

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "event_manual_availability_nudges")
class EventManualAvailabilityNudgeEntity(
    @Id
    @Column(name = "event_id")
    val eventId: UUID,
    @Column(name = "last_sent_at", nullable = false)
    var lastSentAt: Instant,
    @Column(name = "last_actor_user_id", nullable = false)
    var lastActorUserId: UUID,
)
