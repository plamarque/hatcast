package com.hatcast.api.audit

import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "audit_events")
class AuditEventEntity(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "occurred_at", nullable = false)
    val occurredAt: Instant,
    @Column(name = "actor_user_id")
    val actorUserId: UUID? = null,
    @Column(name = "subject_user_id")
    val subjectUserId: UUID? = null,
    @Column(name = "subject_season_participant_id")
    val subjectSeasonParticipantId: UUID? = null,
    @Column(name = "subject_event_participant_id")
    val subjectEventParticipantId: UUID? = null,
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 64)
    val actionType: AuditActionType,
    @Column(name = "troupe_id")
    val troupeId: UUID? = null,
    @Column(name = "season_id")
    val seasonId: UUID? = null,
    @Column(name = "event_id")
    val eventId: UUID? = null,
    @Convert(converter = JsonMapConverter::class)
    @Column(name = "before_json", columnDefinition = "TEXT")
    val beforeJson: Map<String, Any?>? = null,
    @Convert(converter = JsonMapConverter::class)
    @Column(name = "after_json", columnDefinition = "TEXT")
    val afterJson: Map<String, Any?>? = null,
    @Convert(converter = JsonMapConverter::class)
    @Column(name = "metadata_json", columnDefinition = "TEXT")
    val metadataJson: Map<String, Any?>? = null,
    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),
)
