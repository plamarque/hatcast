package com.hatcast.api.memberprofile

import com.hatcast.api.memberprofile.dto.FavoriteRoleCountDto
import com.hatcast.api.memberprofile.dto.MemberProfileMonthDto
import com.hatcast.api.memberprofile.dto.MemberProfileStatsDto
import org.springframework.stereotype.Component
import java.util.UUID

/** Empty stats until availability/composition data exists (Epics 5–6). */
@Component
class StubMemberProfileStatsProvider : MemberProfileStatsProvider {
    override fun loadStats(
        seasonId: UUID,
        userId: UUID,
    ): MemberProfileStatsDto? = null

    override fun loadMonthlyChart(
        seasonId: UUID,
        userId: UUID,
    ): List<MemberProfileMonthDto> = emptyList()

    override fun loadFavoriteRoleCounts(
        seasonId: UUID,
        userId: UUID,
    ): List<FavoriteRoleCountDto> = emptyList()
}
