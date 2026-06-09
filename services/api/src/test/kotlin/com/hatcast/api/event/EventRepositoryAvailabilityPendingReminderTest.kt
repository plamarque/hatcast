package com.hatcast.api.event

import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.ZonedDateTime
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EventRepositoryAvailabilityPendingReminderTest {
    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    private lateinit var season: SeasonEntity
    private lateinit var fromInclusive: Instant
    private lateinit var toExclusive: Instant

    @BeforeEach
    fun setUp() {
        val troupe = troupeRepository.findById(UUID.fromString("a0000001-0000-4000-8000-000000000001")).orElseThrow()
        season =
            seasonRepository.save(
                SeasonEntity(
                    troupe = troupe,
                    slug = "avail-pending-reminder-${UUID.randomUUID()}",
                    title = "Availability pending reminder query",
                ),
            )
        val zone = EventService.AGENDA_ZONE
        val refDate = ZonedDateTime.of(2032, 6, 7, 10, 0, 0, 0, zone).toLocalDate()
        fromInclusive = refDate.plusDays(1).atStartOfDay(zone).toInstant()
        toExclusive = refDate.plusDays(22).atStartOfDay(zone).toInstant()
    }

    @Test
    fun `findPublishedEventsCollectingAvailability includes published event without composition`() {
        val event =
            savePublishedEvent(
                slug = "no-composition",
                startsAt = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, EventService.AGENDA_ZONE).toInstant(),
            )

        val results = eventRepository.findPublishedEventsCollectingAvailability(fromInclusive, toExclusive)

        assertEquals(listOf(event.id), results.map { it.id })
    }

    @Test
    fun `findPublishedEventsCollectingAvailability includes draft composition`() {
        val event =
            savePublishedEvent(
                slug = "draft-composition",
                startsAt = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, EventService.AGENDA_ZONE).toInstant(),
            )
        compositionRepository.save(
            EventCompositionEntity(
                eventId = event.id,
                validatedAt = null,
            ),
        )

        val results = eventRepository.findPublishedEventsCollectingAvailability(fromInclusive, toExclusive)

        assertEquals(listOf(event.id), results.map { it.id })
    }

    @Test
    fun `findPublishedEventsCollectingAvailability excludes validated composition`() {
        val event =
            savePublishedEvent(
                slug = "validated-composition",
                startsAt = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, EventService.AGENDA_ZONE).toInstant(),
            )
        compositionRepository.save(
            EventCompositionEntity(
                eventId = event.id,
                validatedAt = Instant.parse("2032-06-01T12:00:00Z"),
            ),
        )

        val results = eventRepository.findPublishedEventsCollectingAvailability(fromInclusive, toExclusive)

        assertTrue(results.none { it.id == event.id })
    }

    private fun savePublishedEvent(
        slug: String,
        startsAt: Instant,
    ): EventEntity =
        eventRepository.save(
            EventEntity(
                season = season,
                title = "Spectacle $slug",
                slug = "$slug-${UUID.randomUUID().toString().take(8)}",
                startsAt = startsAt,
                availabilityOpenedAt = Instant.parse("2032-01-01T00:00:00Z"),
            ),
        )
}
