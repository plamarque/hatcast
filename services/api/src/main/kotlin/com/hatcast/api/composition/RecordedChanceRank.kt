package com.hatcast.api.composition

import com.hatcast.api.availability.dto.SummaryRoleCandidateDto
import java.util.UUID

/** Compare exactly the percentages displayed in the viewer’s Dispos role list. */
internal data class RecordedChanceRank(val rank: Int, val tiedCount: Int, val candidateCount: Int) {
    companion object {
        fun calculate(participantId: UUID, candidates: List<SummaryRoleCandidateDto>): RecordedChanceRank? {
            val selected = candidates.singleOrNull { it.participantId == participantId } ?: return null
            val percent = selected.chancePercent ?: return null
            // A missing displayed value prevents a reliable position or denominator.
            if (candidates.any { it.chancePercent == null } || candidates.map { it.participantId }.distinct().size != candidates.size) return null
            return RecordedChanceRank(
                rank = 1 + candidates.count { it.chancePercent!! > percent },
                tiedCount = candidates.count { it.chancePercent == percent },
                candidateCount = candidates.size,
            )
        }
    }
}
