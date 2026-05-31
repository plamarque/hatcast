package com.hatcast.api.event

import com.hatcast.api.availability.AvailabilityService
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.event.dto.UpdateEventRequest
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonEventCountSync
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeCategoryService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.openapitools.jackson.nullable.JsonNullable
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.Optional
import java.util.UUID

class EventServiceUpdateTest {
    private val eventRepository = mock<EventRepository>()
    private val seasonRepository = mock<SeasonRepository>()
    private val troupeAccess = mock<TroupeAccessService>()
    private val availabilityService = mock<AvailabilityService>()
    private val participantFocusService = mock<EventParticipantFocusService>()
    private val compositionLifecycleEnrichment = mock<CompositionLifecycleEnrichmentService>()
    private val troupeCategoryService = mock<TroupeCategoryService>()
    private val seasonEventCountSync = mock<SeasonEventCountSync>()
    private val service =
        EventService(
            eventRepository,
            seasonRepository,
            troupeAccess,
            availabilityService,
            participantFocusService,
            compositionLifecycleEnrichment,
            troupeCategoryService,
            seasonEventCountSync,
        )

    private val troupeId = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seasonId = UUID.fromString("22222222-2222-2222-2222-222222222222")
    private val eventId = UUID.fromString("33333333-3333-3333-3333-333333333333")

    private val principal = TestAuthSupport.testPrincipal()

    @BeforeEach
    fun setup() {
        doNothing().whenever(troupeAccess).requireCanManageTroupe(any(), any())
        whenever(eventRepository.save(any())).thenAnswer { it.getArgument(0) }
    }

    private fun baseEvent(): EventEntity {
        val troupe =
            TroupeEntity(
                id = troupeId,
                name = "Troupe",
                slug = "troupe-slug",
            )
        val season =
            SeasonEntity(
                id = seasonId,
                troupe = troupe,
                slug = "saison-slug",
                title = "Saison",
            )
        return EventEntity(
            id = eventId,
            season = season,
            title = "Spectacle",
            slug = "spectacle",
            description = "Ancienne description",
            location = "Salle A",
            startsAt = Instant.parse("2030-01-01T20:00:00Z"),
        )
    }

    @Test
    fun `update clears description when null sent`() {
        val event = baseEvent()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        service.update(
            seasonId,
            eventId,
            UpdateEventRequest(description = JsonNullable.of(null)),
            principal,
        )

        assertNull(event.description)
    }

    @Test
    fun `update clears location when null sent`() {
        val event = baseEvent()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        service.update(
            seasonId,
            eventId,
            UpdateEventRequest(location = JsonNullable.of(null)),
            principal,
        )

        assertNull(event.location)
    }

    @Test
    fun `update rejects null title`() {
        val event = baseEvent()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        val ex =
            assertThrows<ResponseStatusException> {
                service.update(
                    seasonId,
                    eventId,
                    UpdateEventRequest(title = JsonNullable.of(null)),
                    principal,
                )
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }

    @Test
    fun `update title does not change slug`() {
        val event = baseEvent()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        service.update(
            seasonId,
            eventId,
            UpdateEventRequest(title = JsonNullable.of("Nouveau titre")),
            principal,
        )

        assertEquals("spectacle", event.slug)
        assertEquals("Nouveau titre", event.title)
    }

    @Test
    fun `update clears category when null sent`() {
        val event = baseEvent().apply { category = "deplacements" }
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        service.update(
            seasonId,
            eventId,
            UpdateEventRequest(category = JsonNullable.of(null)),
            principal,
        )

        assertNull(event.category)
    }

    @Test
    fun `update rejects null startsAt`() {
        val event = baseEvent()
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))

        val ex =
            assertThrows<ResponseStatusException> {
                service.update(
                    seasonId,
                    eventId,
                    UpdateEventRequest(startsAt = JsonNullable.of(null)),
                    principal,
                )
            }
        assertEquals(HttpStatus.BAD_REQUEST, ex.statusCode)
    }
}
