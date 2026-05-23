package com.hatcast.api.troupe.dto

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
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
)

data class TroupeMemberAdminDto(
    val id: UUID,
    val userId: UUID,
    val email: String?,
    val displayName: String,
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

@JsonDeserialize(using = UpdateTroupeMemberRequestDeserializer::class)
@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateTroupeMemberRequest(
    val displayName: JsonNullable<String> = JsonNullable.undefined(),
    val status: JsonNullable<TroupeMembershipStatus> = JsonNullable.undefined(),
    val baselineRole: JsonNullable<TroupeBaselineRole> = JsonNullable.undefined(),
)
