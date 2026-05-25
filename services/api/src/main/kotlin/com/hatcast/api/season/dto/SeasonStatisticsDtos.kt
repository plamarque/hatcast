package com.hatcast.api.season.dto

import java.util.UUID

data class StatCountsDto(
    val selections: Int,
    val dispos: Int,
    val declines: Int,
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
    val annual: Map<String, StatCountsDto>,
    /** V1 `calculatePlayerMonthStats` — participations / dispos / declines par mois (événement validé). */
    val monthSummary: Map<String, StatCountsDto>,
    val byMonth: Map<String, Map<String, StatCountsDto>>,
    val eventCells: Map<UUID, String>,
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
