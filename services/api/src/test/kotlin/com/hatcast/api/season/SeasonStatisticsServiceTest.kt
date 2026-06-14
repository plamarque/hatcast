package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.composition.CompositionLifecycleService
import com.hatcast.api.composition.CompositionLifecycle
import com.hatcast.api.composition.CompositionLifecycleView
import com.hatcast.api.composition.TeamStatusBadge
import com.hatcast.api.composition.TeamStatusBadgeKey
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
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.doNothing
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
    private val guestInvitationAccess = mock<GuestInvitationAccessService>()
    private val userRepository = mock<UserRepository>()
    private val compositionLifecycleService = CompositionLifecycleService()
    private val compositionLifecycleEnrichment = mock<CompositionLifecycleEnrichmentService>()

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
            guestInvitationAccess,
            userRepository,
            compositionLifecycleService,
            compositionLifecycleEnrichment,
        )

    @org.junit.jupiter.api.BeforeEach
    fun setupAccess() {
        doNothing().whenever(guestInvitationAccess).requireMemberOnlyPastAccess(any(), any())
        whenever(compositionLifecycleEnrichment.loadViewsByEventIds(any(), any(), any())).thenReturn(emptyMap())
    }

    @Test
    fun `loadStatistics resolves availability stored by user_id`() {
        val troupe = mock<TroupeEntity> { whenever(it.id).thenReturn(troupeId) }
        val season =
            mock<SeasonEntity>().also {
                whenever(it.id).thenReturn(seasonId)
                whenever(it.troupe).thenReturn(troupe)
            }
        val user =
            mock<UserEntity>().also {
                whenever(it.id).thenReturn(userId)
                whenever(it.slug).thenReturn("alice-dupont")
                whenever(it.avatarUpdatedAt).thenReturn(null)
            }
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
                whenever(it.slug).thenReturn("match-test")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-15T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.category).thenReturn(null)
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
        whenever(userRepository.findById(userId)).thenReturn(Optional.of(user))

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub-alice",
                idpUid = null,
                email = "alice@example.com",
            )

        val result = service.loadStatistics(seasonId, principal)

        assertEquals(1, result.rows.size)
        val row = result.rows.first()
        assertEquals("alice-dupont", row.userSlug)
        val cell = row.eventCells[eventId]
        assertTrue(cell?.startsWith("Dispo (") == true, "expected Dispo export, got: $cell")
    }

    @Test
    fun `loadStatistics filters events by categories`() {
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
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(null)
            }
        val ordinary =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(UUID.randomUUID())
                whenever(it.title).thenReturn("Match local")
                whenever(it.slug).thenReturn("match-local")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-10T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.category).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 6))
                whenever(it.archived).thenReturn(false)
            }
        val away =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(eventId)
                whenever(it.title).thenReturn("Déplacement")
                whenever(it.slug).thenReturn("deplacement")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-15T19:00:00Z"))
                whenever(it.templateType).thenReturn("deplacement")
                whenever(it.category).thenReturn(null)
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

        val principalOnly = service.loadStatistics(seasonId, principal, categories = listOf("principal"))
        assertEquals(1, principalOnly.events.size)
        assertEquals("Match local", principalOnly.events.first().title)
        assertEquals(null, principalOnly.rows.first().userSlug)

        val deplOnly = service.loadStatistics(seasonId, principal, categories = listOf("deplacements"))
        assertEquals(1, deplOnly.events.size)
        assertEquals(eventId, deplOnly.events.first().id)

        val empty = service.loadStatistics(seasonId, principal, categories = listOf(""))
        assertTrue(empty.events.isEmpty())
    }

    @Test
    fun `loadStatistics sorts participants with French accent-insensitive order`() {
        val troupe = mock<TroupeEntity> { whenever(it.id).thenReturn(troupeId) }
        val season =
            mock<SeasonEntity>().also {
                whenever(it.id).thenReturn(seasonId)
                whenever(it.troupe).thenReturn(troupe)
            }
        val veroId = UUID.randomUUID()
        val vivianeId = UUID.randomUUID()
        val vero =
            mock<SeasonParticipantEntity>().also {
                whenever(it.id).thenReturn(veroId)
                whenever(it.displayName).thenReturn("Véro")
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(null)
            }
        val viviane =
            mock<SeasonParticipantEntity>().also {
                whenever(it.id).thenReturn(vivianeId)
                whenever(it.displayName).thenReturn("Viviane")
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(null)
            }

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(viviane, vero))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(emptyList())

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = "alice@example.com",
            )

        val result = service.loadStatistics(seasonId, principal)

        assertEquals(listOf(veroId, vivianeId), result.rows.map { it.participantId })
        assertEquals(listOf("Véro", "Viviane"), result.participants.map { it.displayName })
    }

    @Test
    fun `loadStatistics exposes confirmed compositions count`() {
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
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(null)
            }
        val confirmedEventId = UUID.randomUUID()
        val pendingEventId = UUID.randomUUID()
        val now = Instant.parse("2026-06-01T12:00:00Z")
        val confirmedEvent =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(confirmedEventId)
                whenever(it.title).thenReturn("Équipe complète")
                whenever(it.slug).thenReturn("equipe-complete")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-06-13T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.category).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 1))
                whenever(it.archived).thenReturn(false)
            }
        val pendingEvent =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(pendingEventId)
                whenever(it.title).thenReturn("En attente")
                whenever(it.slug).thenReturn("en-attente")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-06-18T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.category).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 1))
                whenever(it.archived).thenReturn(false)
            }

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId))
            .thenReturn(listOf(confirmedEvent, pendingEvent))
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(
            listOf(
                EventCompositionEntity(
                    eventId = confirmedEventId,
                    validatedAt = now,
                    publishedAt = null,
                    createdAt = now,
                    updatedAt = now,
                ),
                EventCompositionEntity(
                    eventId = pendingEventId,
                    validatedAt = now,
                    publishedAt = null,
                    createdAt = now,
                    updatedAt = now,
                ),
            ),
        )
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = confirmedEventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
                EventCompositionSlotEntity(
                    eventId = pendingEventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            ),
        )
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(emptyList())

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = "alice@example.com",
            )

        val result = service.loadStatistics(seasonId, principal)

        assertEquals(1, result.confirmedCompositionsCount)
    }

    @Test
    fun `loadStatistics exposes slug and teamStatusBadge on events`() {
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
                whenever(it.user).thenReturn(null)
                whenever(it.troupeMembership).thenReturn(null)
            }
        val event =
            mock<EventEntity>().also {
                whenever(it.id).thenReturn(eventId)
                whenever(it.title).thenReturn("Match test")
                whenever(it.slug).thenReturn("match-test")
                whenever(it.startsAt).thenReturn(Instant.parse("2026-03-15T19:00:00Z"))
                whenever(it.templateType).thenReturn("match")
                whenever(it.category).thenReturn(null)
                whenever(it.roleSlots).thenReturn(mapOf("player" to 6))
                whenever(it.archived).thenReturn(false)
            }

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(listOf(event))
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(emptyList())
        whenever(compositionLifecycleEnrichment.loadViewsByEventIds(any(), any(), any()))
            .thenReturn(
                mapOf(
                    eventId to
                        CompositionLifecycleView(
                            compositionLifecycle = CompositionLifecycle.COMPLETE,
                            teamStatusBadge =
                                TeamStatusBadge(
                                    key = TeamStatusBadgeKey.CONFIRMED,
                                    label = "Équipe confirmée",
                                    tone = "confirmed",
                                    shortLabel = "Confirmé",
                                ),
                        ),
                ),
            )

        val principal =
            SessionUserPrincipal(
                userId = UUID.randomUUID(),
                googleSub = "sub",
                idpUid = null,
                email = "alice@example.com",
            )

        val result = service.loadStatistics(seasonId, principal)

        val eventDto = result.events.single()
        assertEquals("match-test", eventDto.slug)
        assertEquals("confirmed", eventDto.teamStatusBadge?.tone)
        assertEquals("Confirmé", eventDto.teamStatusBadge?.shortLabel)
    }
}
