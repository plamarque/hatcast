package com.hatcast.api.troupe.dto

import com.hatcast.api.troupe.TroupeBaselineRole
import java.util.UUID

data class MemberConversionSeasonOptionDto(
    val seasonId: UUID,
    val seasonTitle: String,
    val seasonSlug: String,
)

data class MemberConversionContextDto(
    val membershipId: UUID,
    val baselineRole: TroupeBaselineRole,
    val activeSeasons: List<MemberConversionSeasonOptionDto>,
)

data class ConvertToExterneRequest(
    val seasonsToGuestSeason: List<UUID> = emptyList(),
    val seasonsToRemove: List<UUID> = emptyList(),
)
