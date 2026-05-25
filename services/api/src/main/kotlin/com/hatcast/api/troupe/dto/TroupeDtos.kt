package com.hatcast.api.troupe.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.hatcast.api.avatar.AvatarService
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.openapitools.jackson.nullable.JsonNullable
import java.time.Instant
import java.util.UUID

data class MembershipSummaryDto(
    val id: UUID,
    val displayName: String,
    val status: TroupeMembershipStatus,
    val baselineRole: TroupeBaselineRole,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(entity: TroupeMembershipEntity): MembershipSummaryDto =
            MembershipSummaryDto(
                id = entity.id,
                displayName = entity.displayName,
                status = entity.status,
                baselineRole = entity.baselineRole,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
            )
    }
}

data class TroupeListItemDto(
    val id: UUID,
    val name: String,
    val slug: String,
    val membership: MembershipSummaryDto,
    /** Active troupe memberships (`TroupeMembershipStatus.ACTIVE`). */
    val activeMemberCount: Long,
    /**
     * Distinct upcoming events (non-archived event + season, `startsAt >= startOfTodayInclusive()`)
     * in this troupe where the caller is an ACTIVE season and/or event participant — mirrors
     * [com.hatcast.api.agenda.UserAgendaRepository.findUpcomingForUser] eligibility per troupe.
     */
    val upcomingEventCount: Long,
)

data class TroupeMemberAdminDto(
    val id: UUID,
    val userId: UUID,
    val email: String?,
    val displayName: String,
    val avatarUrl: String?,
    val status: TroupeMembershipStatus,
    val baselineRole: TroupeBaselineRole,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(entity: TroupeMembershipEntity): TroupeMemberAdminDto =
            TroupeMemberAdminDto(
                id = entity.id,
                userId = entity.user.id,
                email = entity.user.email,
                displayName = entity.displayName,
                avatarUrl = AvatarService.publicAvatarUrl(entity.user.id, entity.user.avatarUpdatedAt),
                status = entity.status,
                baselineRole = entity.baselineRole,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt,
            )
    }
}

data class PagedTroupeMembersResponse(
    val content: List<TroupeMemberAdminDto>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddTroupeMemberRequest(
    @field:NotBlank
    val email: String,
    @field:Size(max = 255)
    val displayName: String? = null,
    val baselineRole: TroupeBaselineRole? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateMyMembershipRequest(
    @field:NotBlank(message = "Le nom affiché ne peut pas être vide.")
    @field:Size(max = 255)
    val displayName: String,
)

@JsonDeserialize(using = UpdateTroupeMemberRequestDeserializer::class)
@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateTroupeMemberRequest(
    val displayName: JsonNullable<String> = JsonNullable.undefined(),
    val status: JsonNullable<TroupeMembershipStatus> = JsonNullable.undefined(),
    val baselineRole: JsonNullable<TroupeBaselineRole> = JsonNullable.undefined(),
)
