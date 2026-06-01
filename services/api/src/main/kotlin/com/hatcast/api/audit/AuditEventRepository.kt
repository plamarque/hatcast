package com.hatcast.api.audit

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface AuditEventRepository : JpaRepository<AuditEventEntity, UUID> {
    fun findByEventIdOrderByOccurredAtDesc(eventId: UUID): List<AuditEventEntity>

    fun findBySeasonIdOrderByOccurredAtDesc(seasonId: UUID): List<AuditEventEntity>

    fun findByTroupeIdOrderByOccurredAtDesc(troupeId: UUID): List<AuditEventEntity>
}
