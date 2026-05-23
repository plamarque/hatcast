package com.hatcast.api.troupe.dto

import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import java.time.Instant
import java.util.UUID

data class MembershipSummaryDto(
    val id: UUID,
    val displayName: String,
    val status: TroupeMembershipStatus,
    val createdAt: Instant,
    val updatedAt: Instant,
) {
    companion object {
        fun from(entity: TroupeMembershipEntity): MembershipSummaryDto =
            MembershipSummaryDto(
                id = entity.id,
                displayName = entity.displayName,
                status = entity.status,
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
