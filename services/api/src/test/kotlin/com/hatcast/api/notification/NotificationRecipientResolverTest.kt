package com.hatcast.api.notification

import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.organizer.EventOrganizerEntity
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.SeasonOrganizerEntity
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.EventRosterService
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.dto.EventRosterParticipantDto
import com.hatcast.api.participant.dto.EventRosterSource
import com.hatcast.api.participant.ParticipantKind
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.Optional
import java.util.UUID

class NotificationRecipientResolverTest {
    private val eventRosterService: EventRosterService = mock()
    private val seasonParticipantRepository: SeasonParticipantRepository = mock()
    private val eventParticipantRepository: EventParticipantRepository = mock()
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val availabilityRepository: com.hatcast.api.availability.EventAvailabilityRepository = mock()
    private val declineRepository: com.hatcast.api.composition.EventCompositionDeclineRepository = mock()
    private val eventOrganizerRepository: EventOrganizerRepository = mock()
    private val seasonOrganizerRepository: SeasonOrganizerRepository = mock()
    private val troupeMembershipRepository: TroupeMembershipRepository = mock()
    private val eventRepository: EventRepository = mock()

    private val resolver =
        NotificationRecipientResolver(
            eventRosterService = eventRosterService,
            seasonParticipantRepository = seasonParticipantRepository,
            eventParticipantRepository = eventParticipantRepository,
            slotRepository = slotRepository,
            availabilityRepository = availabilityRepository,
            declineRepository = declineRepository,
            eventOrganizerRepository = eventOrganizerRepository,
            seasonOrganizerRepository = seasonOrganizerRepository,
            troupeMembershipRepository = troupeMembershipRepository,
            eventRepository = eventRepository,
        )

    @Test
    fun `resolveSubjectRecipient returns single linked user`() {
        val userId = UUID.randomUUID()
        val recipients = resolver.resolveSubjectRecipient(userId)
        assertEquals(1, recipients.size)
        assertEquals(userId, recipients[0].userId)
    }

    @Test
    fun `resolveConcernedRosterRecipients keeps linked users only`() {
        val seasonId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        whenever(eventRosterService.buildRoster(org.mockito.kotlin.eq(seasonId), org.mockito.kotlin.eq(eventId), org.mockito.kotlin.any())).thenReturn(
            listOf(
                EventRosterParticipantDto(
                    seasonParticipantId = UUID.randomUUID(),
                    eventParticipantId = null,
                    displayName = "Alice",
                    email = null,
                    userId = userId,
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
                EventRosterParticipantDto(
                    seasonParticipantId = UUID.randomUUID(),
                    eventParticipantId = null,
                    displayName = "NameOnly",
                    email = null,
                    userId = null,
                    kind = ParticipantKind.NAME_ONLY,
                    source = EventRosterSource.SEASON,
                ),
            ),
        )

        val recipients = resolver.resolveConcernedRosterRecipients(seasonId, eventId)

        assertEquals(1, recipients.size)
        assertEquals(userId, recipients.first().userId)
    }

    @Test
    fun `resolveAssigneeRecipients maps participant ids to user accounts`() {
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val seasonParticipant =
            SeasonParticipantEntity(
                id = participantId,
                season = mock(),
                displayName = "Assignee",
                user = com.hatcast.api.user.UserEntity(id = userId, email = "a@test.com"),
            )
        whenever(seasonParticipantRepository.findAllById(listOf(participantId))).thenReturn(listOf(seasonParticipant))
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())

        val recipients = resolver.resolveAssigneeRecipients(listOf(participantId))

        assertEquals(1, recipients.size)
        assertEquals(userId, recipients.first().userId)
    }

    @Test
    fun `resolveValidatedAssigneeRecipients reads composition slots`() {
        val eventId = UUID.randomUUID()
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(participantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = participantId,
                    season = mock(),
                    displayName = "Player",
                    user = com.hatcast.api.user.UserEntity(id = userId, email = "p@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())

        val recipients = resolver.resolveValidatedAssigneeRecipients(eventId)

        assertEquals(1, recipients.size)
        assertEquals(userId, recipients.first().userId)
    }

    @Test
    fun `resolveNonAssignedRosterRecipients excludes assignees and name-only`() {
        val seasonId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val assigneeParticipantId = UUID.randomUUID()
        val assigneeUserId = UUID.randomUUID()
        val rosterUserId = UUID.randomUUID()
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = assigneeParticipantId,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(assigneeParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = assigneeParticipantId,
                    season = mock(),
                    displayName = "Assignee",
                    user = com.hatcast.api.user.UserEntity(id = assigneeUserId, email = "a@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())
        whenever(eventRosterService.buildRoster(org.mockito.kotlin.eq(seasonId), org.mockito.kotlin.eq(eventId), org.mockito.kotlin.any())).thenReturn(
            listOf(
                EventRosterParticipantDto(
                    seasonParticipantId = assigneeParticipantId,
                    eventParticipantId = null,
                    displayName = "Assignee",
                    email = null,
                    userId = assigneeUserId,
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
                EventRosterParticipantDto(
                    seasonParticipantId = UUID.randomUUID(),
                    eventParticipantId = null,
                    displayName = "RosterOnly",
                    email = null,
                    userId = rosterUserId,
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
                EventRosterParticipantDto(
                    seasonParticipantId = UUID.randomUUID(),
                    eventParticipantId = null,
                    displayName = "NameOnly",
                    email = null,
                    userId = null,
                    kind = ParticipantKind.NAME_ONLY,
                    source = EventRosterSource.SEASON,
                ),
            ),
        )

        val recipients = resolver.resolveNonAssignedRosterRecipients(seasonId, eventId)

        assertEquals(1, recipients.size)
        assertEquals(rosterUserId, recipients.first().userId)
    }

    @Test
    fun `resolveConfirmedAssigneeRecipients returns confirmed slots only`() {
        val eventId = UUID.randomUUID()
        val confirmedParticipantId = UUID.randomUUID()
        val pendingParticipantId = UUID.randomUUID()
        val confirmedUserId = UUID.randomUUID()
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = confirmedParticipantId,
                    participationStatus = com.hatcast.api.composition.SlotParticipationStatus.CONFIRMED,
                ),
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 1,
                    seasonParticipantId = pendingParticipantId,
                    participationStatus = com.hatcast.api.composition.SlotParticipationStatus.PENDING,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(confirmedParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = confirmedParticipantId,
                    season = mock(),
                    displayName = "Confirmed",
                    user = com.hatcast.api.user.UserEntity(id = confirmedUserId, email = "c@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())

        val recipients = resolver.resolveConfirmedAssigneeRecipients(eventId)

        assertEquals(1, recipients.size)
        assertEquals(confirmedUserId, recipients.first().userId)
    }

    @Test
    fun `resolveEngagedEventRosterRecipients includes answered availability and pending slot`() {
        val seasonId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val answeredUserId = UUID.randomUUID()
        val answeredParticipantId = UUID.randomUUID()
        val pendingParticipantId = UUID.randomUUID()
        val pendingUserId = UUID.randomUUID()
        whenever(eventRosterService.buildRoster(org.mockito.kotlin.eq(seasonId), org.mockito.kotlin.eq(eventId), org.mockito.kotlin.any())).thenReturn(
            listOf(
                EventRosterParticipantDto(
                    seasonParticipantId = answeredParticipantId,
                    eventParticipantId = null,
                    displayName = "Answered",
                    email = null,
                    userId = answeredUserId,
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
                EventRosterParticipantDto(
                    seasonParticipantId = pendingParticipantId,
                    eventParticipantId = null,
                    displayName = "Pending",
                    email = null,
                    userId = pendingUserId,
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
                EventRosterParticipantDto(
                    seasonParticipantId = UUID.randomUUID(),
                    eventParticipantId = null,
                    displayName = "Unknown",
                    email = null,
                    userId = UUID.randomUUID(),
                    kind = ParticipantKind.MEMBER,
                    source = EventRosterSource.SEASON,
                ),
            ),
        )
        whenever(availabilityRepository.findByEvent_Id(eventId)).thenReturn(
            listOf(
                EventAvailabilityEntity(
                    event = mock(),
                    user = com.hatcast.api.user.UserEntity(id = answeredUserId, email = "a@test.com"),
                    seasonParticipant =
                        SeasonParticipantEntity(
                            id = answeredParticipantId,
                            season = mock(),
                            displayName = "Answered",
                            user = com.hatcast.api.user.UserEntity(id = answeredUserId, email = "a@test.com"),
                        ),
                    status = StoredAvailabilityStatus.AVAILABLE,
                ),
            ),
        )
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = pendingParticipantId,
                    participationStatus = com.hatcast.api.composition.SlotParticipationStatus.PENDING,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(pendingParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = pendingParticipantId,
                    season = mock(),
                    displayName = "Pending",
                    user = com.hatcast.api.user.UserEntity(id = pendingUserId, email = "p@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())
        whenever(declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId)).thenReturn(emptyList())

        val recipients = resolver.resolveEngagedEventRosterRecipients(seasonId, eventId)

        assertEquals(2, recipients.size)
        assertTrue(recipients.any { it.userId == answeredUserId })
        assertTrue(recipients.any { it.userId == pendingUserId })
    }

    @Test
    fun `resolveEngagedEventRosterRecipients includes decline rows`() {
        val seasonId = UUID.randomUUID()
        val eventId = UUID.randomUUID()
        val declineParticipantId = UUID.randomUUID()
        val declineUserId = UUID.randomUUID()
        whenever(eventRosterService.buildRoster(org.mockito.kotlin.eq(seasonId), org.mockito.kotlin.eq(eventId), org.mockito.kotlin.any())).thenReturn(emptyList())
        whenever(availabilityRepository.findByEvent_Id(eventId)).thenReturn(emptyList())
        whenever(slotRepository.findByEventId(eventId)).thenReturn(emptyList())
        whenever(declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId)).thenReturn(
            listOf(
                EventCompositionDeclineEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = declineParticipantId,
                    eventParticipantId = null,
                    declinedByUserId = UUID.randomUUID(),
                    declinedAt = java.time.Instant.now(),
                    note = null,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(declineParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = declineParticipantId,
                    season = mock(),
                    displayName = "Declined",
                    user = com.hatcast.api.user.UserEntity(id = declineUserId, email = "d@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())

        val recipients = resolver.resolveEngagedEventRosterRecipients(seasonId, eventId)

        assertEquals(1, recipients.size)
        assertEquals(declineUserId, recipients.first().userId)
    }

    @Test
    fun `resolveTeamCompleteMemberRecipients unions organizers and complete assignees with dedupe`() {
        val eventId = UUID.randomUUID()
        val assigneeParticipantId = UUID.randomUUID()
        val sharedUserId = UUID.randomUUID()
        val organizerOnlyUserId = UUID.randomUUID()
        val event =
            EventEntity(
                id = eventId,
                season = mock(),
                title = "Team complete",
                slug = "team-complete",
                startsAt = java.time.Instant.now(),
                roleSlots = mapOf("player" to 1),
            )
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = assigneeParticipantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(assigneeParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = assigneeParticipantId,
                    season = mock(),
                    displayName = "Player",
                    user = com.hatcast.api.user.UserEntity(id = sharedUserId, email = "shared@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())
        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(
            listOf(
                EventOrganizerEntity(
                    event = event,
                    user = com.hatcast.api.user.UserEntity(id = sharedUserId, email = "shared@test.com", displayName = "Shared"),
                    grantedAt = java.time.Instant.now(),
                    grantedBy = null,
                ),
                EventOrganizerEntity(
                    event = event,
                    user = com.hatcast.api.user.UserEntity(id = organizerOnlyUserId, email = "orga@test.com", displayName = "Orga"),
                    grantedAt = java.time.Instant.now(),
                    grantedBy = null,
                ),
            ),
        )

        val recipients = resolver.resolveTeamCompleteMemberRecipients(eventId)

        assertEquals(2, recipients.size)
        assertTrue(recipients.any { it.userId == sharedUserId })
        assertTrue(recipients.any { it.userId == organizerOnlyUserId })
    }

    @Test
    fun `resolveTeamCompleteMemberRecipients includes waived assignee without confirmed status`() {
        val eventId = UUID.randomUUID()
        val assigneeParticipantId = UUID.randomUUID()
        val assigneeUserId = UUID.randomUUID()
        val event =
            EventEntity(
                id = eventId,
                season = mock(),
                title = "Waived complete",
                slug = "waived-complete",
                startsAt = java.time.Instant.now(),
                roleSlots = mapOf("player" to 1),
            )
        whenever(eventRepository.findById(eventId)).thenReturn(Optional.of(event))
        whenever(slotRepository.findByEventId(eventId)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = assigneeParticipantId,
                    participationStatus = SlotParticipationStatus.PENDING,
                    waived = true,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findAllById(listOf(assigneeParticipantId))).thenReturn(
            listOf(
                SeasonParticipantEntity(
                    id = assigneeParticipantId,
                    season = mock(),
                    displayName = "Waived",
                    user = com.hatcast.api.user.UserEntity(id = assigneeUserId, email = "waived@test.com"),
                ),
            ),
        )
        whenever(eventParticipantRepository.findAllById(emptyList())).thenReturn(emptyList())
        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(emptyList())

        val recipients = resolver.resolveTeamCompleteMemberRecipients(eventId)

        assertEquals(1, recipients.size)
        assertEquals(assigneeUserId, recipients.first().userId)
    }

    @Test
    fun `resolveOrganizerCascadeRecipients prefers event organizers over season and troupe admin`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val eventOrgaUserId = UUID.randomUUID()
        val seasonOrgaUserId = UUID.randomUUID()
        val adminUserId = UUID.randomUUID()

        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(
            listOf(
                EventOrganizerEntity(
                    event = EventEntity(id = eventId, season = mock(), title = "E", slug = "e", startsAt = mock(), templateType = "cabaret", roleSlots = emptyMap()),
                    user = com.hatcast.api.user.UserEntity(id = eventOrgaUserId, email = "event@test.com"),
                ),
            ),
        )

        val recipients = resolver.resolveOrganizerCascadeRecipients(eventId, seasonId, troupeId)

        assertEquals(1, recipients.size)
        assertEquals(eventOrgaUserId, recipients.first().userId)
        org.mockito.kotlin.verify(seasonOrganizerRepository, org.mockito.kotlin.never())
            .findBySeason_IdOrderByGrantedAtAsc(org.mockito.kotlin.any())
        org.mockito.kotlin.verify(troupeMembershipRepository, org.mockito.kotlin.never())
            .findActiveTroupeAdminsByTroupeId(org.mockito.kotlin.any())
    }

    @Test
    fun `resolveOrganizerCascadeRecipients falls back to season organizers then troupe admins`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val seasonOrgaUserId = UUID.randomUUID()
        val adminUserId = UUID.randomUUID()

        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(emptyList())
        whenever(seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)).thenReturn(
            listOf(
                SeasonOrganizerEntity(
                    season = mock(),
                    user = com.hatcast.api.user.UserEntity(id = seasonOrgaUserId, email = "season@test.com"),
                ),
            ),
        )

        val seasonRecipients = resolver.resolveOrganizerCascadeRecipients(eventId, seasonId, troupeId)
        assertEquals(1, seasonRecipients.size)
        assertEquals(seasonOrgaUserId, seasonRecipients.first().userId)

        whenever(seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)).thenReturn(emptyList())
        whenever(troupeMembershipRepository.findActiveTroupeAdminsByTroupeId(troupeId)).thenReturn(
            listOf(
                TroupeMembershipEntity(
                    troupe = mock(),
                    user = com.hatcast.api.user.UserEntity(id = adminUserId, email = "admin@test.com"),
                    displayName = "Admin",
                    baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                    status = TroupeMembershipStatus.ACTIVE,
                ),
            ),
        )

        val adminRecipients = resolver.resolveOrganizerCascadeRecipients(eventId, seasonId, troupeId)
        assertEquals(1, adminRecipients.size)
        assertEquals(adminUserId, adminRecipients.first().userId)
    }

    @Test
    fun `resolveOrganizerCircleRecipients unions event season and troupe admin with dedupe`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val sharedUserId = UUID.randomUUID()
        val adminOnlyUserId = UUID.randomUUID()

        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(
            listOf(
                EventOrganizerEntity(
                    event = EventEntity(id = eventId, season = mock(), title = "E", slug = "e", startsAt = mock(), templateType = "cabaret", roleSlots = emptyMap()),
                    user = com.hatcast.api.user.UserEntity(id = sharedUserId, email = "shared@test.com"),
                ),
            ),
        )
        whenever(seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)).thenReturn(
            listOf(
                SeasonOrganizerEntity(
                    season = mock(),
                    user = com.hatcast.api.user.UserEntity(id = sharedUserId, email = "shared@test.com"),
                ),
            ),
        )
        whenever(troupeMembershipRepository.findActiveTroupeAdminsByTroupeId(troupeId)).thenReturn(
            listOf(
                TroupeMembershipEntity(
                    troupe = mock(),
                    user = com.hatcast.api.user.UserEntity(id = sharedUserId, email = "shared@test.com"),
                    displayName = "Shared",
                    baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                    status = TroupeMembershipStatus.ACTIVE,
                ),
                TroupeMembershipEntity(
                    troupe = mock(),
                    user = com.hatcast.api.user.UserEntity(id = adminOnlyUserId, email = "admin@test.com"),
                    displayName = "Admin",
                    baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                    status = TroupeMembershipStatus.ACTIVE,
                ),
            ),
        )

        val recipients = resolver.resolveOrganizerCircleRecipients(eventId, seasonId, troupeId)

        assertEquals(2, recipients.size)
        assertTrue(recipients.any { it.userId == sharedUserId })
        assertTrue(recipients.any { it.userId == adminOnlyUserId })
    }

    @Test
    fun `resolveOrganizerCascadeRecipients excludes actor when provided`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val actorUserId = UUID.randomUUID()
        val otherOrgaUserId = UUID.randomUUID()

        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(
            listOf(
                EventOrganizerEntity(
                    event = EventEntity(id = eventId, season = mock(), title = "E", slug = "e", startsAt = mock(), templateType = "cabaret", roleSlots = emptyMap()),
                    user = com.hatcast.api.user.UserEntity(id = actorUserId, email = "actor@test.com"),
                ),
                EventOrganizerEntity(
                    event = EventEntity(id = eventId, season = mock(), title = "E", slug = "e", startsAt = mock(), templateType = "cabaret", roleSlots = emptyMap()),
                    user = com.hatcast.api.user.UserEntity(id = otherOrgaUserId, email = "other@test.com"),
                ),
            ),
        )

        val recipients = resolver.resolveOrganizerCascadeRecipients(eventId, seasonId, troupeId, actorUserId)

        assertEquals(1, recipients.size)
        assertEquals(otherOrgaUserId, recipients.first().userId)
    }

    @Test
    fun `resolveOrganizerCircleRecipients excludes actor when provided`() {
        val eventId = UUID.randomUUID()
        val seasonId = UUID.randomUUID()
        val troupeId = UUID.randomUUID()
        val actorUserId = UUID.randomUUID()

        whenever(eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)).thenReturn(
            listOf(
                EventOrganizerEntity(
                    event = EventEntity(id = eventId, season = mock(), title = "E", slug = "e", startsAt = mock(), templateType = "cabaret", roleSlots = emptyMap()),
                    user = com.hatcast.api.user.UserEntity(id = actorUserId, email = "actor@test.com"),
                ),
            ),
        )
        whenever(seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)).thenReturn(emptyList())
        whenever(troupeMembershipRepository.findActiveTroupeAdminsByTroupeId(troupeId)).thenReturn(emptyList())

        val recipients = resolver.resolveOrganizerCircleRecipients(eventId, seasonId, troupeId, actorUserId)

        assertTrue(recipients.isEmpty())
    }
}
