package com.hatcast.api.composition

import com.hatcast.api.event.EventEntity
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doReturn
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

@Tag("19.9")
class ImmediatePredecessorRoleReplayServiceTest {
    private val seasonParticipantA = UUID.fromString("00000000-0000-0000-0000-000000000001")
    private val seasonParticipantB = UUID.fromString("00000000-0000-0000-0000-000000000002")
    private val userA = UUID.fromString("00000000-0000-0000-0000-000000000011")

    private val service =
        ImmediatePredecessorRoleReplayService(
            immediatePredecessorEventResolver =
                object : ImmediatePredecessorEventResolver {
                    override fun resolve(currentEvent: EventEntity): EventEntity? = null
                },
            slotRepository = mock(),
            seasonParticipantRepository = mock(),
            eventParticipantRepository = mock(),
        )

    private fun identity(seasonId: UUID? = null, userId: UUID? = null) =
        CompositionParticipantIdentity(seasonParticipantId = seasonId, userId = userId)

    @Test
    fun `triggered when same role and season participant id matches`() {
        val predecessorSlots =
            listOf(
                slot(roleKey = "player", seasonParticipantId = seasonParticipantA),
            )
        val predecessorIdentities =
            mapOf(seasonParticipantA to identity(seasonParticipantA, userA))

        val triggered =
            service.playedSameRoleOnPredecessor(
                roleKey = "player",
                candidateIdentity = identity(seasonParticipantA, userA),
                predecessorSlots = predecessorSlots,
                predecessorIdentities = predecessorIdentities,
            )
        assertTrue(triggered)
    }

    @Test
    fun `not triggered when different role on predecessor`() {
        val predecessorSlots =
            listOf(
                slot(roleKey = "mc", seasonParticipantId = seasonParticipantA),
            )
        val predecessorIdentities =
            mapOf(seasonParticipantA to identity(seasonParticipantA, userA))

        val triggered =
            service.playedSameRoleOnPredecessor(
                roleKey = "player",
                candidateIdentity = identity(seasonParticipantA, userA),
                predecessorSlots = predecessorSlots,
                predecessorIdentities = predecessorIdentities,
            )
        assertFalse(triggered)
    }

    @Test
    fun `triggered via linked user id when season ids differ`() {
        val predecessorEventParticipant = UUID.fromString("00000000-0000-0000-0000-000000000099")
        val predecessorSlots =
            listOf(
                slot(roleKey = "player", eventParticipantId = predecessorEventParticipant),
            )
        val predecessorIdentities =
            mapOf(
                predecessorEventParticipant to identity(seasonParticipantB, userA),
            )

        val triggered =
            service.playedSameRoleOnPredecessor(
                roleKey = "player",
                candidateIdentity = identity(seasonParticipantA, userA),
                predecessorSlots = predecessorSlots,
                predecessorIdentities = predecessorIdentities,
            )
        assertTrue(triggered)
    }

    @Test
    fun `batch snapshot marks triggered season participant`() {
        val predecessorEventId = UUID.fromString("00000000-0000-0000-0000-0000000000aa")
        val currentEvent = mock<EventEntity>()
        val predecessorEvent =
            mock<EventEntity> {
                on { id } doReturn predecessorEventId
                on { title } doReturn "Cabaret"
                on { startsAt } doReturn java.time.Instant.parse("2031-05-01T19:00:00Z")
            }
        val slotRepo =
            mock<EventCompositionSlotRepository> {
                on { findByEventId(predecessorEventId) } doReturn
                    listOf(
                        slot(roleKey = "player", seasonParticipantId = seasonParticipantA),
                    )
            }
        val seasonRepo = mock<com.hatcast.api.participant.SeasonParticipantRepository>()
        val eventRepo = mock<com.hatcast.api.participant.EventParticipantRepository>()
        val batchService =
            ImmediatePredecessorRoleReplayService(
                immediatePredecessorEventResolver =
                    object : ImmediatePredecessorEventResolver {
                        override fun resolve(currentEvent: EventEntity): EventEntity? = predecessorEvent
                    },
                slotRepository = slotRepo,
                seasonParticipantRepository = seasonRepo,
                eventParticipantRepository = eventRepo,
            )
        val eligible =
            listOf(
                CompositionEligibleParticipant(
                    participantId = seasonParticipantA,
                    userId = userA,
                    displayName = "Alice",
                    source = CompositionParticipantSource.SEASON,
                ),
            )
        whenever(seasonRepo.findAllById(any())).thenReturn(emptyList())
        val snapshot =
            batchService.playedSameRoleOnImmediatePredecessorByParticipant(
                currentEvent = currentEvent,
                roleKey = "player",
                eligibleInPool = eligible,
            )
        assertTrue(snapshot.playedSameRoleOnImmediatePredecessorByParticipant[seasonParticipantA] == true)
    }

    @Test
    fun `batch snapshot marks all false when no immediate predecessor`() {
        val currentEvent = mock<EventEntity>()
        val eligible =
            listOf(
                CompositionEligibleParticipant(
                    participantId = seasonParticipantA,
                    userId = userA,
                    displayName = "Alice",
                    source = CompositionParticipantSource.SEASON,
                ),
            )
        val snapshot =
            service.playedSameRoleOnImmediatePredecessorByParticipant(
                currentEvent = currentEvent,
                roleKey = "player",
                eligibleInPool = eligible,
            )
        assertNull(snapshot.predecessor)
        assertFalse(snapshot.playedSameRoleOnImmediatePredecessorByParticipant[seasonParticipantA] == true)
    }

    @Test
    fun `batch snapshot not triggered when predecessor slot was declined`() {
        val predecessorEventId = UUID.fromString("00000000-0000-0000-0000-0000000000bb")
        val currentEvent = mock<EventEntity>()
        val predecessorEvent =
            mock<EventEntity> {
                on { id } doReturn predecessorEventId
                on { title } doReturn "Cabaret"
                on { startsAt } doReturn java.time.Instant.parse("2031-05-01T19:00:00Z")
            }
        val slotRepo =
            mock<EventCompositionSlotRepository> {
                on { findByEventId(predecessorEventId) } doReturn
                    listOf(
                        slot(
                            roleKey = "player",
                            seasonParticipantId = seasonParticipantA,
                            participationStatus = SlotParticipationStatus.DECLINED,
                        ),
                    )
            }
        val batchService =
            ImmediatePredecessorRoleReplayService(
                immediatePredecessorEventResolver =
                    object : ImmediatePredecessorEventResolver {
                        override fun resolve(currentEvent: EventEntity): EventEntity? = predecessorEvent
                    },
                slotRepository = slotRepo,
                seasonParticipantRepository = mock(),
                eventParticipantRepository = mock(),
            )
        val eligible =
            listOf(
                CompositionEligibleParticipant(
                    participantId = seasonParticipantA,
                    userId = userA,
                    displayName = "Alice",
                    source = CompositionParticipantSource.SEASON,
                ),
            )
        val snapshot =
            batchService.playedSameRoleOnImmediatePredecessorByParticipant(
                currentEvent = currentEvent,
                roleKey = "player",
                eligibleInPool = eligible,
            )
        assertFalse(snapshot.playedSameRoleOnImmediatePredecessorByParticipant[seasonParticipantA] == true)
    }

    private fun slot(
        roleKey: String,
        seasonParticipantId: UUID? = null,
        eventParticipantId: UUID? = null,
        participationStatus: SlotParticipationStatus = SlotParticipationStatus.PENDING,
    ): EventCompositionSlotEntity =
        EventCompositionSlotEntity(
            eventId = UUID.randomUUID(),
            roleKey = roleKey,
            slotIndex = 0,
            seasonParticipantId = seasonParticipantId,
            eventParticipantId = eventParticipantId,
            participationStatus = participationStatus,
            createdAt = java.time.Instant.now(),
            updatedAt = java.time.Instant.now(),
        )
}
