package com.hatcast.api.composition

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Instant

class CompositionLifecycleServiceTest {
    private val service = CompositionLifecycleService()

    private val roleSlots =
        mapOf(
            "player" to 2,
        )

    @Test
    fun `no composition row yields preparing`() {
        assertEquals(
            CompositionLifecycle.PREPARING,
            service.computeRawLifecycle(null, emptyList(), roleSlots),
        )
    }

    @Test
    fun `zero assigned slots yields preparing when not validated`() {
        val composition = CompositionSnapshot(validatedAt = null)
        val slots =
            listOf(
                slot("player", 0, participantId = null),
                slot("player", 1, participantId = null),
            )
        assertEquals(
            CompositionLifecycle.PREPARING,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `zero assigned slots on validated composition yields gaps to fill`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val slots =
            listOf(
                slot("player", 0, participantId = null),
                slot("player", 1, participantId = null),
            )
        assertEquals(
            CompositionLifecycle.GAPS_TO_FILL,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `unvalidated composition with assignee is draft`() {
        val composition = CompositionSnapshot(validatedAt = null)
        val slots = listOf(slot("player", 0, participantId = java.util.UUID.randomUUID()))
        assertEquals(
            CompositionLifecycle.DRAFT_COMPOSITION,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `validated with empty required slot is gaps to fill`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val slots =
            listOf(
                slot("player", 0, participantId = java.util.UUID.randomUUID(), confirmed = true),
                slot("player", 1, participantId = null),
            )
        assertEquals(
            CompositionLifecycle.GAPS_TO_FILL,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `gaps to fill takes priority over awaiting confirmations`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val slots =
            listOf(
                slot("player", 0, participantId = java.util.UUID.randomUUID(), confirmed = false),
                slot("player", 1, participantId = null),
            )
        assertEquals(
            CompositionLifecycle.GAPS_TO_FILL,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `all filled and confirmed yields complete`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val id1 = java.util.UUID.randomUUID()
        val id2 = java.util.UUID.randomUUID()
        val slots =
            listOf(
                slot("player", 0, participantId = id1, confirmed = true),
                slot("player", 1, participantId = id2, confirmed = true),
            )
        assertEquals(
            CompositionLifecycle.COMPLETE,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `waived slot counts as complete`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val slots =
            listOf(
                slot("player", 0, participantId = java.util.UUID.randomUUID(), confirmed = false, waived = true),
                slot("player", 1, participantId = java.util.UUID.randomUUID(), confirmed = true),
            )
        assertEquals(
            CompositionLifecycle.COMPLETE,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `validated pending confirmation is awaiting`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val slots =
            listOf(
                slot("player", 0, participantId = java.util.UUID.randomUUID(), confirmed = true),
                slot("player", 1, participantId = java.util.UUID.randomUUID(), confirmed = false),
            )
        assertEquals(
            CompositionLifecycle.AWAITING_CONFIRMATIONS,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `draft hidden for member maps to preparing lifecycle and collecting badge`() {
        val composition = CompositionSnapshot(validatedAt = null)
        val slots = listOf(slot("player", 0, participantId = java.util.UUID.randomUUID()))
        val view =
            service.computeLifecycle(
                composition = composition,
                slots = slots,
                roleSlots = roleSlots,
                viewerCanSeeDraft = false,
            )
        assertEquals(CompositionLifecycle.PREPARING, view.compositionLifecycle)
        assertEquals(TeamStatusBadgeKey.COLLECTING, view.teamStatusBadge.key)
    }

    @Test
    fun `declined assignee counts as empty required slot for gaps to fill`() {
        val composition = CompositionSnapshot(validatedAt = Instant.parse("2026-01-01T00:00:00Z"))
        val id1 = java.util.UUID.randomUUID()
        val slots =
            listOf(
                slot("player", 0, participantId = id1, confirmed = true),
                slot(
                    "player",
                    1,
                    participantId = java.util.UUID.randomUUID(),
                    confirmed = false,
                    participationStatus = SlotParticipationStatus.DECLINED,
                ),
            )
        assertEquals(
            CompositionLifecycle.GAPS_TO_FILL,
            service.computeRawLifecycle(composition, slots, roleSlots),
        )
    }

    @Test
    fun `draft visible for organizer maps to draft lifecycle and preparing badge`() {
        val composition = CompositionSnapshot(validatedAt = null)
        val slots = listOf(slot("player", 0, participantId = java.util.UUID.randomUUID()))
        val view =
            service.computeLifecycle(
                composition = composition,
                slots = slots,
                roleSlots = roleSlots,
                viewerCanSeeDraft = true,
            )
        assertEquals(CompositionLifecycle.DRAFT_COMPOSITION, view.compositionLifecycle)
        assertEquals(TeamStatusBadgeKey.PREPARING, view.teamStatusBadge.key)
        assertEquals("Équipe en préparation", view.teamStatusBadge.label)
    }

    @Test
    fun `published draft visible for member maps to draft lifecycle and preparing badge`() {
        val composition =
            CompositionSnapshot(
                validatedAt = null,
                publishedAt = Instant.parse("2026-01-01T00:00:00Z"),
            )
        val slots = listOf(slot("player", 0, participantId = java.util.UUID.randomUUID()))
        val view =
            service.computeLifecycle(
                composition = composition,
                slots = slots,
                roleSlots = roleSlots,
                viewerCanSeeDraft = true,
            )
        assertEquals(CompositionLifecycle.DRAFT_COMPOSITION, view.compositionLifecycle)
        assertEquals(TeamStatusBadgeKey.PREPARING, view.teamStatusBadge.key)
    }

    private fun slot(
        role: String,
        index: Int,
        participantId: java.util.UUID?,
        confirmed: Boolean = false,
        waived: Boolean = false,
        participationStatus: SlotParticipationStatus? = null,
    ): CompositionSlotSnapshot =
        CompositionSlotSnapshot(
            roleKey = role,
            slotIndex = index,
            participantId = participantId,
            participationStatus =
                participationStatus
                    ?: if (confirmed) {
                        SlotParticipationStatus.CONFIRMED
                    } else {
                        SlotParticipationStatus.PENDING
                    },
            waived = waived,
        )
}
