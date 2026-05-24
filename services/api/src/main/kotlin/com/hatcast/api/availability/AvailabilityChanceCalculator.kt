package com.hatcast.api.availability

import java.util.UUID
import kotlin.math.round
import kotlin.random.Random

/**
 * Weighted chance display and draw selection (FR19, FR20, FR24).
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
            .map { candidate ->
                val percent = round((candidate.weight / totalWeight) * 100.0).toInt()
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
