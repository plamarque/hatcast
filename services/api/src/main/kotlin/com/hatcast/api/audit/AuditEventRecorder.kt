package com.hatcast.api.audit

import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

data class AuditRecordRequest(
    val actionType: AuditActionType,
    val actorUserId: UUID?,
    val subjectUserId: UUID? = null,
    val subjectSeasonParticipantId: UUID? = null,
    val subjectEventParticipantId: UUID? = null,
    val troupeId: UUID? = null,
    val seasonId: UUID? = null,
    val eventId: UUID? = null,
    val before: Map<String, Any?>? = null,
    val after: Map<String, Any?>? = null,
    val metadata: Map<String, Any?>? = null,
)

@Service
class AuditEventRecorder(
    private val auditEventRepository: AuditEventRepository,
) {
    fun record(request: AuditRecordRequest) {
        // Ordering-sensitive consumers (for example the post-unlock composition
        // deletion diff) need more precision than a civil-time audit display.
        val now = Instant.now()
        auditEventRepository.save(
            AuditEventEntity(
                occurredAt = now,
                actorUserId = request.actorUserId,
                subjectUserId = request.subjectUserId,
                subjectSeasonParticipantId = request.subjectSeasonParticipantId,
                subjectEventParticipantId = request.subjectEventParticipantId,
                actionType = request.actionType,
                troupeId = request.troupeId,
                seasonId = request.seasonId,
                eventId = request.eventId,
                beforeJson = request.before,
                afterJson = request.after,
                metadataJson = request.metadata,
                createdAt = now,
            ),
        )
    }
}
