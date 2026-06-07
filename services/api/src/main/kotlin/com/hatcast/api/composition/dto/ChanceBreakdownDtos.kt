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
    val chancePercent: Int,
    /** Pure draw odds before factor modifiers (W18). */
    val referencePercent: Int,
    /** Eligible candidates in the role pool (for reference line copy). */
    val candidateCount: Int,
    /** 1-based rank in the pool by chance % (peers ahead + 1). */
    val poolRank: Int,
    val aheadCount: Int,
    /** Candidates sharing the subject's chance % (including the subject). */
    val tiedAtChanceCount: Int,
    val adjustments: List<ChanceAdjustmentDto>,
    val requiredCount: Int? = null,
    val avatarUrl: String? = null,
    val gender: String = "non_specified",
    val pool: ChanceBreakdownPoolDto? = null,
    /** Engine / tests — not shown in MVP UI. */
    val factorBreakdown: List<ChanceFactorBreakdownDto>? = null,
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
