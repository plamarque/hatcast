package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

/**
 * Smoke tests for [AvailabilityChanceCalculator].
 * Frozen reference vectors live in [DrawGoldenTest] (REF-P*, REF-W*, etc.).
 */
class AvailabilityChanceCalculatorTest {
    private val alice = AvailabilityChanceCalculator.Candidate(UUID.randomUUID(), "Alice", null)

    @Test
    fun `empty candidates returns empty list`() {
        assertEquals(emptyList<AvailabilityChanceCalculator.ScoredCandidate>(), AvailabilityChanceCalculator.scoreCandidates(emptyList(), 1))
    }

    @Test
    fun `single candidate gets one hundred percent`() {
        val scored = AvailabilityChanceCalculator.scoreCandidates(listOf(alice), 2)
        assertEquals(1, scored.size)
        assertEquals(100, scored[0].chancePercent)
    }
}
