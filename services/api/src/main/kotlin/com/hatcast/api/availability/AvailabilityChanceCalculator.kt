package com.hatcast.api.availability

import java.util.UUID
import java.lang.Math.round as halfUpRound
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

/**
 * Weighted chance display and draw selection (FR19, FR20, FR24).
 * Display odds use multi-draw without-replacement probability (V1 `calculateExactSelectionProbability`).
 */
object AvailabilityChanceCalculator {
    data class Candidate(
        val participantId: UUID,
        val displayName: String,
        val avatarUrl: String?,
    )

    data class ScoredCandidate(
        val participantId: UUID,
        val displayName: String,
        val avatarUrl: String?,
        val chancePercent: Int,
        val weight: Double = 0.0,
        val pastSelectionCount: Int = 0,
    )

    data class WeightedCandidate(
        val participantId: UUID,
        val displayName: String,
        val weight: Double,
        val pastSelectionCount: Int,
    )

    data class WeightedDrawResult(
        val selected: WeightedCandidate,
        val randomValue: Double,
        val totalWeight: Double,
    )

    fun weightForParticipant(
        pastSelectionCount: Int,
        requiredCount: Int,
    ): Double {
        val malus = 1.0 / (1.0 + pastSelectionCount)
        return malus * requiredCount
    }

    fun toWeightedCandidates(
        candidates: List<Candidate>,
        requiredCount: Int,
        pastSelectionCountByParticipant: Map<UUID, Int> = emptyMap(),
    ): List<WeightedCandidate> =
        candidates.map { candidate ->
            val pastCount = pastSelectionCountByParticipant[candidate.participantId] ?: 0
            WeightedCandidate(
                participantId = candidate.participantId,
                displayName = candidate.displayName,
                weight = weightForParticipant(pastCount, requiredCount),
                pastSelectionCount = pastCount,
            )
        }

    /**
     * Probability of being selected in at least one of [places] weighted draws without replacement
     * within the same role pool (port of V1 [calculateExactSelectionProbability]).
     */
    fun exactSelectionProbability(
        places: Int,
        candidates: List<WeightedCandidate>,
        targetIndex: Int,
    ): Double {
        if (places == 0 || candidates.isEmpty() || targetIndex < 0 || targetIndex >= candidates.size) {
            return 0.0
        }
        if (places >= candidates.size) {
            return 1.0
        }

        val targetWeight = candidates[targetIndex].weight
        val totalWeight = candidates.sumOf { it.weight }
        if (totalWeight <= 0.0) {
            return 0.0
        }

        if (places == 1) {
            return targetWeight / totalWeight
        }

        val allWeightsEqual = candidates.all { abs(it.weight - targetWeight) < 0.0001 }
        if (allWeightsEqual) {
            return places.toDouble() / candidates.size
        }

        var probNotSelected = 1.0
        var remainingCandidates = candidates.toList()
        var remainingTotalWeight = totalWeight
        val targetParticipantId = candidates[targetIndex].participantId

        for (@Suppress("UNUSED_VARIABLE") tirage in 1..places) {
            if (remainingCandidates.size <= 1) {
                break
            }

            val probNotSelectedThisTirage = 1.0 - (targetWeight / remainingTotalWeight)
            probNotSelected *= probNotSelectedThisTirage

            val otherCandidates =
                remainingCandidates.filter { it.participantId != targetParticipantId }
            val otherTotalWeight = remainingTotalWeight - targetWeight

            val expectedWeightRemoved =
                if (otherCandidates.isNotEmpty() && otherTotalWeight > 0) {
                    otherCandidates.sumOf { candidate ->
                        (candidate.weight / remainingTotalWeight) * candidate.weight
                    }
                } else {
                    otherTotalWeight / max(1, otherCandidates.size)
                }

            remainingTotalWeight -= expectedWeightRemoved
            if (remainingCandidates.size > 1 && otherCandidates.isNotEmpty()) {
                val closestCandidate =
                    otherCandidates.minBy { abs(it.weight - expectedWeightRemoved) }
                remainingCandidates =
                    remainingCandidates.filter { it.participantId != closestCandidate.participantId }
            }
        }

        return min(1.0, max(0.0, 1.0 - probNotSelected))
    }

    fun performWeightedDraw(
        candidates: List<WeightedCandidate>,
        random: Random = Random.Default,
    ): WeightedDrawResult? {
        if (candidates.isEmpty()) {
            return null
        }
        val totalWeight = candidates.sumOf { it.weight }
        if (totalWeight <= 0.0) {
            return null
        }
        val randomValue = random.nextDouble() * totalWeight
        var cumulative = 0.0
        for (candidate in candidates) {
            cumulative += candidate.weight
            if (randomValue <= cumulative) {
                return WeightedDrawResult(candidate, randomValue, totalWeight)
            }
        }
        val last = candidates.last()
        return WeightedDrawResult(last, randomValue, totalWeight)
    }

    fun scoreCandidates(
        candidates: List<Candidate>,
        requiredCount: Int,
        pastSelectionCountByParticipant: Map<UUID, Int> = emptyMap(),
    ): List<ScoredCandidate> {
        if (candidates.isEmpty()) {
            return emptyList()
        }
        val weighted =
            toWeightedCandidates(candidates, requiredCount, pastSelectionCountByParticipant)
        val totalWeight = weighted.sumOf { it.weight }
        if (totalWeight <= 0.0) {
            return candidates.map {
                ScoredCandidate(it.participantId, it.displayName, it.avatarUrl, 0)
            }
        }
        return weighted
            .mapIndexed { index, candidate ->
                val percent =
                    halfUpRound(exactSelectionProbability(requiredCount, weighted, index) * 100.0).toInt()
                ScoredCandidate(
                    participantId = candidate.participantId,
                    displayName = candidate.displayName,
                    avatarUrl =
                        candidates.find { it.participantId == candidate.participantId }?.avatarUrl,
                    chancePercent = percent,
                    weight = candidate.weight,
                    pastSelectionCount = candidate.pastSelectionCount,
                )
            }.sortedByDescending { it.chancePercent }
    }
}
