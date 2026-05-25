package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.time.Instant
import java.util.Optional
import java.util.UUID

class SeasonStatisticsServiceTest {
    private val seasonId = UUID.randomUUID()
    private val troupeId = UUID.randomUUID()
    private val participantId = UUID.randomUUID()
    private val userId = UUID.randomUUID()
    private val eventId = UUID.randomUUID()

    private val seasonRepository = mock<SeasonRepository>()
    private val eventRepository = mock<EventRepository>()
    private val seasonParticipantRepository = mock<SeasonParticipantRepository>()
    private val compositionRepository = mock<EventCompositionRepository>()
    private val slotRepository = mock<EventCompositionSlotRepository>()
    private val declineRepository = mock<EventCompositionDeclineRepository>()
    private val availabilityRepository = mock<EventAvailabilityRepository>()
    private val troupeAccess = mock<TroupeAccessService>()

    private val service =
        SeasonStatisticsService(
            seasonRepository,
            eventRepository,
            seasonParticipantRepository,
            compositionRepository,
            slotRepository,
            declineRepository,
            availabilityRepository,
            troupeAccess,
        )

    @Test
    fun `loadStatistics resolves availability stored by user_id`() {
        val troupe = mock<TroupeEntity> { whenever(it.id).thenReturn(troupeId) }
        val season =
            mock<SeasonEntity>().also {
                whenever(it.id).thenReturn(seasonId)
                whenever(it.troupe).thenReturn(troupe)
            }
        val user = mock<UserEntity> { whenever(it.id).thenReturn(userId) }
        val membership =
            mock<TroupeMembershipEntity>().also {
                whenever(it.user).thenReturn(user)
            }
        val participant =
            mock<SeasonParticipantEntity>().also {
                whenever(it.id).thenReturn(participantId)
                whenever(it.displayName).thenReturn("Alice")
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(membership)
            }
        val event =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(eventId)
                whenever(it.title).thenReturn("Match test")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-15T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.equityTag).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 6, "mc" to 1))
                whenever(it.archived).thenReturn(false)
            }
        val availabilityRow =
            mock<EventAvailabilityEntity>().also {
                whenever(it.event).thenReturn(event)
                whenever(it.user).thenReturn(user)
                whenever(it.seasonParticipant).thenReturn(null)
                whenever(it.status).thenReturn(StoredAvailabilityStatus.AVAILABLE)
                whenever(it.roleKeys).thenReturn(listOf("player", "mc"))
            }

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(listOf(event))
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(listOf(availabilityRow))

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub-alice",
                idpUid = null,
                email = "alice@example.com",
            )

        val result = service.loadStatistics(seasonId, principal)

        assertEquals(1, result.rows.size)
        val cell = result.rows.first().eventCells[eventId]
        assertTrue(cell?.startsWith("Dispo (") == true, "expected Dispo export, got: $cell")
    }

    @Test
    fun `loadStatistics filters events by equity compartments`() {
        val troupe = mock<TroupeEntity> { whenever(it.id).thenReturn(troupeId) }
        val season =
            mock<SeasonEntity>().also {
                whenever(it.id).thenReturn(seasonId)
                whenever(it.troupe).thenReturn(troupe)
            }
        val participant =
            mock<SeasonParticipantEntity>().also {
                whenever(it.id).thenReturn(participantId)
                whenever(it.displayName).thenReturn("Alice")
            }
        val ordinary =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(UUID.randomUUID())
                whenever(it.title).thenReturn("Match local")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-10T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.equityTag).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 6))
                whenever(it.archived).thenReturn(false)
            }
        val away =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(eventId)
                whenever(it.title).thenReturn("Déplacement")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-15T19:00:00Z"))
                whenever(it.templateType).thenReturn("deplacement")
                whenever(it.equityTag).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 6))
                whenever(it.archived).thenReturn(false)
            }

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(listOf(ordinary, away))
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(emptyList())

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = "alice@example.com",
            )

        val principalOnly = service.loadStatistics(seasonId, principal, equityCompartments = listOf("principal"))
        assertEquals(1, principalOnly.events.size)
        assertEquals("Match local", principalOnly.events.first().title)

        val deplOnly = service.loadStatistics(seasonId, principal, equityCompartments = listOf("deplacements"))
        assertEquals(1, deplOnly.events.size)
        assertEquals(eventId, deplOnly.events.first().id)

        val empty = service.loadStatistics(seasonId, principal, equityCompartments = listOf(""))
        assertTrue(empty.events.isEmpty())
    }
}
