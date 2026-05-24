package com.hatcast.api.availability

import java.util.UUID
import kotlin.math.round

/**
 * Weighted chance display for organizer transparency (FR19).
 * TODO Epic 6: inject real [pastSelectionCount] from composition history.
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
    )

    fun scoreCandidates(
        candidates: List<Candidate>,
        requiredCount: Int,
        pastSelectionCountByParticipant: Map<UUID, Int> = emptyMap(),
    ): List<ScoredCandidate> {
        if (candidates.isEmpty()) {
            return emptyList()
        }
        val weights =
            candidates.map { candidate ->
                val pastCount = pastSelectionCountByParticipant[candidate.participantId] ?: 0
                val malus = 1.0 / (1.0 + pastCount)
                val weighted = malus * requiredCount
                candidate to weighted
            }
        val totalWeight = weights.sumOf { it.second }
        if (totalWeight <= 0.0) {
            return candidates.map {
                ScoredCandidate(it.participantId, it.displayName, it.avatarUrl, 0)
            }
        }
        return weights
            .map { (candidate, weight) ->
                val percent = round((weight / totalWeight) * 100.0).toInt()
                ScoredCandidate(
                    participantId = candidate.participantId,
                    displayName = candidate.displayName,
                    avatarUrl = candidate.avatarUrl,
                    chancePercent = percent,
                )
            }.sortedByDescending { it.chancePercent }
    }
}
