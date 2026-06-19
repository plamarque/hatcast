package com.hatcast.api.availability.draw

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.util.UUID

class CategoryCompartmentFactorTest {
    private val participantId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private fun context(
        scopedPast: Int,
        unscopedPast: Int? = null,
        categorySlug: String = "principal",
    ) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = "player",
            pastSelectionCount = scopedPast,
            requiredCount = 1,
            categorySlug = categorySlug,
            pastSelectionCountUnscoped = unscopedPast ?: scopedPast,
        )

    @Test
    fun `factor id is equity_tag`() {
        assertEquals("equity_tag", CategoryCompartmentFactor.FACTOR_ID)
        assertEquals("equity_tag", CategoryCompartmentFactor.factorId)
    }

    @Test
    fun `multiplier is always one so scoped past count drives malus`() {
        assertEquals(1.0, CategoryCompartmentFactor.multiplier(context(scopedPast = 0, unscopedPast = 5)))
        assertEquals(1.0, CategoryCompartmentFactor.multiplier(context(scopedPast = 3, unscopedPast = 3)))
    }

    @Test
    fun `adjustment label is French compartment copy`() {
        assertEquals(
            "Compté dans un autre type de spectacle",
            CategoryCompartmentFactor.adjustmentLabel(context(scopedPast = 0, unscopedPast = 2)),
        )
    }

    @Test
    fun `default pipeline with compartment factor preserves V1 weights`() {
        val pipeline = DrawWeightPipelines.DEFAULT
        val pastOnly = DrawWeightPipeline.of(PastParticipationFactor.DEFAULT)
        val ctx = context(scopedPast = 3)
        assertEquals(
            pastOnly.apply(5.0, ctx),
            pipeline.apply(5.0, ctx),
        )
    }
}
