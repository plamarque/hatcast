package com.hatcast.api.availability.draw

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

class DrawWeightPipelineTest {
    private val participantId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private fun context(past: Int = 0, required: Int = 1) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = "player",
            pastSelectionCount = past,
            requiredCount = required,
        )

    @Test
    fun `empty pipeline is no-op`() {
        val pipeline = DrawWeightPipeline.EMPTY
        assertEquals(5.0, pipeline.apply(5.0, context(required = 5)))
    }

    @Test
    fun `default registry pipeline applies V1 past participation malus`() {
        assertEquals(1.25, DrawWeightPipelines.DEFAULT.apply(5.0, context(past = 3, required = 5)))
    }

    @Test
    fun `single stub factor multiplies base`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { 0.5 },
            )
        assertEquals(2.5, pipeline.apply(5.0, context()))
    }

    @Test
    fun `factors apply in order as multiplicative product`() {
        val callOrder = mutableListOf<String>()
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor {
                    callOrder.add("first")
                    2.0
                },
                DrawWeightFactor {
                    callOrder.add("second")
                    3.0
                },
            )
        assertEquals(30.0, pipeline.apply(5.0, context()))
        assertEquals(listOf("first", "second"), callOrder)
    }

    @Test
    fun `factor receives draw context`() {
        val pipeline = DrawWeightPipeline.of(PastParticipationFactor)
        assertEquals(0.25, pipeline.apply(1.0, context(past = 3, required = 1)))
    }

    @Test
    fun `invalid factor multiplier is treated as zero`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { Double.NaN },
                DrawWeightFactor { -1.0 },
                DrawWeightFactor { Double.POSITIVE_INFINITY },
            )
        assertEquals(0.0, pipeline.apply(5.0, context()))
    }

    @Test
    fun `zero multiplier is accepted as valid exclusion`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { 0.0 },
            )
        assertEquals(0.0, pipeline.apply(5.0, context()))
    }

    @Test
    fun `invalid intermediate factor zeroes weight even when later factor is valid`() {
        val pipeline =
            DrawWeightPipeline.of(
                DrawWeightFactor { Double.NaN },
                DrawWeightFactor { 2.0 },
            )
        assertEquals(0.0, pipeline.apply(5.0, context()))
    }
}
