package com.hatcast.api.availability

import com.hatcast.api.availability.draw.DrawWeightFactor
import com.hatcast.api.availability.draw.DrawWeightPipeline
import org.junit.jupiter.api.Assertions.assertEquals
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

    @Test
    fun `weightForParticipant uses configured pipeline`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { 2.0 },
            )
        val weight =
            AvailabilityChanceCalculator.weightForParticipant(
                pastSelectionCount = 0,
                requiredCount = 5,
                pipeline = pipeline,
            )
        assertEquals(10.0, weight)
    }
}
