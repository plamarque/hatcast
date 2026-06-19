package com.hatcast.api.season

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.CompositionLifecycleEnrichmentService
import com.hatcast.api.composition.CompositionLifecycleService
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
import com.hatcast.api.participant.GuestInvitationAccessService
import com.hatcast.api.troupe.TroupeAccessService
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.MemberGender
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

class SeasonStatisticsEventCellTest {
    private val seasonId = UUID.randomUUID()
    private val troupeId = UUID.randomUUID()
    private val participantId = UUID.randomUUID()
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

    private val principal =
        SessionUserPrincipal(
            userId = UUID.randomUUID(),
            googleSub = "sub",
            idpUid = null,
            email = "test@example.com",
        )

    @Test
    fun `buildEventCell maps confirmed selection to selected`() {
        val event = sampleEvent()
        val cell =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = emptyList(),
                unavailable = false,
                selectionSlot =
                    SeasonStatisticsService.SelectionSlotInfo(
                        roleKey = "player",
                        participationStatus = SlotParticipationStatus.CONFIRMED,
                    ),
            )

        assertEquals("selected", cell.status)
        assertEquals("Comédien·ne", cell.label)
        assertEquals("player", cell.roleKey)
        assertEquals("Comédien·ne", service.eventCellExportLabel(cell))
    }

    @Test
    fun `buildEventCell maps pending selection to pending with tooltip`() {
        val event = sampleEvent()
        val cell =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = emptyList(),
                unavailable = false,
                selectionSlot =
                    SeasonStatisticsService.SelectionSlotInfo(
                        roleKey = "mc",
                        participationStatus = SlotParticipationStatus.PENDING,
                    ),
            )

        assertEquals("pending", cell.status)
        assertEquals("MC", cell.label)
        assertEquals("mc", cell.roleKey)
        assertTrue(cell.tooltip?.contains("attente") == true)
        assertEquals("MC", service.eventCellExportLabel(cell))
    }

    @Test
    fun `buildEventCell declined takes priority over selection`() {
        val event = sampleEvent()
        val decline =
            mock<EventCompositionDeclineEntity>().also {
                whenever(it.seasonParticipantId).thenReturn(participantId)
                whenever(it.eventParticipantId).thenReturn(null)
                whenever(it.roleKey).thenReturn("player")
            }
        val cell =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = listOf(decline),
                participantId = participantId,
                availableRoleKeys = listOf("player"),
                unavailable = false,
                selectionSlot =
                    SeasonStatisticsService.SelectionSlotInfo(
                        roleKey = "mc",
                        participationStatus = SlotParticipationStatus.CONFIRMED,
                    ),
            )

        assertEquals("declined", cell.status)
        assertEquals("Retrait (J)", cell.label)
        assertEquals("player", cell.roleKey)
    }

    @Test
    fun `buildEventCell uses gendered role label for linked participant`() {
        val event = sampleEvent()
        val cell =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = emptyList(),
                unavailable = false,
                selectionSlot =
                    SeasonStatisticsService.SelectionSlotInfo(
                        roleKey = "player",
                        participationStatus = SlotParticipationStatus.CONFIRMED,
                    ),
                gender = MemberGender.FEMALE,
            )

        assertEquals("Comédienne", cell.label)
        assertEquals("Comédienne", cell.tooltip)
    }

    @Test
    fun `buildEventCell maps availability and unavailable and neutral`() {
        val event = sampleEvent()
        val available =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = listOf("player"),
                unavailable = false,
                selectionSlot = null,
            )
        assertEquals("available", available.status)
        assertEquals("Dispo (J)", available.label)

        val unavailable =
            service.buildEventCell(
                event = event,
                validated = true,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = emptyList(),
                unavailable = true,
                selectionSlot = null,
            )
        assertEquals("unavailable", unavailable.status)
        assertEquals("Non dispo", unavailable.label)

        val neutral =
            service.buildEventCell(
                event = event,
                validated = false,
                declines = emptyList(),
                participantId = participantId,
                availableRoleKeys = emptyList(),
                unavailable = false,
                selectionSlot = null,
            )
        assertEquals("neutral", neutral.status)
        assertEquals("—", neutral.label)
        assertEquals("-", service.eventCellExportLabel(neutral))
    }

    @Test
    fun `loadStatistics exposes eventCellDetails aligned with eventCells export`() {
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
        val event = sampleEvent()
        val composition =
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = Instant.parse("2026-03-01T12:00:00Z"),
            )
        val slot =
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.PENDING,
            )

        whenever(seasonRepository.findById(seasonId)).thenReturn(Optional.of(season))
        whenever(seasonParticipantRepository.findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE))
            .thenReturn(listOf(participant))
        whenever(eventRepository.findNonArchivedBySeasonId(seasonId)).thenReturn(listOf(event))
        whenever(compositionRepository.findByEventIdIn(any())).thenReturn(listOf(composition))
        whenever(slotRepository.findByEventIdIn(any())).thenReturn(listOf(slot))
        whenever(declineRepository.findByEventIdIn(any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_IdIn(any())).thenReturn(emptyList())

        val result = service.loadStatistics(seasonId, principal)
        val row = result.rows.first()
        val detail = row.eventCellDetails[eventId]!!

        assertEquals("pending", detail.status)
        assertEquals("Comédien·ne", detail.label)
        assertEquals("Comédien·ne", row.eventCells[eventId])
        assertTrue(detail.tooltip?.contains("attente") == true)
    }

    private fun sampleEvent(): EventEntity =
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
}
