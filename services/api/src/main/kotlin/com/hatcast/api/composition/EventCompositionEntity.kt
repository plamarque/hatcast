package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "event_compositions")
class EventCompositionEntity(
    @Id
    @Column(name = "event_id")
    val eventId: UUID,
    @Column(name = "validated_at")
    var validatedAt: Instant? = null,
    @Column(name = "published_at")
    var publishedAt: Instant? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
