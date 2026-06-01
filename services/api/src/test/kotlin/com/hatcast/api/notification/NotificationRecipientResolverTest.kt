package com.hatcast.api.notification

import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.EventRosterService
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.dto.EventRosterParticipantDto
import com.hatcast.api.participant.dto.EventRosterSource
import com.hatcast.api.participant.ParticipantKind
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import java.util.UUID

class NotificationRecipientResolverTest {
    private val eventRosterService: EventRosterService = mock()
    private val seasonParticipantRepository: SeasonParticipantRepository = mock()
    private val eventParticipantRepository: EventParticipantRepository = mock()
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val availabilityRepository: com.hatcast.api.availability.EventAvailabilityRepository = mock()

    private val resolver =
        NotificationRecipientResolver(
            eventRosterService = eventRosterService,
            seasonParticipantRepository = seasonParticipantRepository,
            eventParticipantRepository = eventParticipantRepository,
            slotRepository = slotRepository,
            availabilityRepository = availabilityRepository,
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
        whenever(eventRosterService.buildRoster(seasonId, eventId, false)).thenReturn(
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
        whenever(eventRosterService.buildRoster(seasonId, eventId, false)).thenReturn(
            listOf(
                EventRosterParticipantDto(
                    seasonParticipantId = assigneeParticipantId,
                    eventParticipantId = null,
                    displayName = "Assignee",
                    email = null,
                    userId = UUID.randomUUID(),
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
}
