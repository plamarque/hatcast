package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Embeddable
data class EventDrawChanceSnapshotId(
    @Column(name = "event_id", nullable = false)
    val eventId: UUID,
    @Column(name = "role_key", nullable = false, length = 64)
    val roleKey: String,
    @Column(name = "participant_id", nullable = false)
    val participantId: UUID,
) : Serializable

@Entity
@Table(name = "event_draw_chance_snapshots")
class EventDrawChanceSnapshotEntity(
    @EmbeddedId
    val id: EventDrawChanceSnapshotId,
    @Column(name = "chance_percent", nullable = false)
    val chancePercent: Int,
    @Column(name = "past_selection_count", nullable = false)
    val pastSelectionCount: Int,
    @Column(name = "required_count", nullable = false)
    val requiredCount: Int,
    @Column(name = "candidate_count", nullable = false)
    val candidateCount: Int,
    @Column(name = "snapshotted_at", nullable = false)
    val snapshottedAt: Instant,
)
