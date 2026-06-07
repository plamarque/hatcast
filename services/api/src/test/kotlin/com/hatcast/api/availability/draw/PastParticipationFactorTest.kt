package com.hatcast.api.availability.draw

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

class PastParticipationFactorTest {
    private val participantId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private fun context(past: Int, required: Int = 1) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = "player",
            pastSelectionCount = past,
            requiredCount = required,
        )

    @Test
    fun `multiplier is one when no past selections`() {
        assertEquals(1.0, PastParticipationFactor.multiplier(context(past = 0)))
    }

    @Test
    fun `multiplier decreases with past selections`() {
        assertEquals(0.25, PastParticipationFactor.multiplier(context(past = 3)))
    }

    @Test
    fun `combined with required count matches V1 weight`() {
        val base = 2.0
        val weight = base * PastParticipationFactor.multiplier(context(past = 2, required = 2))
        assertEquals(2.0 / 3.0, weight, 1e-9)
    }

    @Test
    fun `negative past selection count is clamped to zero`() {
        assertEquals(1.0, PastParticipationFactor.multiplier(context(past = -1)))
    }
}
