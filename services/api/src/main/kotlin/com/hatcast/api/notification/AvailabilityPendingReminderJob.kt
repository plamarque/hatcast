package com.hatcast.api.notification

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import java.time.Instant
import java.time.ZoneId

@Component
class AvailabilityPendingReminderJob(
    private val eventRepository: EventRepository,
    private val recipientResolver: NotificationRecipientResolver,
    private val reminderMarkService: NotificationReminderMarkService,
    private val dispatcher: NotificationDispatcher,
    @Value("\${hatcast.notification.availability-pending-horizon-days:21}") private val horizonDays: Int,
    @Value("\${hatcast.notification.availability-pending-cadence-days:5}") private val cadenceDays: Int,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(
        cron = "\${hatcast.notification.availability-pending-reminder-cron:0 0 9 * * *}",
        zone = "Europe/Paris",
    )
    @Transactional
    fun runDailyReminders() {
        val now = Instant.now()
        val contexts = buildDispatchContexts(now)
        if (contexts.isNotEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(
                object : TransactionSynchronization {
                    override fun afterCommit() {
                        contexts.forEach { dispatcher.dispatch(it) }
                        log.info("availability_pending_reminders_sent count={}", contexts.size)
                    }
                },
            )
        }
    }

    /**
     * Test/integration entry point — dispatches immediately (no afterCommit wrapping).
     */
    fun processRemindersAt(reference: Instant): Int {
        val contexts = buildDispatchContexts(reference)
        contexts.forEach { dispatcher.dispatch(it) }
        return contexts.size
    }

    private fun buildDispatchContexts(reference: Instant): List<NotificationDispatchContext> {
        val zone = EventService.AGENDA_ZONE
        val refDate = reference.atZone(zone).toLocalDate()
        val fromInclusive = refDate.plusDays(1).atStartOfDay(zone).toInstant()
        val toExclusive = refDate.plusDays(horizonDays + 1L).atStartOfDay(zone).toInstant()
        val candidates = eventRepository.findPublishedEventsCollectingAvailability(fromInclusive, toExclusive)
        val civilDate = refDate
        val result = mutableListOf<NotificationDispatchContext>()
        for (event in candidates) {
            val recipients =
                recipientResolver.resolveUnknownAvailabilityRecipients(event.season.id, event.id)
            for (recipient in recipients) {
                val userId = recipient.userId
                val lastSent =
                    reminderMarkService.findLatestSentAt(
                        NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                        event.id,
                        userId,
                    )
                if (lastSent != null && !cadenceElapsed(lastSent, reference, zone)) {
                    continue
                }
                val claimed =
                    reminderMarkService.tryClaimPeriodicReminderMark(
                        intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                        eventId = event.id,
                        userId = userId,
                        civilDate = civilDate,
                    )
                if (!claimed) {
                    continue
                }
                result +=
                    NotificationDispatchContext(
                        intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                        eventId = event.id,
                        seasonId = event.season.id,
                        troupeId = event.season.troupe.id,
                        actorUserId = userId,
                        recipientUserIds = listOf(userId),
                    )
            }
        }
        return result
    }

    private fun cadenceElapsed(
        lastSent: Instant,
        reference: Instant,
        zone: ZoneId,
    ): Boolean {
        val daysSince = AgendaTimeBoundary.calendarDaysBetween(reference, lastSent, zone)
        return daysSince >= cadenceDays
    }
}
