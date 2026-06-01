package com.hatcast.api.audit.dto

import com.hatcast.api.audit.AuditActionType
import java.time.Instant
import java.util.UUID

data class AuditIdentityDto(
    val userId: UUID? = null,
    val seasonParticipantId: UUID? = null,
    val eventParticipantId: UUID? = null,
    val displayName: String,
    val email: String? = null,
    val avatarUrl: String? = null,
)

data class AuditScopeDto(
    val troupeId: UUID?,
    val seasonId: UUID?,
    val eventId: UUID?,
    val seasonTitle: String? = null,
    val eventTitle: String? = null,
)

data class AuditEventRowDto(
    val id: UUID,
    val occurredAt: Instant,
    val actionType: AuditActionType,
    val actionLabel: String,
    val actor: AuditIdentityDto?,
    val subject: AuditIdentityDto?,
    val scope: AuditScopeDto,
    val before: Map<String, Any?>?,
    val after: Map<String, Any?>?,
    val metadata: Map<String, Any?>?,
    /** Season participant display names referenced in draw assignment snapshots (UI expansion). */
    val relatedParticipantLabels: Map<String, String>? = null,
)

data class PagedAuditEventsResponse(
    val content: List<AuditEventRowDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)
