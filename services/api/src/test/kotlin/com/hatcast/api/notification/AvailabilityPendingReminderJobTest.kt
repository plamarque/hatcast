package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventService
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.time.LocalDate
import java.time.ZonedDateTime
import java.util.UUID

class AvailabilityPendingReminderJobTest {
    private val eventRepository: EventRepository = mock()
    private val recipientResolver: NotificationRecipientResolver = mock()
    private val reminderMarkService: NotificationReminderMarkService = mock()
    private val dispatcher: NotificationDispatcher = mock()

    private val job =
        AvailabilityPendingReminderJob(
            eventRepository = eventRepository,
            recipientResolver = recipientResolver,
            reminderMarkService = reminderMarkService,
            dispatcher = dispatcher,
            horizonDays = 21,
            cadenceDays = 5,
        )

    @Test
    fun `eligible unknown recipient sends once and dedupes same civil day`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 7, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, zone).toInstant()
        val event = pendingReminderEvent(eventStart)
        val userId = UUID.randomUUID()

        stubHorizonEvents(reference, listOf(event))
        whenever(recipientResolver.resolveUnknownAvailabilityRecipients(event.season.id, event.id)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(
            reminderMarkService.findLatestSentAt(
                NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                event.id,
                userId,
            ),
        ).thenReturn(null)
        whenever(
            reminderMarkService.tryClaimPeriodicReminderMark(
                NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                event.id,
                userId,
                LocalDate.of(2032, 6, 7),
            ),
        ).thenReturn(true)
            .thenReturn(false)

        val firstRun = job.processRemindersAt(reference)
        val secondRun = job.processRemindersAt(reference)

        assertEquals(1, firstRun)
        assertEquals(0, secondRun)
        verify(dispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.AVAILABILITY_PENDING_REMINDER &&
                    recipientUserIds == listOf(userId)
            },
        )
    }

    @Test
    fun `5-day cadence blocks resend before interval elapses`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 10, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, zone).toInstant()
        val event = pendingReminderEvent(eventStart)
        val userId = UUID.randomUUID()
        val lastSent = ZonedDateTime.of(2032, 6, 7, 9, 0, 0, 0, zone).toInstant()

        stubHorizonEvents(reference, listOf(event))
        whenever(recipientResolver.resolveUnknownAvailabilityRecipients(event.season.id, event.id)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(
            reminderMarkService.findLatestSentAt(
                NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                event.id,
                userId,
            ),
        ).thenReturn(lastSent)

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
        verify(reminderMarkService, never()).tryClaimPeriodicReminderMark(any(), any(), any(), any())
    }

    @Test
    fun `5-day cadence allows resend after interval elapses`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 12, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 6, 20, 19, 0, 0, 0, zone).toInstant()
        val event = pendingReminderEvent(eventStart)
        val userId = UUID.randomUUID()
        val lastSent = ZonedDateTime.of(2032, 6, 7, 9, 0, 0, 0, zone).toInstant()

        stubHorizonEvents(reference, listOf(event))
        whenever(recipientResolver.resolveUnknownAvailabilityRecipients(event.season.id, event.id)).thenReturn(
            listOf(NotificationRecipient(userId = userId, displayName = "Alice")),
        )
        whenever(
            reminderMarkService.findLatestSentAt(
                NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                event.id,
                userId,
            ),
        ).thenReturn(lastSent)
        whenever(
            reminderMarkService.tryClaimPeriodicReminderMark(
                any(),
                any(),
                any(),
                eq(LocalDate.of(2032, 6, 12)),
            ),
        ).thenReturn(true)

        val sent = job.processRemindersAt(reference)

        assertEquals(1, sent)
        verify(dispatcher).dispatch(
            argThat { intent == NotificationIntent.AVAILABILITY_PENDING_REMINDER },
        )
    }

    @Test
    fun `event outside horizon is not queried for recipients`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 7, 10, 0, 0, 0, zone).toInstant()

        stubHorizonEvents(reference, emptyList())

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(recipientResolver, never()).resolveUnknownAvailabilityRecipients(any(), any())
        verify(dispatcher, never()).dispatch(any())
    }

    @Test
    fun `no unknown recipients skips dispatch`() {
        val zone = EventService.AGENDA_ZONE
        val reference = ZonedDateTime.of(2032, 6, 7, 10, 0, 0, 0, zone).toInstant()
        val eventStart = ZonedDateTime.of(2032, 6, 14, 19, 0, 0, 0, zone).toInstant()
        val event = pendingReminderEvent(eventStart)

        stubHorizonEvents(reference, listOf(event))
        whenever(recipientResolver.resolveUnknownAvailabilityRecipients(event.season.id, event.id)).thenReturn(
            emptyList(),
        )

        val sent = job.processRemindersAt(reference)

        assertEquals(0, sent)
        verify(dispatcher, never()).dispatch(any())
    }

    private fun stubHorizonEvents(
        reference: Instant,
        events: List<EventEntity>,
    ) {
        val zone = EventService.AGENDA_ZONE
        val refDate = reference.atZone(zone).toLocalDate()
        val fromInclusive = refDate.plusDays(1).atStartOfDay(zone).toInstant()
        val toExclusive = refDate.plusDays(22).atStartOfDay(zone).toInstant()
        whenever(
            eventRepository.findPublishedEventsCollectingAvailability(fromInclusive, toExclusive),
        ).thenReturn(events)
    }

    private fun pendingReminderEvent(startsAt: Instant): EventEntity {
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
