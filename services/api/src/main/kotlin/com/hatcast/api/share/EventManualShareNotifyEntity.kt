package com.hatcast.api.share

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import java.util.UUID

@Embeddable
data class EventManualShareNotifyId(
    @Column(name = "event_id")
    val eventId: UUID = UUID(0, 0),
    @Column(name = "intent")
    val intent: String = "",
) : Serializable

@Entity
@Table(name = "event_manual_share_notify")
class EventManualShareNotifyEntity(
    @EmbeddedId
    val id: EventManualShareNotifyId,
    @Column(name = "last_sent_at", nullable = false)
    var lastSentAt: Instant,
    @Column(name = "last_actor_user_id", nullable = false)
    var lastActorUserId: UUID,
)
