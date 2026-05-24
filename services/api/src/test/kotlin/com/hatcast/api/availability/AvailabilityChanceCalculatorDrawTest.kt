package com.hatcast.api.availability

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import java.util.UUID
import kotlin.random.Random

class AvailabilityChanceCalculatorDrawTest {
    @Test
    fun `performWeightedDraw returns null for empty candidates`() {
        assertNull(AvailabilityChanceCalculator.performWeightedDraw(emptyList()))
    }

    @Test
    fun `performWeightedDraw returns null when total weight is zero`() {
        val candidate =
            AvailabilityChanceCalculator.WeightedCandidate(
                UUID.randomUUID(),
                "Alice",
                0.0,
                0,
            )
        assertNull(AvailabilityChanceCalculator.performWeightedDraw(listOf(candidate)))
    }

    @Test
    fun `performWeightedDraw selects only candidate deterministically`() {
        val id = UUID.randomUUID()
        val weighted =
            listOf(
                AvailabilityChanceCalculator.WeightedCandidate(id, "Alice", 5.0, 0),
            )
        val result =
            AvailabilityChanceCalculator.performWeightedDraw(weighted, Random(42))
        assertNotNull(result)
        assertEquals(id, result!!.selected.participantId)
    }

    @Test
    fun `weightForParticipant applies malus from history`() {
        val fresh = AvailabilityChanceCalculator.weightForParticipant(0, 2)
        val veteran = AvailabilityChanceCalculator.weightForParticipant(2, 2)
        assert(fresh > veteran)
    }
}
