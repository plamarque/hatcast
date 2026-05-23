package com.hatcast.api.memberprofile

import com.hatcast.api.memberprofile.dto.FavoriteRoleCountDto
import com.hatcast.api.memberprofile.dto.MemberProfileMonthDto
import com.hatcast.api.memberprofile.dto.MemberProfileStatsDto
import java.util.UUID

/**
 * Extension point for Story 3.6 / Epics 5–6 to supply real season stats without rewriting the profile API.
 */
interface MemberProfileStatsProvider {
    fun loadStats(
        seasonId: UUID,
        userId: UUID,
    ): MemberProfileStatsDto?

    fun loadMonthlyChart(
        seasonId: UUID,
        userId: UUID,
    ): List<MemberProfileMonthDto>

    fun loadFavoriteRoleCounts(
        seasonId: UUID,
        userId: UUID,
    ): List<FavoriteRoleCountDto>
}
