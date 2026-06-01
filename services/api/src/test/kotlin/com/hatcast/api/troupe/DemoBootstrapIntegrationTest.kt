package com.hatcast.api.troupe

import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.CompositionLifecycle
import com.hatcast.api.composition.CompositionLifecycleService
import com.hatcast.api.composition.CompositionSlotSnapshot
import com.hatcast.api.composition.CompositionSnapshot
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
class DemoBootstrapIntegrationTest {
    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    @Autowired
    private lateinit var lifecycleService: CompositionLifecycleService

    private val demoTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000099")
    private val demoSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000099")
    private val improbotsTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val improbotsSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val improbotsOpenedEventId: UUID = UUID.fromString("c0000001-0000-4000-8000-000000000001")
    private val improbotsDraftQaEventIds: List<UUID> =
        listOf(
            UUID.fromString("c0000025-0000-4000-8000-000000000025"),
            UUID.fromString("c0000026-0000-4000-8000-000000000026"),
        )

    private fun lifecycleFor(eventId: UUID): CompositionLifecycle {
        val event = eventRepository.findById(eventId).orElseThrow()
        val composition = compositionRepository.findById(eventId).orElse(null)
        val slots =
            slotRepository.findByEventId(eventId).map { slot ->
                CompositionSlotSnapshot(
                    roleKey = slot.roleKey,
                    slotIndex = slot.slotIndex,
                    participantId = slot.seasonParticipantId ?: slot.eventParticipantId,
                    participationStatus = slot.participationStatus,
                    waived = slot.waived,
                )
            }
        val snapshot =
            composition?.let {
                CompositionSnapshot(validatedAt = it.validatedAt, publishedAt = it.publishedAt)
            }
        return lifecycleService.computeRawLifecycle(snapshot, slots, event.roleSlots)
    }

    @Test
    fun `demo bootstrap troupe season roster and composition lifecycles after flyway`() {
        val demo = troupeRepository.findById(demoTroupeId).orElseThrow()
        assertEquals("Démo", demo.name)
        assertEquals("demo", demo.slug)
        assertEquals(TroupeJoinPolicy.OPEN, demo.joinPolicy)
        assertEquals(true, demo.isDemo)

        val season = seasonRepository.findById(demoSeasonId).orElseThrow()
        assertEquals(demoTroupeId, season.troupe.id)
        assertEquals("saison-2026-2027", season.slug)
        assertEquals("Saison 2026-2027", season.title)
        assertEquals(true, season.isActive)
        assertEquals(false, season.archived)

        val allEvents = eventRepository.findAll().filter { it.season.id == demoSeasonId }
        assertEquals(20, allEvents.size)

        val activeEvents = eventRepository.findNonArchivedBySeasonId(demoSeasonId)
        assertEquals(18, activeEvents.size)

        val templateTypes = allEvents.map { it.templateType }.toSet()
        assertTrue("cabaret" in templateTypes)
        assertTrue("match" in templateTypes)
        assertTrue("longform" in templateTypes)
        assertTrue("deplacement" in templateTypes)

        val participantCount =
            seasonParticipantRepository.countBySeason_IdAndStatus(demoSeasonId, ParticipantStatus.ACTIVE)
        assertTrue(participantCount >= 8)

        val preparingEventId = UUID.fromString("c0000004-0000-4000-8000-000000000099")
        assertTrue(availabilityRepository.findByEvent_Id(preparingEventId).isNotEmpty())

        assertEquals(CompositionLifecycle.PREPARING, lifecycleFor(preparingEventId))
        assertEquals(CompositionLifecycle.DRAFT_COMPOSITION, lifecycleFor(UUID.fromString("c0000008-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.DRAFT_COMPOSITION, lifecycleFor(UUID.fromString("c0000009-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.COMPLETE, lifecycleFor(UUID.fromString("c0000001-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.COMPLETE, lifecycleFor(UUID.fromString("c0000002-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.COMPLETE, lifecycleFor(UUID.fromString("c0000003-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.COMPLETE, lifecycleFor(UUID.fromString("c0000013-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.AWAITING_CONFIRMATIONS, lifecycleFor(UUID.fromString("c0000010-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.AWAITING_CONFIRMATIONS, lifecycleFor(UUID.fromString("c0000011-0000-4000-8000-000000000099")))
        assertEquals(CompositionLifecycle.GAPS_TO_FILL, lifecycleFor(UUID.fromString("c0000012-0000-4000-8000-000000000099")))

        val improbots = troupeRepository.findById(improbotsTroupeId).orElseThrow()
        assertEquals(false, improbots.isDemo)
        assertEquals(TroupeJoinPolicy.OPEN, improbots.joinPolicy)

        val openedWithAvailability =
            eventRepository.findById(improbotsOpenedEventId).orElseThrow()
        assertEquals(improbotsSeasonId, openedWithAvailability.season.id)
        assertTrue(availabilityRepository.findByEvent_Id(improbotsOpenedEventId).isNotEmpty())
        assertNotNull(openedWithAvailability.availabilityOpenedAt)

        improbotsDraftQaEventIds.forEach { eventId ->
            val draft = eventRepository.findById(eventId).orElseThrow()
            assertEquals(improbotsSeasonId, draft.season.id)
            assertNull(draft.availabilityOpenedAt)
        }
    }
}
