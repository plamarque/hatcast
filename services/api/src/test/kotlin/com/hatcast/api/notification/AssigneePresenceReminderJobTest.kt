package com.hatcast.api.notification

import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventService
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime
import java.util.UUID

class AssigneePresenceReminderJobTest {
    private val eventRepository: EventRepository = mock()
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val seasonParticipantRepository: SeasonParticipantRepository = mock()
    private val eventParticipantRepository: EventParticipantRepository = mock()
    private val reminderMarkService: NotificationReminderMarkService = mock()
    private val dispatcher: NotificationDispatcher = mock()

    private val job =
        AssigneePresenceReminderJob(
            eventRepository = eventRepository,
            slotRepository = slotRepository,
            seasonParticipantRepository = seasonParticipantRepository,
            eventParticipantRepository = eventParticipantRepository,
            reminderMarkService = reminderMarkService,
            dispatcher = dispatcher,
        )

    @Test
    fun `J-7 reminder sends once to confirmed assignee and dedupes repeated runs`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 1,
                    seasonParticipantId = UUID.randomUUID(),
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(participantId)).thenReturn(
            java.util.Optional.of(
                SeasonParticipantEntity(
                    id = participantId,
                    season = event.season,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                ),
            ),
        )
        whenever(
            reminderMarkService.tryClaimReminderMark(
                NotificationIntent.ASSIGNEE_PRESENCE_REMINDER,
                event.id,
                userId,
                NotificationReminderWindow.DAYS_7,
            ),
        ).thenReturn(true)
            .thenReturn(false)

        val firstRun = job.processRemindersAt(reference)
        val secondRun = job.processRemindersAt(reference)

        assertEquals(1, firstRun)
        assertEquals(0, secondRun)
        verify(dispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.ASSIGNEE_PRESENCE_REMINDER &&
                    reminderWindow == NotificationReminderWindow.DAYS_7 &&
                    recipientUserIds == listOf(userId)
            },
        )
    }

    @Test
    fun `J-1 reminder uses REMINDER_1_DAY category window`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 30, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(participantId)).thenReturn(
            java.util.Optional.of(
                SeasonParticipantEntity(
                    id = participantId,
                    season = event.season,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                ),
            ),
        )
        whenever(
            reminderMarkService.tryClaimReminderMark(
                any(),
                any(),
                any(),
                any(),
            ),
        ).thenReturn(true)

        job.processRemindersAt(reference)

        verify(dispatcher).dispatch(
            argThat {
                intent == NotificationIntent.ASSIGNEE_PRESENCE_REMINDER &&
                    reminderWindow == NotificationReminderWindow.DAYS_1
            },
        )
    }

    @Test
    fun `J-7 reminder skips confirmed assignee with inactive troupe membership`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val inactiveMembership =
            TroupeMembershipEntity(
                troupe = event.season.troupe,
                status = TroupeMembershipStatus.INACTIVE,
                baselineRole = TroupeBaselineRole.MEMBER,
                displayName = "Player",
            )

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(participantId)).thenReturn(
            java.util.Optional.of(
                SeasonParticipantEntity(
                    id = participantId,
                    season = event.season,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                    troupeMembership = inactiveMembership,
                ),
            ),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `J-7 reminder skips confirmed assignee with removed season participant`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(participantId)).thenReturn(
            java.util.Optional.of(
                SeasonParticipantEntity(
                    id = participantId,
                    season = event.season,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                    status = ParticipantStatus.REMOVED,
                ),
            ),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `J-7 reminder skips confirmed assignee with removed event participant`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val participantId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    eventParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(participantId)).thenReturn(java.util.Optional.empty())
        whenever(eventParticipantRepository.findById(participantId)).thenReturn(
            java.util.Optional.of(
                EventParticipantEntity(
                    id = participantId,
                    event = event,
                    displayName = "Guest",
                    user = UserEntity(id = userId, email = "g@test.com"),
                    status = ParticipantStatus.REMOVED,
                ),
            ),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `J-7 reminder skips event assignee linked to removed season participant`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val eventParticipantId = UUID.randomUUID()
        val seasonParticipantId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val linkedSeasonParticipant =
            SeasonParticipantEntity(
                id = seasonParticipantId,
                season = event.season,
                displayName = "Player",
                user = UserEntity(id = userId, email = "p@test.com"),
                status = ParticipantStatus.REMOVED,
            )

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    eventParticipantId = eventParticipantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(eventParticipantId)).thenReturn(java.util.Optional.empty())
        whenever(eventParticipantRepository.findById(eventParticipantId)).thenReturn(
            java.util.Optional.of(
                EventParticipantEntity(
                    id = eventParticipantId,
                    event = event,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                    seasonParticipant = linkedSeasonParticipant,
                    status = ParticipantStatus.ACTIVE,
                ),
            ),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `J-7 reminder skips event assignee linked to season participant with inactive membership`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 24, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 7, 1, 19, 0, 0, 0, zone).toInstant()
        val event = reminderEvent(eventStart)
        val eventParticipantId = UUID.randomUUID()
        val seasonParticipantId = UUID.randomUUID()
        val userId = UUID.randomUUID()
        val inactiveMembership =
            TroupeMembershipEntity(
                troupe = event.season.troupe,
                status = TroupeMembershipStatus.INACTIVE,
                baselineRole = TroupeBaselineRole.MEMBER,
                displayName = "Player",
            )
        val linkedSeasonParticipant =
            SeasonParticipantEntity(
                id = seasonParticipantId,
                season = event.season,
                displayName = "Player",
                user = UserEntity(id = userId, email = "p@test.com"),
                troupeMembership = inactiveMembership,
            )

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(
            listOf(
                EventCompositionSlotEntity(
                    eventId = event.id,
                    roleKey = "player",
                    slotIndex = 0,
                    eventParticipantId = eventParticipantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )
        whenever(seasonParticipantRepository.findById(eventParticipantId)).thenReturn(java.util.Optional.empty())
        whenever(eventParticipantRepository.findById(eventParticipantId)).thenReturn(
            java.util.Optional.of(
                EventParticipantEntity(
                    id = eventParticipantId,
                    event = event,
                    displayName = "Player",
                    user = UserEntity(id = userId, email = "p@test.com"),
                    seasonParticipant = linkedSeasonParticipant,
                    status = ParticipantStatus.ACTIVE,
                ),
            ),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimReminderMark(any(), any(), any(), any())
    }

    private fun reminderEvent(startsAt: Instant): EventEntity {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "Troupe", slug = "troupe")
        val season = SeasonEntity(troupe = troupe, slug = "saison", title = "Saison")
        return EventEntity(
            id = UUID.randomUUID(),
            season = season,
            title = "Spectacle",
            slug = "spectacle",
            startsAt = startsAt,
            availabilityOpenedAt = Instant.parse("2032-01-01T00:00:00Z"),
        )
    }
}
