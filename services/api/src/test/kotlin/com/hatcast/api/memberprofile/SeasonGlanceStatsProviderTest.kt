package com.hatcast.api.memberprofile

import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.UUID

/** MIG-3 shape: decline row in `event_composition_declines` without a matching slot assignment. */
class SeasonGlanceStatsProviderTest {
    private val eventRepository: EventRepository = mock()
    private val seasonParticipantRepository: SeasonParticipantRepository = mock()
    private val compositionRepository: EventCompositionRepository = mock()
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val declineRepository: EventCompositionDeclineRepository = mock()
    private val availabilityRepository: EventAvailabilityRepository = mock()

    private val provider =
        SeasonGlanceStatsProvider(
            eventRepository = eventRepository,
            seasonParticipantRepository = seasonParticipantRepository,
            compositionRepository = compositionRepository,
            slotRepository = slotRepository,
            declineRepository = declineRepository,
            availabilityRepository = availabilityRepository,
        )

    @Test
    fun `loadStats counts decline-only initial selection and decline without slot`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2026-03-15T20:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Apérock Mars",
                slug = "aperock-mars",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = now)),
            slots = emptyList(),
            declines =
                listOf(
                    EventCompositionDeclineEntity(
                        eventId = eventId,
                        roleKey = "player",
                        slotIndex = 0,
                        seasonParticipantId = participantId,
                        eventParticipantId = null,
                        declinedByUserId = userId,
                        declinedAt = now,
                        note = null,
                    ),
                ),
        )

        val stats = provider.loadStats(seasonId, userId)

        assertNotNull(stats)
        assertEquals(0, stats!!.selections.count)
        assertEquals(1, stats.declines.count)
    }

    @Test
    fun `loadStats counts slotted selection when validated_at is null but slots exist`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2025-10-18T19:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Match Cambo",
                slug = "match-cambo",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = null)),
            slots =
                listOf(
                    EventCompositionSlotEntity(
                        eventId = eventId,
                        roleKey = "assistant_referee",
                        slotIndex = 1,
                        seasonParticipantId = participantId,
                        participationStatus = SlotParticipationStatus.CONFIRMED,
                    ),
                ),
            declines = emptyList(),
        )

        val stats = provider.loadStats(seasonId, userId)

        assertNotNull(stats)
        assertEquals(1, stats!!.selections.count)
        assertEquals(0, stats.declines.count)
    }

    @Test
    fun `loadMonthlyChart shows assistant slot when validated_at is null`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2025-10-18T19:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Match Cambo",
                slug = "match-cambo",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = null)),
            slots =
                listOf(
                    EventCompositionSlotEntity(
                        eventId = eventId,
                        roleKey = "assistant_referee",
                        slotIndex = 1,
                        seasonParticipantId = participantId,
                        participationStatus = SlotParticipationStatus.CONFIRMED,
                    ),
                ),
            declines = emptyList(),
        )

        val chart = provider.loadMonthlyChart(seasonId, userId)

        assertEquals(1, chart.size)
        assertEquals("selected", chart[0].blocks.single().status)
        assertEquals("assistant_referee", chart[0].blocks.single().roleKey)
    }

    @Test
    fun `loadMonthlyChart marks pending slot as pending`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2025-11-12T20:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Match Pau",
                slug = "match-pau",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = now)),
            slots =
                listOf(
                    EventCompositionSlotEntity(
                        eventId = eventId,
                        roleKey = "player",
                        slotIndex = 0,
                        seasonParticipantId = participantId,
                        participationStatus = SlotParticipationStatus.PENDING,
                    ),
                ),
            declines = emptyList(),
        )

        val chart = provider.loadMonthlyChart(seasonId, userId)

        assertEquals(1, chart.size)
        assertEquals("pending", chart[0].blocks.single().status)
        assertEquals("player", chart[0].blocks.single().roleKey)
    }

    @Test
    fun `loadMonthlyChart marks decline-only event as declined`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2026-03-15T20:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Cab CCAS",
                slug = "cab-ccas",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = now)),
            slots = emptyList(),
            declines =
                listOf(
                    EventCompositionDeclineEntity(
                        eventId = eventId,
                        roleKey = "player",
                        slotIndex = 0,
                        seasonParticipantId = participantId,
                        eventParticipantId = null,
                        declinedByUserId = userId,
                        declinedAt = now,
                        note = null,
                    ),
                ),
        )

        val chart = provider.loadMonthlyChart(seasonId, userId)

        assertEquals(1, chart.size)
        assertEquals("declined", chart[0].blocks.single().status)
        assertEquals("player", chart[0].blocks.single().roleKey)
    }

    @Test
    fun `loadStats does not treat decline-only as effective availability`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val now = Instant.parse("2026-03-15T20:00:00Z")

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )
        val event =
            EventEntity(
                id = eventId,
                season = season,
                title = "Arbonne Freeform",
                slug = "arbonne-freeform",
                startsAt = now,
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(event),
            compositions = listOf(EventCompositionEntity(eventId = eventId, validatedAt = now)),
            slots = emptyList(),
            declines =
                listOf(
                    EventCompositionDeclineEntity(
                        eventId = eventId,
                        roleKey = "volunteer",
                        slotIndex = 0,
                        seasonParticipantId = participantId,
                        eventParticipantId = null,
                        declinedByUserId = userId,
                        declinedAt = now,
                        note = null,
                    ),
                ),
        )

        val stats = provider.loadStats(seasonId, userId)

        assertNotNull(stats)
        assertEquals(0, stats!!.availabilities.count)
        assertEquals(0, stats.selections.count)
        assertEquals(1, stats.declines.count)
    }

    @Test
    fun `loadMonthlyChart orders months school year and blocks by date then title`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )

        val august =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Jam août",
                slug = "jam-aout",
                startsAt = Instant.parse("2026-08-20T19:00:00Z"),
            )
        val september =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Jam septembre",
                slug = "jam-septembre",
                startsAt = Instant.parse("2026-09-05T19:00:00Z"),
            )
        val sameDayEarly =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Apérock A",
                slug = "aperock-a",
                startsAt = Instant.parse("2026-03-15T18:00:00Z"),
            )
        val sameDayLate =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Apérock B",
                slug = "aperock-b",
                startsAt = Instant.parse("2026-03-15T20:00:00Z"),
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(august, sameDayLate, september, sameDayEarly),
            compositions = emptyList(),
            slots = emptyList(),
            declines = emptyList(),
        )

        val chart = provider.loadMonthlyChart(seasonId, userId)

        assertEquals(listOf("2026-09", "2026-03", "2026-08"), chart.map { it.monthKey })
        assertEquals(
            listOf(sameDayEarly.id, sameDayLate.id),
            chart[1].blocks.map { it.eventId },
        )
    }

    @Test
    fun `loadMonthlyChart orders same calendar day by startsAt not title`() {
        val seasonId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val participantId = UUID.randomUUID()

        val season = mock<SeasonEntity>()
        val participant =
            SeasonParticipantEntity(
                id = participantId,
                season = season,
                displayName = "Patrice",
                user = null,
                troupeMembership = null,
            )

        val punchClub =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Punch club",
                slug = "punch-club",
                startsAt = Instant.parse("2025-12-06T18:00:00Z"),
            )
        val matchOrthez =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Match Orthez",
                slug = "match-orthez",
                startsAt = Instant.parse("2025-12-06T20:00:00Z"),
            )

        stubScope(
            seasonId = seasonId,
            userId = userId,
            participant = participant,
            events = listOf(matchOrthez, punchClub),
            compositions = emptyList(),
            slots = emptyList(),
            declines = emptyList(),
        )

        val chart = provider.loadMonthlyChart(seasonId, userId)

        assertEquals(1, chart.size)
        assertEquals(
            listOf(punchClub.id, matchOrthez.id),
            chart.single().blocks.map { it.eventId },
        )
    }

    private fun stubScope(
        seasonId: UUID,
        userId: UUID,
        participant: SeasonParticipantEntity,
        events: List<EventEntity>,
        compositions: List<EventCompositionEntity>,
        slots: List<EventCompositionSlotEntity>,
        declines: List<EventCompositionDeclineEntity>,
    ) {
        whenever(
            seasonParticipantRepository.findActiveForSeasonLinkedToUser(
                seasonId = eq(seasonId),
                status = eq(ParticipantStatus.ACTIVE),
                userId = eq(userId),
            ),
        ).thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(events)
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(compositions)
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(slots)
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(declines)
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(emptyList())
    }
}
