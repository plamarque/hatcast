package com.hatcast.api.availability.draw

import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import java.time.Instant
import java.util.UUID

@Tag("19.9")
@Tag("19.19b")
class ImmediateReplayFactorTest {
    private val participantId = UUID.fromString("00000000-0000-0000-0000-000000000001")

    private fun context(
        triggered: Boolean = false,
        roleKey: String = "player",
        gender: MemberGender = MemberGender.MALE,
    ) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = roleKey,
            pastSelectionCount = 0,
            requiredCount = 1,
            participantGender = gender,
            playedSameRoleOnImmediatePredecessor = triggered,
            immediatePredecessorTitle = "Cabaret du 12",
            immediatePredecessorStartsAt = Instant.parse("2031-05-01T19:00:00Z"),
        )

    @Test
    fun `EXCLUDE returns zero when triggered`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.EXCLUDE)
        assertEquals(0.0, factor.multiplier(context(triggered = true)))
    }

    @Test
    fun `EXCLUDE returns one when not triggered`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.EXCLUDE)
        assertEquals(1.0, factor.multiplier(context(triggered = false)))
    }

    @Test
    fun `MALUS returns default constant when triggered`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.MALUS)
        assertEquals(ImmediateReplayFactor.MALUS_MULTIPLIER, factor.multiplier(context(triggered = true)))
    }

    @Test
    fun `MALUS returns custom malusMultiplier when triggered`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.MALUS, malusMultiplier = 0.5)
        assertEquals(0.5, factor.multiplier(context(triggered = true)))
    }

    @Test
    fun `OFF returns one even when triggered`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.OFF)
        assertEquals(1.0, factor.multiplier(context(triggered = true)))
    }

    @Test
    fun `adjustment label includes predecessor title and date`() {
        val factor = ImmediateReplayFactor(ImmediateReplayMode.EXCLUDE)
        val label = factor.adjustmentLabel(context(triggered = true))
        assertTrue(label.contains("Cabaret du 12"))
        assertTrue(label.contains("mai 2031"))
        assertTrue(label.startsWith("Déjà Comédien"))
    }

    @Test
    fun `factor id is stable`() {
        assertEquals("immediate_replay", ImmediateReplayFactor(ImmediateReplayMode.EXCLUDE).factorId)
    }
}
