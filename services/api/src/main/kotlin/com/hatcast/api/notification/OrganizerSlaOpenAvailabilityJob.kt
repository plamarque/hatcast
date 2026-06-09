package com.hatcast.api.notification

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
import java.util.UUID

@Component
class OrganizerSlaOpenAvailabilityJob(
    private val eventRepository: EventRepository,
    private val recipientResolver: NotificationRecipientResolver,
    private val reminderMarkService: NotificationReminderMarkService,
    private val dispatcher: NotificationDispatcher,
    @Value("\${hatcast.notification.organizer-sla-horizon-days:30}") private val horizonDays: Int,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(
        cron = "\${hatcast.notification.organizer-sla-reminder-cron:0 15 9 * * *}",
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
                        log.info("organizer_sla_open_availability_sent count={}", contexts.size)
                    }
                },
            )
        }
    }

    fun processRemindersAt(reference: Instant): Int {
        val contexts = buildDispatchContexts(reference)
        contexts.forEach { dispatcher.dispatch(it) }
        return contexts.size
    }

    private fun buildDispatchContexts(reference: Instant): List<NotificationDispatchContext> {
        val zone = EventService.AGENDA_ZONE
        val refDate = reference.atZone(zone).toLocalDate()
        val fromInclusive = refDate.atStartOfDay(zone).toInstant()
        val toExclusive = refDate.plusDays(horizonDays + 1L).atStartOfDay(zone).toInstant()
        val candidates = eventRepository.findDraftEventsStartingBetween(fromInclusive, toExclusive)
        val civilDate = refDate
        val result = mutableListOf<NotificationDispatchContext>()
        for (event in candidates) {
            val recipients =
                recipientResolver.resolveEventAndSeasonOrganizerRecipients(
                    eventId = event.id,
                    seasonId = event.season.id,
                )
            for (recipient in recipients) {
                val userId = recipient.userId ?: continue
                val claimed =
                    reminderMarkService.tryClaimPeriodicReminderMark(
                        intent = NotificationIntent.SLA_OPEN_AVAILABILITY,
                        eventId = event.id,
                        userId = userId,
                        civilDate = civilDate,
                    )
                if (!claimed) {
                    continue
                }
                result +=
                    slaContext(
                        eventId = event.id,
                        seasonId = event.season.id,
                        troupeId = event.season.troupe.id,
                        userId = userId,
                    )
            }
        }
        return result
    }

    private fun slaContext(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        userId: UUID,
    ): NotificationDispatchContext =
        NotificationDispatchContext(
            intent = NotificationIntent.SLA_OPEN_AVAILABILITY,
            eventId = eventId,
            seasonId = seasonId,
            troupeId = troupeId,
            recipientUserIds = listOf(userId),
        )
}
