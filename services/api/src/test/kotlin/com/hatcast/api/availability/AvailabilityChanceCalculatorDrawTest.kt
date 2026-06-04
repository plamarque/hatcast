package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 * Smoke tests for weighted draw.
 * Deterministic seeded draws are covered by [DrawGoldenTest] (REF-D*, T-D*).
 */
class AvailabilityChanceCalculatorDrawTest {
    @Test
    fun `weightForParticipant applies malus from history`() {
        val fresh = AvailabilityChanceCalculator.weightForParticipant(0, 2)
        val veteran = AvailabilityChanceCalculator.weightForParticipant(2, 2)
        assertTrue(fresh > veteran)
    }
}
