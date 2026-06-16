package com.hatcast.api.availability.draw

import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import java.util.UUID

@Tag("19.19b")
class PastParticipationFactorTest {
    private val participantId = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val defaultFactor = PastParticipationFactor.DEFAULT

    private fun context(past: Int, required: Int = 1) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = "player",
            pastSelectionCount = past,
            requiredCount = required,
        )

    @Test
    fun `multiplier is one when no past selections`() {
        assertEquals(1.0, defaultFactor.multiplier(context(past = 0)))
    }

    @Test
    fun `multiplier decreases with past selections at default strength`() {
        assertEquals(0.25, defaultFactor.multiplier(context(past = 3)))
    }

    @Test
    fun `strength one matches V1 parity`() {
        assertEquals(0.25, PastParticipationFactor(1.0).multiplier(context(past = 3)))
    }

    @Test
    fun `strength one five increases malus`() {
        val factor = PastParticipationFactor(1.5)
        assertEquals(0.125, factor.multiplier(context(past = 3)), 1e-9)
    }

    @Test
    fun `strength zero yields neutral multiplier`() {
        assertEquals(1.0, PastParticipationFactor(0.0).multiplier(context(past = 3)))
    }

    @Test
    fun `strength two steepens malus`() {
        assertEquals(0.0625, PastParticipationFactor(2.0).multiplier(context(past = 3)), 1e-9)
    }

    @Test
    fun `combined with required count matches V1 weight`() {
        val base = 2.0
        val weight = base * defaultFactor.multiplier(context(past = 2, required = 2))
        assertEquals(2.0 / 3.0, weight, 1e-9)
    }

    @Test
    fun `negative past selection count is clamped to zero`() {
        assertEquals(1.0, defaultFactor.multiplier(context(past = -1)))
    }

    @Test
    fun `adjustment label for rookie uses Jamais role`() {
        val label =
            defaultFactor.adjustmentLabel(
                DrawWeightContext(
                    participantId = participantId,
                    roleKey = "mc",
                    pastSelectionCount = 0,
                    requiredCount = 1,
                ),
            )
        assertEquals("Jamais MC", label)
    }

    @Test
    fun `adjustment label for veteran uses past count with gender agreement`() {
        val label =
            defaultFactor.adjustmentLabel(
                context(past = 2).copy(participantGender = MemberGender.MALE),
            )
        assertEquals("Déjà Comédien 2 fois", label)
    }

    @Test
    fun `adjustment label for female veteran uses comedienne`() {
        val label =
            defaultFactor.adjustmentLabel(
                context(past = 2).copy(participantGender = MemberGender.FEMALE),
            )
        assertEquals("Déjà Comédienne 2 fois", label)
    }

    @Test
    fun `adjustment label for single past mc`() {
        val label =
            defaultFactor.adjustmentLabel(
                DrawWeightContext(
                    participantId = participantId,
                    roleKey = "mc",
                    pastSelectionCount = 1,
                    requiredCount = 1,
                ),
            )
        assertEquals("Déjà MC 1 fois", label)
    }
}
