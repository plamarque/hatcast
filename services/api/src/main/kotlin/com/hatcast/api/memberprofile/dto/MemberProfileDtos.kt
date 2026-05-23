package com.hatcast.api.memberprofile.dto

import jakarta.validation.constraints.NotNull
import java.util.UUID

data class PreferredRolesResponseDto(
    val preferredRoleKeys: List<String>,
)

data class UpdatePreferredRolesRequest(
    @field:NotNull
    val preferredRoleKeys: List<String>,
)

data class MemberProfileStatDto(
    val count: Int,
    val percent: Int,
    val tooltip: String? = null,
)

data class MemberProfileStatsDto(
    val availabilities: MemberProfileStatDto,
    val selections: MemberProfileStatDto,
    val declines: MemberProfileStatDto,
)

data class MemberProfileChartBlockDto(
    val eventId: UUID,
    val status: String,
    val roleKey: String? = null,
)

data class MemberProfileMonthDto(
    val monthKey: String,
    val blocks: List<MemberProfileChartBlockDto>,
)

data class FavoriteRoleCountDto(
    val roleKey: String,
    val count: Int,
)

data class MemberProfileSummaryDto(
    val userId: UUID,
    val membershipId: UUID,
    val displayName: String,
    val avatarUrl: String?,
    val isSelf: Boolean,
    val stats: MemberProfileStatsDto? = null,
    val monthlyChart: List<MemberProfileMonthDto> = emptyList(),
    val favoriteRoleCounts: List<FavoriteRoleCountDto> = emptyList(),
    val preferredRoleKeys: List<String>? = null,
)
