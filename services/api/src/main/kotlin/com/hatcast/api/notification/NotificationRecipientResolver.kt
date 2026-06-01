package com.hatcast.api.notification

import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.EventRosterService
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class NotificationRecipientResolver(
    private val eventRosterService: EventRosterService,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val slotRepository: EventCompositionSlotRepository,
) {
    fun resolveConcernedRosterRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        return roster
            .mapNotNull { row ->
                row.userId?.let { userId ->
                    NotificationRecipient(userId = userId, displayName = row.displayName)
                }
            }.distinctBy { it.userId }
    }

    fun resolveValidatedAssigneeRecipients(eventId: UUID): List<NotificationRecipient> {
        val participantIds =
            slotRepository
                .findByEventId(eventId)
                .filter { it.hasAssignee() }
                .mapNotNull { it.assignedParticipantId() }
        return resolveAssigneeRecipients(participantIds)
    }

    fun resolveAssigneeRecipients(assigneeParticipantIds: List<UUID>): List<NotificationRecipient> {
        if (assigneeParticipantIds.isEmpty()) {
            return emptyList()
        }
        val seasonParticipants = seasonParticipantRepository.findAllById(assigneeParticipantIds)
        val foundSeasonIds = seasonParticipants.map { it.id }.toSet()
        val eventParticipantIds = assigneeParticipantIds.filter { it !in foundSeasonIds }
        val eventParticipants =
            if (eventParticipantIds.isEmpty()) {
                emptyList()
            } else {
                eventParticipantRepository.findAllById(eventParticipantIds)
            }

        val recipients = mutableListOf<NotificationRecipient>()
        for (participant in seasonParticipants) {
            participant.user?.id?.let { userId ->
                recipients.add(NotificationRecipient(userId = userId, displayName = participant.displayName))
            }
        }
        for (participant in eventParticipants) {
            participant.user?.id?.let { userId ->
                recipients.add(NotificationRecipient(userId = userId, displayName = participant.displayName))
            }
        }
        return recipients.distinctBy { it.userId }
    }
}
