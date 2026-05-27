package com.hatcast.api.composition

import com.hatcast.api.event.EquityCompartment
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EventCompositionSlotRepositoryCompartmentTest {
    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    private lateinit var seasonId: UUID
    private lateinit var principalEventId: UUID
    private lateinit var deplacementsEventId: UUID
    private lateinit var aperockEventId: UUID
    private lateinit var targetEventId: UUID
    private lateinit var participantId: UUID

    @BeforeEach
    fun setUp() {
        val troupe = troupeRepository.findById(UUID.fromString("a0000001-0000-4000-8000-000000000001")).orElseThrow()
        val season =
            seasonRepository.save(
                SeasonEntity(
                    troupe = troupe,
                    slug = "repo-compartment-${UUID.randomUUID()}",
                    title = "Compartment repo test",
                ),
            )
        seasonId = season.id
        participantId =
            seasonParticipantRepository
                .save(
                    SeasonParticipantEntity(
                        season = season,
                        displayName = "Player One",
                    ),
                ).id

        principalEventId = saveEvent(season, "principal-show", templateType = "match")
        deplacementsEventId =
            saveEvent(
                season,
                "away-show",
                templateType = "match",
                equityTag = "deplacements",
            )
        aperockEventId =
            saveEvent(
                season,
                "aperock-show",
                templateType = "match",
                equityTag = "aperock",
            )
        targetEventId = saveEvent(season, "target-show", templateType = "match")

        seedValidatedAssignment(principalEventId)
        seedValidatedAssignment(deplacementsEventId)
        seedValidatedAssignment(aperockEventId)
    }

    @Test
    fun `countValidatedSelectionsBySeasonAndCompartment filters JPQL by compartment slug`() {
        fun countFor(compartment: String): Int =
            slotRepository
                .countValidatedSelectionsBySeasonAndCompartment(
                    seasonId,
                    targetEventId,
                    compartment,
                ).singleOrNull()
                ?.getSelectionCount()
                ?.toInt() ?: 0

        assertEquals(1, countFor(EquityCompartment.PRINCIPAL))
        assertEquals(1, countFor(EquityCompartment.DEPLACEMENTS))
        assertEquals(1, countFor("aperock"))
    }

    private fun saveEvent(
        season: SeasonEntity,
        slug: String,
        templateType: String,
        equityTag: String? = null,
    ): UUID =
        eventRepository
            .save(
                EventEntity(
                    season = season,
                    title = slug,
                    slug = slug,
                    startsAt = Instant.parse("2031-06-01T19:00:00Z"),
                    templateType = templateType,
                    equityTag = equityTag,
                ),
            ).id

    private fun seedValidatedAssignment(eventId: UUID) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.CONFIRMED,
            ),
        )
    }
}
