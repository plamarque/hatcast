package com.hatcast.api.notification

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.composition.CompositionLifecycle
import com.hatcast.api.composition.CompositionLifecycleService
import com.hatcast.api.composition.CompositionSnapshot
import com.hatcast.api.composition.CompositionSlotSnapshot
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventService
import com.hatcast.api.event.RoleTemplates
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import java.time.Instant
import java.time.ZoneId
import java.util.UUID

@Component
class CompositionIncompleteReminderJob(
    private val eventRepository: EventRepository,
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val lifecycleService: CompositionLifecycleService,
    private val recipientResolver: NotificationRecipientResolver,
    private val reminderMarkService: NotificationReminderMarkService,
    private val dispatcher: NotificationDispatcher,
    @Value("\${hatcast.notification.composition-incomplete-weekly-cadence-days:7}") private val weeklyCadenceDays: Int,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(
        cron = "\${hatcast.notification.composition-incomplete-reminder-cron:0 30 9 * * MON}",
        zone = "Europe/Paris",
    )
    @Transactional
    fun runWeeklyReminders() {
        val now = Instant.now()
        val contexts = buildWeeklyDispatchContexts(now)
        if (contexts.isNotEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(
                object : TransactionSynchronization {
                    override fun afterCommit() {
                        contexts.forEach { dispatcher.dispatch(it) }
                        log.info("composition_incomplete_weekly_sent count={}", contexts.size)
                    }
                },
            )
        }
    }

    @Scheduled(
        cron = "\${hatcast.notification.composition-incomplete-j7-cron:0 45 9 * * *}",
        zone = "Europe/Paris",
    )
    @Transactional
    fun runDailyJ7Reminders() {
        val now = Instant.now()
        val contexts = buildJ7DispatchContexts(now)
        if (contexts.isNotEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(
                object : TransactionSynchronization {
                    override fun afterCommit() {
                        contexts.forEach { dispatcher.dispatch(it) }
                        log.info("composition_incomplete_j7_sent count={}", contexts.size)
                    }
                },
            )
        }
    }

    fun processWeeklyRemindersAt(reference: Instant): Int {
        val contexts = buildWeeklyDispatchContexts(reference)
        contexts.forEach { dispatcher.dispatch(it) }
        return contexts.size
    }

    fun processJ7RemindersAt(reference: Instant): Int {
        val contexts = buildJ7DispatchContexts(reference)
        contexts.forEach { dispatcher.dispatch(it) }
        return contexts.size
    }

    private fun buildWeeklyDispatchContexts(reference: Instant): List<NotificationDispatchContext> {
        val zone = EventService.AGENDA_ZONE
        val refDate = reference.atZone(zone).toLocalDate()
        val civilDate = refDate
        return buildIncompleteEventContexts(reference, zone) { event, userId ->
            val lastSent =
                reminderMarkService.findLatestSentAt(
                    NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY,
                    event.id,
                    userId,
                )
            if (lastSent != null && !weeklyCadenceElapsed(lastSent, reference, zone)) {
                return@buildIncompleteEventContexts null
            }
            if (
                !reminderMarkService.tryClaimPeriodicReminderMark(
                    intent = NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY,
                    eventId = event.id,
                    userId = userId,
                    civilDate = civilDate,
                )
            ) {
                return@buildIncompleteEventContexts null
            }
            incompleteContext(
                intent = NotificationIntent.COMPOSITION_INCOMPLETE_WEEKLY,
                event = event,
                userId = userId,
            )
        }
    }

    private fun buildJ7DispatchContexts(reference: Instant): List<NotificationDispatchContext> =
        buildIncompleteEventContexts(reference, EventService.AGENDA_ZONE) { event, userId ->
            val daysUntil = AgendaTimeBoundary.calendarDaysBetween(event.startsAt, reference, EventService.AGENDA_ZONE)
            if (daysUntil != 7) {
                return@buildIncompleteEventContexts null
            }
            if (
                !reminderMarkService.tryClaimReminderMark(
                    intent = NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7,
                    eventId = event.id,
                    userId = userId,
                    reminderWindow = NotificationReminderWindow.ONCE,
                )
            ) {
                return@buildIncompleteEventContexts null
            }
            incompleteContext(
                intent = NotificationIntent.COMPOSITION_INCOMPLETE_DAILY_J7,
                event = event,
                userId = userId,
            )
        }

    private fun buildIncompleteEventContexts(
        reference: Instant,
        zone: ZoneId,
        buildContext: (EventEntity, UUID) -> NotificationDispatchContext?,
    ): List<NotificationDispatchContext> {
        val fromInclusive = AgendaTimeBoundary.startOfTodayInclusive(zone)
        val candidates = eventRepository.findValidatedOpenEventsStartingFrom(fromInclusive)
        val result = mutableListOf<NotificationDispatchContext>()
        for (event in candidates) {
            if (!isIncompleteValidatedComposition(event)) {
                continue
            }
            val recipients =
                recipientResolver.resolveOrganizerCascadeRecipients(
                    eventId = event.id,
                    seasonId = event.season.id,
                    troupeId = event.season.troupe.id,
                )
            for (recipient in recipients) {
                val userId = recipient.userId ?: continue
                buildContext(event, userId)?.let { result.add(it) }
            }
        }
        return result
    }

    private fun isIncompleteValidatedComposition(event: EventEntity): Boolean {
        val composition = compositionRepository.findById(event.id).orElse(null) ?: return false
        if (composition.validatedAt == null) {
            return false
        }
        val slots =
            slotRepository.findByEventId(event.id).map { slot ->
                CompositionSlotSnapshot(
                    roleKey = slot.roleKey,
                    slotIndex = slot.slotIndex,
                    participantId = slot.assignedParticipantId(),
                    participationStatus = slot.participationStatus,
                    waived = slot.waived,
                )
            }
        val lifecycle =
            lifecycleService.computeRawLifecycle(
                composition = CompositionSnapshot(validatedAt = composition.validatedAt, publishedAt = composition.publishedAt),
                slots = slots,
                roleSlots = RoleTemplates.normalize(event.roleSlots),
            )
        return lifecycle != CompositionLifecycle.COMPLETE
    }

    private fun weeklyCadenceElapsed(
        lastSent: Instant,
        reference: Instant,
        zone: ZoneId,
    ): Boolean {
        val daysSince = AgendaTimeBoundary.calendarDaysBetween(reference, lastSent, zone)
        return daysSince >= weeklyCadenceDays
    }

    private fun incompleteContext(
        intent: NotificationIntent,
        event: EventEntity,
        userId: UUID,
    ): NotificationDispatchContext =
        NotificationDispatchContext(
            intent = intent,
            eventId = event.id,
            seasonId = event.season.id,
            troupeId = event.season.troupe.id,
            recipientUserIds = listOf(userId),
        )
}
