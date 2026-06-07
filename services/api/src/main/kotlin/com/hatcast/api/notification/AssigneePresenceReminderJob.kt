package com.hatcast.api.notification

import com.hatcast.api.agenda.AgendaTimeBoundary
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.EventService
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import java.time.Instant
import java.util.UUID

@Component
class AssigneePresenceReminderJob(
    private val eventRepository: EventRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val reminderMarkService: NotificationReminderMarkService,
    private val dispatcher: NotificationDispatcher,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "\${hatcast.notification.reminder-cron:0 0 8 * * *}", zone = "Europe/Paris")
    @Transactional
    fun runDailyReminders() {
        val now = Instant.now()
        val contexts = buildDispatchContexts(now)
        if (contexts.isNotEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                override fun afterCommit() {
                    contexts.forEach { dispatcher.dispatch(it) }
                    log.info("assignee_presence_reminders_sent count={}", contexts.size)
                }
            })
        }
    }

    /**
     * Test/integration entry point — dispatches immediately (no afterCommit wrapping).
     * The FETCH JOIN on findValidatedOpenEventsStartingFrom prevents LazyInitializationException
     * on event.season and event.season.troupe.
     */
    fun processRemindersAt(reference: Instant): Int {
        val contexts = buildDispatchContexts(reference)
        contexts.forEach { dispatcher.dispatch(it) }
        return contexts.size
    }

    private fun buildDispatchContexts(reference: Instant): List<NotificationDispatchContext> {
        val fromInclusive = AgendaTimeBoundary.startOfTodayInclusive(EventService.AGENDA_ZONE)
        val candidates = eventRepository.findValidatedOpenEventsStartingFrom(fromInclusive)
        val result = mutableListOf<NotificationDispatchContext>()
        for (event in candidates) {
            val daysUntil = AgendaTimeBoundary.calendarDaysBetween(event.startsAt, reference, EventService.AGENDA_ZONE)
            val window =
                when (daysUntil) {
                    7 -> NotificationReminderWindow.DAYS_7
                    1 -> NotificationReminderWindow.DAYS_1
                    else -> continue
                }
            result += buildEventContexts(event, window)
        }
        return result
    }

    private fun buildEventContexts(
        event: com.hatcast.api.event.EventEntity,
        window: NotificationReminderWindow,
    ): List<NotificationDispatchContext> {
        val confirmedSlots =
            slotRepository
                .findByEventId(event.id)
                .filter {
                    it.hasAssignee() &&
                        it.participationStatus == SlotParticipationStatus.CONFIRMED &&
                        !it.waived
                }
        return confirmedSlots.mapNotNull { slot ->
            val participantId = slot.assignedParticipantId() ?: return@mapNotNull null
            val userId = resolveEligibleReminderUserId(participantId) ?: return@mapNotNull null
            val claimed =
                reminderMarkService.tryClaimReminderMark(
                    intent = NotificationIntent.ASSIGNEE_PRESENCE_REMINDER,
                    eventId = event.id,
                    userId = userId,
                    reminderWindow = window,
                )
            if (!claimed) return@mapNotNull null
            NotificationDispatchContext(
                intent = NotificationIntent.ASSIGNEE_PRESENCE_REMINDER,
                eventId = event.id,
                seasonId = event.season.id,
                troupeId = event.season.troupe.id,
                actorUserId = userId,
                recipientUserIds = listOf(userId),
                roleKey = slot.roleKey,
                slotIndex = slot.slotIndex,
                reminderWindow = window,
            )
        }
    }

    private fun resolveEligibleReminderUserId(participantId: UUID): UUID? {
        seasonParticipantRepository.findById(participantId).orElse(null)?.let { seasonParticipant ->
            return resolveEligibleSeasonParticipantUserId(seasonParticipant)
        }
        eventParticipantRepository.findById(participantId).orElse(null)?.let { eventParticipant ->
            return resolveEligibleEventParticipantUserId(eventParticipant)
        }
        return null
    }

    private fun resolveEligibleSeasonParticipantUserId(seasonParticipant: SeasonParticipantEntity): UUID? {
        if (seasonParticipant.status != ParticipantStatus.ACTIVE) return null
        seasonParticipant.troupeMembership?.let { membership ->
            if (membership.status != TroupeMembershipStatus.ACTIVE) return null
        }
        return seasonParticipant.user?.id
    }

    private fun resolveEligibleEventParticipantUserId(eventParticipant: EventParticipantEntity): UUID? {
        if (eventParticipant.status != ParticipantStatus.ACTIVE) return null
        eventParticipant.seasonParticipant?.let { seasonParticipant ->
            return resolveEligibleSeasonParticipantUserId(seasonParticipant)
        }
        return eventParticipant.user?.id
    }
}
