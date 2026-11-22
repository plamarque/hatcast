package com.hatcast.api.composition.dto

import java.util.UUID

data class ChanceAdjustmentDto(
    val factorId: String,
    /** French product copy — e.g. « Déjà Comédien·ne 3 fois » */
    val label: String,
    val deltaPoints: Int,
)

data class ChanceBreakdownPeerDto(
    val participantId: UUID,
    val displayName: String,
    val avatarUrl: String? = null,
    val chancePercent: Int,
)

data class ChanceBreakdownPoolDto(
    val peers: List<ChanceBreakdownPeerDto>,
)

data class ChanceFactorBreakdownDto(
    val factorId: String,
    val multiplier: Double,
    val label: String,
)

data class ChanceBreakdownDto(
    val participantId: UUID,
    val roleKey: String,
    val displayName: String,
    val chancePercent: Int?,
    /** Pure draw odds before factor modifiers (W18). */
    val referencePercent: Int? = null,
    /** Eligible candidates in the role pool (for reference line copy). */
    val candidateCount: Int? = null,
    /** 1-based rank in the pool by chance % (peers ahead + 1). */
    val poolRank: Int? = null,
    val aheadCount: Int? = null,
    /** Candidates sharing the subject's chance % (including the subject). */
    val tiedAtChanceCount: Int? = null,
    val adjustments: List<ChanceAdjustmentDto> = emptyList(),
    val requiredCount: Int? = null,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
    val pool: ChanceBreakdownPoolDto? = null,
    /** Engine / tests — not shown in MVP UI. */
    val factorBreakdown: List<ChanceFactorBreakdownDto>? = null,
    val recordedSelection: Boolean = false,
    val recordedSnapshot: Boolean = false,
    val recordedTheoreticalRank: Int? = null,
    val recordedTheoreticalTiedCount: Int? = null,
    val recordedTheoreticalCandidateCount: Int? = null,
    val recordedPercent: Int? = null,
    val recordedAt: java.time.Instant? = null,
    val recordedSource: String? = null,
    val currentEstimateAfterCapture: Boolean = false,
    val availableForRoleAfterCapture: Boolean = false,
)

data class CompositionPoolPreviewSegmentDto(
    val participantId: UUID,
    val displayName: String,
    val chancePercent: Int,
    val weight: Double,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
)

data class CompositionPoolPreviewResponseDto(
    val roleKey: String,
    val requiredCount: Int,
    val segments: List<CompositionPoolPreviewSegmentDto>,
)
