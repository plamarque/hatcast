package com.hatcast.api.memberglance.dto

import com.hatcast.api.agenda.dto.UserAgendaParticipationFiltersDto
import com.hatcast.api.memberprofile.dto.FavoriteRoleCountDto
import com.hatcast.api.memberprofile.dto.MemberProfileMonthDto
import com.hatcast.api.memberprofile.dto.MemberProfileStatsDto
import java.util.UUID

data class MemberSeasonGlanceResponseDto(
    val userId: UUID,
    val userSlug: String,
    val displayName: String,
    val avatarUrl: String?,
    val isSelf: Boolean,
    val resolvedSeasonId: UUID,
    val troupeId: UUID,
    val preferredRolesTroupeId: UUID,
    val filterBarVisible: Boolean,
    val participationFilters: UserAgendaParticipationFiltersDto?,
    val stats: MemberProfileStatsDto?,
    val monthlyChart: List<MemberProfileMonthDto>,
    val favoriteRoleCounts: List<FavoriteRoleCountDto>,
    val preferredRoleKeys: List<String>?,
)
