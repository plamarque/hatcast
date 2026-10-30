package com.hatcast.api.composition

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class CompositionSlotRequirementTest {
    private fun slot(roleKey: String, slotIndex: Int) =
        EventCompositionSlotEntity(
            eventId = UUID.randomUUID(),
            roleKey = roleKey,
            slotIndex = slotIndex,
            seasonParticipantId = UUID.randomUUID(),
        )

    @Test
    fun `keeps only positions required after a role reduction`() {
        assertTrue(slot("player", 2).isRequiredBy(mapOf("player" to 3)))
        assertFalse(slot("player", 3).isRequiredBy(mapOf("player" to 3)))
    }

    @Test
    fun `excludes positions for a removed role`() {
        assertFalse(slot("dj", 0).isRequiredBy(mapOf("player" to 3)))
    }

    @Test
    fun `does not mark an existing position affected by an increase`() {
        assertTrue(slot("player", 4).isRequiredBy(mapOf("player" to 5)))
    }
}
