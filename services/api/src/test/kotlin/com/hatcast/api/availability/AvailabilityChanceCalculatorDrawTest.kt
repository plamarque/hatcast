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
    fun `weightForParticipant uses configured pipeline without double malus`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { 2.0 },
            )
        val weight =
            AvailabilityChanceCalculator.weightForParticipant(
                pastSelectionCount = 3,
                requiredCount = 5,
                pipeline = pipeline,
            )
        assertEquals(10.0, weight)
    }

    @Test
    fun `default pipeline preserves V1 golden weights`() {
        assertEquals(2.0, AvailabilityChanceCalculator.weightForParticipant(0, 2))
        assertEquals(2.0 / 3.0, AvailabilityChanceCalculator.weightForParticipant(2, 2), 1e-9)
        assertEquals(0.25, AvailabilityChanceCalculator.weightForParticipant(3, 1), 1e-9)
    }
}
