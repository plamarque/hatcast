package com.hatcast.api.notification

import com.hatcast.api.composition.CompositionLifecycleService
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
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
import java.util.Optional
import java.util.UUID

class CompositionIncompleteReminderJobTest {
    private val eventRepository: EventRepository = mock()
    private val compositionRepository: EventCompositionRepository = mock()
    private val slotRepository: EventCompositionSlotRepository = mock()
    private val lifecycleService: CompositionLifecycleService = mock()
    private val recipientResolver: NotificationRecipientResolver = mock()
    private val reminderMarkService: NotificationReminderMarkService = mock()
    private val dispatcher: NotificationDispatcher = mock()

    private val job =
        CompositionIncompleteReminderJob(
            eventRepository = eventRepository,
            compositionRepository = compositionRepository,
            slotRepository = slotRepository,
            lifecycleService = lifecycleService,
            recipientResolver = recipientResolver,
            reminderMarkService = reminderMarkService,
            dispatcher = dispatcher,
            weeklyCadenceDays = 7,
        )

    @Test
    fun `processJ7RemindersAt skips complete compositions`() {
        val troupe = TroupeEntity(id = UUID.randomUUID(), name = "T", slug = "t")
        val season = SeasonEntity(id = UUID.randomUUID(), troupe = troupe, title = "S", slug = "s")
        val event =
            EventEntity(
                id = UUID.randomUUID(),
                season = season,
                title = "Show",
                slug = "show",
                startsAt = Instant.parse("2034-07-08T19:00:00Z"),
                templateType = "cabaret",
                roleSlots = mapOf("player" to 4),
            )
        val reference = Instant.parse("2034-07-01T08:00:00Z")
        val composition =
            EventCompositionEntity(
                eventId = event.id,
                validatedAt = Instant.now(),
                publishedAt = Instant.now(),
            )

        whenever(eventRepository.findValidatedOpenEventsStartingFrom(any())).thenReturn(listOf(event))
        whenever(compositionRepository.findById(event.id)).thenReturn(Optional.of(composition))
        whenever(slotRepository.findByEventId(event.id)).thenReturn(emptyList())
        whenever(
            lifecycleService.computeRawLifecycle(any(), any(), any()),
        ).thenReturn(com.hatcast.api.composition.CompositionLifecycle.COMPLETE)

        val count = job.processJ7RemindersAt(reference)

        assertEquals(0, count)
        verify(dispatcher, never()).dispatch(any())
    }
}
