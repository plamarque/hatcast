package com.hatcast.api.availability.draw

import com.hatcast.api.availability.AvailabilityChanceCalculator
import com.hatcast.api.composition.dto.ChanceAdjustmentDto
import com.hatcast.api.composition.dto.ChanceBreakdownPeerDto
import com.hatcast.api.composition.dto.ChanceFactorBreakdownDto
import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.user.MemberGender
import java.lang.Math.round as halfUpRound
import java.util.UUID

/**
 * Explainability waterfall: reference % (empty pipeline) + sequential factor deltas (story 19.7).
 */
object ChanceBreakdownCalculator {
    data class Result(
        val referencePercent: Int,
        val chancePercent: Int,
        val adjustments: List<ChanceAdjustmentDto>,
        val factorBreakdown: List<ChanceFactorBreakdownDto>,
        val peers: List<ChanceBreakdownPeerDto>,
        val scoredPool: List<AvailabilityChanceCalculator.ScoredCandidate>,
        /** 1-based rank in the full role pool (by chance %, ties share the same rank band). */
        val poolRank: Int,
        val aheadCount: Int,
        val tiedAtChanceCount: Int,
    )

    fun calculate(
        candidates: List<AvailabilityChanceCalculator.Candidate>,
        requiredCount: Int,
        pastSelectionCountByParticipant: Map<UUID, Int>,
        targetParticipantId: UUID,
        roleKey: String,
        pipeline: DrawWeightPipeline = DrawWeightPipelines.DEFAULT,
        overrideChancePercent: Int? = null,
        targetParticipantGender: MemberGender = MemberGender.NON_SPECIFIED,
        categorySlug: String = SpectacleCategory.PRINCIPAL,
        pastSelectionCountUnscopedByParticipant: Map<UUID, Int>? = null,
        playedSameRoleOnImmediatePredecessorByParticipant: Map<UUID, Boolean> = emptyMap(),
        immediatePredecessorTitle: String? = null,
        immediatePredecessorStartsAt: java.time.Instant? = null,
        unfulfilledRoleRequestCountByParticipant: Map<UUID, Int> = emptyMap(),
    ): Result? {
        if (candidates.isEmpty()) {
            return null
        }
        val targetIndex =
            candidates.indexOfFirst { it.participantId == targetParticipantId }
        if (targetIndex < 0) {
            return null
        }

        val referencePercent =
            percentForTarget(
                candidates,
                requiredCount,
                pastSelectionCountByParticipant,
                roleKey,
                targetIndex,
                DrawWeightPipeline.EMPTY,
            )
        val chancePercent =
            overrideChancePercent
                ?: percentForTarget(
                    candidates,
                    requiredCount,
                    pastSelectionCountByParticipant,
                    roleKey,
                    targetIndex,
                    pipeline,
                    categorySlug,
                    pastSelectionCountUnscopedByParticipant,
                    playedSameRoleOnImmediatePredecessorByParticipant,
                    immediatePredecessorTitle,
                    immediatePredecessorStartsAt,
                    unfulfilledRoleRequestCountByParticipant,
                )

        val adjustments = mutableListOf<ChanceAdjustmentDto>()
        val factorBreakdown = mutableListOf<ChanceFactorBreakdownDto>()
        var percentBefore = referencePercent

        val scopedPast = pastSelectionCountByParticipant[targetParticipantId] ?: 0
        val unscopedPast =
            pastSelectionCountUnscopedByParticipant?.get(targetParticipantId) ?: scopedPast
        val replayTriggered =
            playedSameRoleOnImmediatePredecessorByParticipant[targetParticipantId] == true
        val unfulfilledCount = unfulfilledRoleRequestCountByParticipant[targetParticipantId] ?: 0

        for (factor in pipeline.factors) {
            // Category scope is applied via scoped pastSelectionCount before breakdown;
            // it is not a separate explainability criterion (story 19.8).
            if (factor is CategoryCompartmentFactor) {
                continue
            }

            val context =
                DrawWeightContext(
                    participantId = targetParticipantId,
                    roleKey = roleKey,
                    pastSelectionCount = scopedPast,
                    requiredCount = requiredCount,
                    participantGender = targetParticipantGender,
                    categorySlug = categorySlug,
                    pastSelectionCountUnscoped = unscopedPast,
                    playedSameRoleOnImmediatePredecessor = replayTriggered,
                    immediatePredecessorTitle = immediatePredecessorTitle,
                    immediatePredecessorStartsAt = immediatePredecessorStartsAt,
                    unfulfilledRoleRequestCount = unfulfilledCount,
                )
            val multiplier = factor.multiplier(context)
            val label =
                when (factor) {
                    is LabeledDrawWeightFactor -> factor.adjustmentLabel(context)
                    else -> factor.javaClass.simpleName
                }
            factorBreakdown.add(
                ChanceFactorBreakdownDto(
                    factorId = (factor as? LabeledDrawWeightFactor)?.factorId ?: factor.javaClass.simpleName,
                    multiplier = multiplier,
                    label = label,
                ),
            )

            val partialPipeline =
                DrawWeightPipeline.of(
                    pipeline.factors.take(pipeline.factors.indexOf(factor) + 1),
                )
            val percentAfter =
                percentForTarget(
                    candidates,
                    requiredCount,
                    pastSelectionCountByParticipant,
                    roleKey,
                    targetIndex,
                    partialPipeline,
                    categorySlug,
                    pastSelectionCountUnscopedByParticipant,
                    playedSameRoleOnImmediatePredecessorByParticipant,
                    immediatePredecessorTitle,
                    immediatePredecessorStartsAt,
                    unfulfilledRoleRequestCountByParticipant,
                )
            val deltaPoints = percentAfter - percentBefore
            if (deltaPoints != 0) {
                adjustments.add(
                    ChanceAdjustmentDto(
                        factorId = (factor as? LabeledDrawWeightFactor)?.factorId ?: factor.javaClass.simpleName,
                        label = label,
                        deltaPoints = deltaPoints,
                    ),
                )
            }
            percentBefore = percentAfter
        }

        adjustments.sortByDescending { kotlin.math.abs(it.deltaPoints) }

        if (overrideChancePercent != null) {
            val reconciliation =
                chancePercent - referencePercent - adjustments.sumOf { it.deltaPoints }
            if (reconciliation != 0) {
                if (adjustments.isNotEmpty()) {
                    val last = adjustments.last()
                    adjustments[adjustments.lastIndex] =
                        last.copy(deltaPoints = last.deltaPoints + reconciliation)
                } else {
                    adjustments.add(
                        ChanceAdjustmentDto(
                            factorId = "snapshot",
                            label = "Cote enregistrée au tirage",
                            deltaPoints = reconciliation,
                        ),
                    )
                }
            }
        }

        val scoredPool =
            AvailabilityChanceCalculator.scoreCandidates(
                candidates,
                requiredCount,
                pastSelectionCountByParticipant,
                roleKey = roleKey,
                pipeline = pipeline,
                categorySlug = categorySlug,
                pastSelectionCountUnscopedByParticipant = pastSelectionCountUnscopedByParticipant ?: emptyMap(),
                playedSameRoleOnImmediatePredecessorByParticipant = playedSameRoleOnImmediatePredecessorByParticipant,
                immediatePredecessorTitle = immediatePredecessorTitle,
                immediatePredecessorStartsAt = immediatePredecessorStartsAt,
                unfulfilledRoleRequestCountByParticipant = unfulfilledRoleRequestCountByParticipant,
            )
        val targetChance = chancePercent
        val peers =
            scoredPool
                .filter { it.participantId != targetParticipantId && it.chancePercent > targetChance }
                .sortedByDescending { it.chancePercent }
                .map { row ->
                    ChanceBreakdownPeerDto(
                        participantId = row.participantId,
                        displayName = row.displayName,
                        avatarUrl = row.avatarUrl,
                        chancePercent = row.chancePercent,
                    )
                }
        val aheadCount = peers.size
        val tiedAtChanceCount = scoredPool.count { it.chancePercent == targetChance }
        val poolRank = aheadCount + 1

        return Result(
            referencePercent = referencePercent,
            chancePercent = chancePercent,
            adjustments = adjustments,
            factorBreakdown = factorBreakdown,
            peers = peers,
            scoredPool = scoredPool,
            poolRank = poolRank,
            aheadCount = aheadCount,
            tiedAtChanceCount = tiedAtChanceCount,
        )
    }

    private fun percentForTarget(
        candidates: List<AvailabilityChanceCalculator.Candidate>,
        requiredCount: Int,
        pastSelectionCountByParticipant: Map<UUID, Int>,
        roleKey: String,
        targetIndex: Int,
        pipeline: DrawWeightPipeline,
        categorySlug: String = SpectacleCategory.PRINCIPAL,
        pastSelectionCountUnscopedByParticipant: Map<UUID, Int>? = null,
        playedSameRoleOnImmediatePredecessorByParticipant: Map<UUID, Boolean> = emptyMap(),
        immediatePredecessorTitle: String? = null,
        immediatePredecessorStartsAt: java.time.Instant? = null,
        unfulfilledRoleRequestCountByParticipant: Map<UUID, Int> = emptyMap(),
    ): Int {
        val weighted =
            AvailabilityChanceCalculator.toWeightedCandidates(
                candidates,
                requiredCount,
                pastSelectionCountByParticipant,
                roleKey = roleKey,
                pipeline = pipeline,
                categorySlug = categorySlug,
                pastSelectionCountUnscopedByParticipant = pastSelectionCountUnscopedByParticipant ?: emptyMap(),
                playedSameRoleOnImmediatePredecessorByParticipant = playedSameRoleOnImmediatePredecessorByParticipant,
                immediatePredecessorTitle = immediatePredecessorTitle,
                immediatePredecessorStartsAt = immediatePredecessorStartsAt,
                unfulfilledRoleRequestCountByParticipant = unfulfilledRoleRequestCountByParticipant,
            )
        return halfUpRound(
            AvailabilityChanceCalculator.exactSelectionProbability(
                requiredCount,
                weighted,
                targetIndex,
            ) * 100.0,
        ).toInt()
    }
}
