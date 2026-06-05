package com.hatcast.api.composition

import com.hatcast.api.composition.dto.MultiRoleOnEventWarningDto
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.UUID

class MultiRoleOnEventWarningServiceTest {
    private val service = MultiRoleOnEventWarningService()
    private val eventId = UUID.randomUUID()

    @Test
    fun `returns empty when each participant has one role`() {
        val slots =
            listOf(
                slot("player", 0, UUID.randomUUID()),
                slot("dj", 0, UUID.randomUUID()),
            )

        assertTrue(service.warningsBySlotKey(slots).isEmpty())
    }

    @Test
    fun `warns on every slot when participant holds two roles`() {
        val participantId = UUID.randomUUID()
        val playerSlot = slot("player", 0, participantId)
        val djSlot = slot("dj", 0, participantId)

        val warnings = service.warningsBySlotKey(listOf(playerSlot, djSlot))

        assertEquals(
            MultiRoleOnEventWarningDto(listOf("dj")),
            warnings["player" to 0],
        )
        assertEquals(
            MultiRoleOnEventWarningDto(listOf("player")),
            warnings["dj" to 0],
        )
    }

    private fun slot(
        roleKey: String,
        slotIndex: Int,
        participantId: UUID,
    ): EventCompositionSlotEntity =
        EventCompositionSlotEntity(
            eventId = eventId,
            roleKey = roleKey,
            slotIndex = slotIndex,
            seasonParticipantId = participantId,
            participationStatus = SlotParticipationStatus.PENDING,
        )
}
