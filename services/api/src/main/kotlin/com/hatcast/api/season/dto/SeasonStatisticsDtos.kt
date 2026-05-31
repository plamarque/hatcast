package com.hatcast.api.season.dto

import java.util.UUID

data class StatCountsDto(
    val selections: Int,
    val dispos: Int,
    val declines: Int,
)

data class StatisticsEventCellDto(
    val status: String,
    val label: String,
    val roleKey: String? = null,
    val tooltip: String? = null,
)

data class StatisticsEventDto(
    val id: UUID,
    val title: String,
    val startsAt: String,
    val templateType: String,
    val equityTag: String?,
    val monthKey: String,
)

data class ParticipantStatisticsRowDto(
    val participantId: UUID,
    val displayName: String,
    /** Account slug for `/membre/:userSlug` when participant is linked to a user. Story 16.2. */
    val userSlug: String? = null,
    val avatarUrl: String? = null,
    val annual: Map<String, StatCountsDto>,
    /** V1 `calculatePlayerMonthStats` — participations / dispos / declines par mois (événement validé). */
    val monthSummary: Map<String, StatCountsDto>,
    val byMonth: Map<String, Map<String, StatCountsDto>>,
    val eventCells: Map<UUID, String>,
    val eventCellDetails: Map<UUID, StatisticsEventCellDto>,
)

data class SeasonStatisticsResponseDto(
    val participants: List<StatisticsParticipantDto>,
    val monthKeys: List<String>,
    val events: List<StatisticsEventDto>,
    val rows: List<ParticipantStatisticsRowDto>,
)

data class StatisticsParticipantDto(
    val id: UUID,
    val displayName: String,
)
