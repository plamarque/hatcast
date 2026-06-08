package com.hatcast.api.notification

import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.Instant
import java.time.ZoneId
import java.util.UUID

class OrganizerSlaOpenAvailabilityJobTest {
    private val eventRepository: EventRepository = mock()
    private val recipientResolver: NotificationRecipientResolver = mock()
    private val reminderMarkService: NotificationReminderMarkService = mock()
    private val dispatcher: NotificationDispatcher = mock()

    private val job =
        OrganizerSlaOpenAvailabilityJob(
            eventRepository = eventRepository,
            recipientResolver = recipientResolver,
            reminderMarkService = reminderMarkService,
            dispatcher = dispatcher,
            horizonDays = 30,
        )

    @Test
    fun `processRemindersAt dispatches SLA_OPEN_AVAILABILITY for draft events in horizon`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "T", slug = "t")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, title = "S", slug = "s")
        val event =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Draft soon",
                slug = "draft-soon",
                startsAt = Instant.parse("2034-07-01T19:00:00Z"),
                templateType = "cabaret",
                roleSlots = mapOf("player" to 4),
            )
        val adminUserId = UUID.randomUUID()
        val reference = Instant.parse("2034-06-01T08:00:00Z")

        whenever(eventRepository.findDraftEventsStartingBetween(any(), any())).thenReturn(listOf(event))
        whenever(
            recipientResolver.resolveOrganizerCascadeRecipients(event.id, season.id, troupe.id),
        ).thenReturn(listOf(NotificationRecipient(userId = adminUserId, displayName = "Admin")))
        whenever(
            reminderMarkService.tryClaimPeriodicReminderMark(
                intent = NotificationIntent.SLA_OPEN_AVAILABILITY,
                eventId = event.id,
                userId = adminUserId,
                civilDate = reference.atZone(ZoneId.of("Europe/Paris")).toLocalDate(),
            ),
        ).thenReturn(true)

        val count = job.processRemindersAt(reference)

        assertEquals(1, count)
        verify(dispatcher).dispatch(
            org.mockito.kotlin.argThat { ctx ->
                ctx.intent == NotificationIntent.SLA_OPEN_AVAILABILITY &&
                    ctx.eventId == event.id &&
                    ctx.recipientUserIds == listOf(adminUserId)
            },
        )
    }

    @Test
    fun `processRemindersAt skips when dedupe mark not claimed`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "T", slug = "t")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, title = "S", slug = "s")
        val event =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Draft soon",
                slug = "draft-soon",
                startsAt = Instant.parse("2034-07-01T19:00:00Z"),
                templateType = "cabaret",
                roleSlots = mapOf("player" to 4),
            )
        val adminUserId = UUID.randomUUID()
        val reference = Instant.parse("2034-06-01T08:00:00Z")

        whenever(eventRepository.findDraftEventsStartingBetween(any(), any())).thenReturn(listOf(event))
        whenever(
            recipientResolver.resolveOrganizerCascadeRecipients(event.id, season.id, troupe.id),
        ).thenReturn(listOf(NotificationRecipient(userId = adminUserId, displayName = "Admin")))
        whenever(
            reminderMarkService.tryClaimPeriodicReminderMark(
                intent = org.mockito.kotlin.eq(NotificationIntent.SLA_OPEN_AVAILABILITY),
                eventId = org.mockito.kotlin.eq(event.id),
                userId = org.mockito.kotlin.eq(adminUserId),
                civilDate = org.mockito.kotlin.any(),
            ),
        ).thenReturn(false)

        val count = job.processRemindersAt(reference)

        assertEquals(0, count)
        verify(dispatcher, never()).dispatch(any())
    }
}
