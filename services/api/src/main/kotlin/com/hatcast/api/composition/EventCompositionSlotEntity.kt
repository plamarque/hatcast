package com.hatcast.api.composition

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class SlotParticipationStatus {
    PENDING,
    CONFIRMED,
    DECLINED,
}

@Entity
@Table(name = "event_composition_slots")
class EventCompositionSlotEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "event_id", nullable = false)
    val eventId: UUID,
    @Column(name = "role_key", nullable = false, length = 64)
    val roleKey: String,
    @Column(name = "slot_index", nullable = false)
    val slotIndex: Int,
    @Column(name = "season_participant_id")
    var seasonParticipantId: UUID? = null,
    @Column(name = "event_participant_id")
    var eventParticipantId: UUID? = null,
    @Enumerated(EnumType.STRING)
    @Column(name = "participation_status", nullable = false, length = 16)
    var participationStatus: SlotParticipationStatus = SlotParticipationStatus.PENDING,
    @Column(nullable = false)
    var waived: Boolean = false,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
