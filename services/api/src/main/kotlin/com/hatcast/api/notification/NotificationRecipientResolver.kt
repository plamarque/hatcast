package com.hatcast.api.notification

import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.EventRosterService
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.dto.EventRosterParticipantDto
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class NotificationRecipientResolver(
    private val eventRosterService: EventRosterService,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val availabilityRepository: EventAvailabilityRepository,
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

    fun resolveNonAssignedRosterRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> {
        val assignedParticipantIds =
            slotRepository
                .findByEventId(eventId)
                .filter { it.hasAssignee() }
                .mapNotNull { it.assignedParticipantId() }
                .toSet()
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        return roster
            .mapNotNull { row ->
                val participantId = row.seasonParticipantId ?: row.eventParticipantId
                if (row.userId != null && participantId != null && participantId !in assignedParticipantIds) {
                    NotificationRecipient(userId = row.userId, displayName = row.displayName)
                } else {
                    null
                }
            }.distinctBy { it.userId }
    }

    fun resolveConfirmedAssigneeRecipients(eventId: UUID): List<NotificationRecipient> {
        val participantIds =
            slotRepository
                .findByEventId(eventId)
                .filter { it.hasAssignee() && it.participationStatus == com.hatcast.api.composition.SlotParticipationStatus.CONFIRMED }
                .mapNotNull { it.assignedParticipantId() }
        return resolveAssigneeRecipients(participantIds)
    }

    fun resolveSingleAssigneeRecipient(participantId: UUID): List<NotificationRecipient> =
        resolveAssigneeRecipients(listOf(participantId))

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

    fun resolveSubjectRecipient(subjectUserId: UUID): List<NotificationRecipient> =
        listOf(NotificationRecipient(userId = subjectUserId, displayName = ""))

    fun resolveUnknownAvailabilityParticipantIds(
        seasonId: UUID,
        eventId: UUID,
    ): Set<UUID> =
        unknownRosterRows(seasonId, eventId)
            .mapNotNull { row -> row.seasonParticipantId ?: row.eventParticipantId }
            .toSet()

    fun resolveUnknownAvailabilityRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> =
        unknownRosterRows(seasonId, eventId)
            .mapNotNull { row ->
                row.userId?.let { userId ->
                    NotificationRecipient(userId = userId, displayName = row.displayName)
                }
            }.distinctBy { it.userId }

    private fun unknownRosterRows(
        seasonId: UUID,
        eventId: UUID,
    ): List<EventRosterParticipantDto> {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        val index = buildAvailabilityIndex(eventId)
        return roster.filter { row -> availabilityStatus(row, index) == AvailabilityStatusMapper.UNKNOWN }
    }

    private data class AvailabilityIndex(
        private val byUserId: Map<UUID, EventAvailabilityEntity>,
        private val bySeasonParticipantId: Map<UUID, EventAvailabilityEntity>,
        private val byEventParticipantId: Map<UUID, EventAvailabilityEntity>,
    ) {
        fun forParticipant(
            participantId: UUID,
            userId: UUID?,
        ): EventAvailabilityEntity? =
            when {
                userId != null -> byUserId[userId]
                else ->
                    bySeasonParticipantId[participantId]
                        ?: byEventParticipantId[participantId]
            }
    }

    private fun buildAvailabilityIndex(eventId: UUID): AvailabilityIndex {
        val rows = availabilityRepository.findByEvent_Id(eventId)
        return AvailabilityIndex(
            byUserId = rows.mapNotNull { row -> row.user?.id?.let { it to row } }.toMap(),
            bySeasonParticipantId =
                rows.mapNotNull { row ->
                    row.seasonParticipant?.id?.let { it to row }
                }.toMap(),
            byEventParticipantId =
                rows.mapNotNull { row ->
                    row.eventParticipant?.id?.let { it to row }
                }.toMap(),
        )
    }

    private fun availabilityStatus(
        row: EventRosterParticipantDto,
        index: AvailabilityIndex,
    ): String {
        val participantId = row.seasonParticipantId ?: row.eventParticipantId ?: return AvailabilityStatusMapper.UNKNOWN
        val availability = index.forParticipant(participantId, row.userId)
        return availability?.let { AvailabilityStatusMapper.toApi(it.status) }
            ?: AvailabilityStatusMapper.UNKNOWN
    }
}
