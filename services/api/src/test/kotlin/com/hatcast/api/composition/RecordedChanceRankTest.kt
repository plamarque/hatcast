package com.hatcast.api.composition

import com.hatcast.api.availability.dto.SummaryRoleCandidateDto
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.util.UUID

class RecordedChanceRankTest {
    private fun candidate(percent: Int?, assigned: Boolean = false) = SummaryRoleCandidateDto(
        participantId = UUID.randomUUID(), displayName = "Candidate", chancePercent = percent, publishedAssignment = assigned,
    )

    @Test
    fun `compares the exact displayed mix of recorded and live chances`() {
        val candidates = listOf(candidate(80), candidate(70), candidate(60), candidate(43, true), candidate(26, true), candidate(18, true))
        assertEquals(RecordedChanceRank(4, 1, 6), RecordedChanceRank.calculate(candidates[3].participantId, candidates))
        assertEquals(RecordedChanceRank(5, 1, 6), RecordedChanceRank.calculate(candidates[4].participantId, candidates))
        assertEquals(RecordedChanceRank(6, 1, 6), RecordedChanceRank.calculate(candidates[5].participantId, candidates))
    }

    @Test
    fun `counts ties across recorded and live candidates`() {
        val candidates = listOf(candidate(80), candidate(40, true), candidate(40), candidate(20, true))
        assertEquals(RecordedChanceRank(2, 2, 4), RecordedChanceRank.calculate(candidates[1].participantId, candidates))
    }

    @Test
    fun `does not invent rank when any displayed percentage or target is missing`() {
        val selected = candidate(40, true)
        assertNull(RecordedChanceRank.calculate(selected.participantId, listOf(selected, candidate(null, true))))
        assertNull(RecordedChanceRank.calculate(selected.participantId, listOf(selected.copy(chancePercent = null))))
        assertNull(RecordedChanceRank.calculate(UUID.randomUUID(), listOf(selected)))
        assertNull(RecordedChanceRank.calculate(selected.participantId, listOf(selected, selected)))
        assertNull(RecordedChanceRank.calculate(selected.participantId, emptyList()))
    }
}
