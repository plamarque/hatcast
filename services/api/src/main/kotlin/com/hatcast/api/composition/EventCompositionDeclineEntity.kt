package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "event_composition_declines")
class EventCompositionDeclineEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "event_id", nullable = false)
    val eventId: UUID,
    @Column(name = "role_key", nullable = false, length = 64)
    val roleKey: String,
    @Column(name = "slot_index", nullable = false)
    val slotIndex: Int,
    @Column(name = "season_participant_id")
    val seasonParticipantId: UUID?,
    @Column(name = "event_participant_id")
    val eventParticipantId: UUID?,
    @Column(name = "declined_by_user_id", nullable = false)
    val declinedByUserId: UUID,
    @Column(name = "declined_at", nullable = false)
    val declinedAt: Instant,
    @Column(length = 500)
    val note: String?,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)
