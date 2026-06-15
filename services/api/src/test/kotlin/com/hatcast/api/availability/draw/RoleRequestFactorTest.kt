package com.hatcast.api.availability.draw

import com.hatcast.api.user.MemberGender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import java.util.UUID

@Tag("19.10")
class RoleRequestFactorTest {
    private val participantId = UUID.fromString("00000000-0000-4000-8000-000000000001")

    private fun context(unfulfilled: Int) =
        DrawWeightContext(
            participantId = participantId,
            roleKey = "dj",
            pastSelectionCount = 0,
            requiredCount = 1,
            participantGender = MemberGender.FEMALE,
            unfulfilledRoleRequestCount = unfulfilled,
        )

    @Test
    fun `n equals 7 yields multiplier 8`() {
        assertEquals(8.0, RoleRequestFactor.bonusMultiplier(7))
        assertEquals(8.0, RoleRequestFactor.multiplier(context(7)))
    }

    @Test
    fun `n equals 0 yields neutral multiplier`() {
        assertEquals(1.0, RoleRequestFactor.bonusMultiplier(0))
        assertEquals(1.0, RoleRequestFactor.multiplier(context(0)))
    }

    @Test
    fun `n equals 1 yields modest boost`() {
        assertEquals(2.0, RoleRequestFactor.bonusMultiplier(1))
    }

    @Test
    fun `cap applied when n very large`() {
        assertEquals(RoleRequestFactor.MAX_BONUS_MULTIPLIER, RoleRequestFactor.bonusMultiplier(20))
        assertEquals(RoleRequestFactor.MAX_BONUS_MULTIPLIER, RoleRequestFactor.bonusMultiplier(100))
    }

    @Test
    fun `adjustment label uses role label and count`() {
        val label = RoleRequestFactor.adjustmentLabel(context(7))
        assertEquals("A demandé DJ 7 fois sans être tiré·e — bonus aspiration", label)
    }
}
