package com.hatcast.api.notification

import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.composition.assignedParticipantId
import com.hatcast.api.composition.hasAssignee
import com.hatcast.api.event.EventRepository
import com.hatcast.api.event.RoleTemplates
import com.hatcast.api.organizer.EventOrganizerRepository
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.EventRosterService
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.dto.EventRosterParticipantDto
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class NotificationRecipientResolver(
    private val eventRosterService: EventRosterService,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val availabilityRepository: EventAvailabilityRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val eventOrganizerRepository: EventOrganizerRepository,
    private val seasonOrganizerRepository: SeasonOrganizerRepository,
    private val troupeMembershipRepository: TroupeMembershipRepository,
    private val eventRepository: EventRepository,
) {
    fun resolveSeasonOrganizerRecipients(
        seasonId: UUID,
        actorUserId: UUID? = null,
    ): List<NotificationRecipient> {
        val seasonOrganizers =
            seasonOrganizerRepository
                .findBySeason_IdOrderByGrantedAtAsc(seasonId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        return excludeActor(seasonOrganizers, actorUserId)
    }

    fun resolveEventOrganizerRecipients(
        eventId: UUID,
        actorUserId: UUID? = null,
    ): List<NotificationRecipient> {
        val eventOrganizers =
            eventOrganizerRepository
                .findByEvent_IdOrderByGrantedAtAsc(eventId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        return excludeActor(eventOrganizers, actorUserId)
    }

    fun resolveEventAndSeasonOrganizerRecipients(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID? = null,
    ): List<NotificationRecipient> {
        val eventOrganizers =
            eventOrganizerRepository
                .findByEvent_IdOrderByGrantedAtAsc(eventId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        val seasonOrganizers =
            seasonOrganizerRepository
                .findBySeason_IdOrderByGrantedAtAsc(seasonId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        return excludeActor((eventOrganizers + seasonOrganizers).distinctBy { it.userId }, actorUserId)
    }

    fun resolveOrganizerCascadeRecipients(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID? = null,
    ): List<NotificationRecipient> {
        val eventOrganizers =
            eventOrganizerRepository
                .findByEvent_IdOrderByGrantedAtAsc(eventId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        if (eventOrganizers.isNotEmpty()) {
            return excludeActor(eventOrganizers, actorUserId)
        }
        val seasonOrganizers =
            seasonOrganizerRepository
                .findBySeason_IdOrderByGrantedAtAsc(seasonId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        if (seasonOrganizers.isNotEmpty()) {
            return excludeActor(seasonOrganizers, actorUserId)
        }
        val troupeAdmins =
            troupeMembershipRepository
                .findActiveTroupeAdminsByTroupeId(troupeId)
                .mapNotNull { membership ->
                    membership.user?.id?.let { userId ->
                        NotificationRecipient(
                            userId = userId,
                            displayName = membership.displayName.ifBlank { membership.user?.displayName.orEmpty() },
                        )
                    }
                }
        return excludeActor(troupeAdmins, actorUserId)
    }

    fun resolveOrganizerCircleRecipients(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID? = null,
    ): List<NotificationRecipient> {
        val eventOrganizers =
            eventOrganizerRepository
                .findByEvent_IdOrderByGrantedAtAsc(eventId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        val seasonOrganizers =
            seasonOrganizerRepository
                .findBySeason_IdOrderByGrantedAtAsc(seasonId)
                .mapNotNull { organizer -> organizer.toLinkedRecipient() }
        val troupeAdmins =
            troupeMembershipRepository
                .findActiveTroupeAdminsByTroupeId(troupeId)
                .mapNotNull { membership ->
                    membership.user?.id?.let { userId ->
                        NotificationRecipient(
                            userId = userId,
                            displayName = membership.displayName.ifBlank { membership.user?.displayName.orEmpty() },
                        )
                    }
                }
        return excludeActor((eventOrganizers + seasonOrganizers + troupeAdmins).distinctBy { it.userId }, actorUserId)
    }

    fun resolveConcernedRosterRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        return roster
            .mapNotNull { row -> row.toLinkedRecipient() }
            .distinctBy { it.dedupeKey() }
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
        // Resolve by userId so that season-participant/event-participant ID mismatches don't leak assignees.
        val assignedUserIds = resolveAssigneeRecipients(assignedParticipantIds).map { it.userId }.toSet()
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        return roster
            .mapNotNull { row ->
                if (row.userId != null && row.userId !in assignedUserIds) {
                    NotificationRecipient(userId = row.userId, displayName = row.displayName)
                } else {
                    null
                }
            }.distinctBy { it.dedupeKey() }
    }

    fun resolveConfirmedAssigneeRecipients(eventId: UUID): List<NotificationRecipient> {
        val participantIds =
            slotRepository
                .findByEventId(eventId)
                .filter { it.hasAssignee() && it.participationStatus == com.hatcast.api.composition.SlotParticipationStatus.CONFIRMED }
                .mapNotNull { it.assignedParticipantId() }
        return resolveAssigneeRecipients(participantIds)
    }

    fun resolveTeamCompleteMemberRecipients(eventId: UUID): List<NotificationRecipient> {
        val event = eventRepository.findById(eventId).orElse(null) ?: return emptyList()
        val roleSlots = RoleTemplates.normalize(event.roleSlots)
        val slots = slotRepository.findByEventId(eventId)
        val byPosition = slots.associateBy { it.roleKey to it.slotIndex }
        val completeAssigneeParticipantIds =
            requiredPositions(roleSlots).mapNotNull { (roleKey, slotIndex) ->
                val slot = byPosition[roleKey to slotIndex] ?: return@mapNotNull null
                if (!slot.hasAssignee()) return@mapNotNull null
                if (slot.participationStatus == SlotParticipationStatus.DECLINED) return@mapNotNull null
                if (slot.participationStatus == SlotParticipationStatus.CONFIRMED || slot.waived) {
                    slot.assignedParticipantId()
                } else {
                    null
                }
            }
        val assigneeRecipients =
            resolveAssigneeRecipients(completeAssigneeParticipantIds)
                .mapNotNull { recipient -> recipient.userId?.let { NotificationRecipient(userId = it, displayName = recipient.displayName) } }
        val organizerRecipients =
            eventOrganizerRepository
                .findByEvent_IdOrderByGrantedAtAsc(eventId)
                .map { organizer ->
                    NotificationRecipient(userId = organizer.user.id, displayName = organizer.user.displayName.orEmpty())
                }
        return (organizerRecipients + assigneeRecipients).distinctBy { it.userId }
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
            participant.toRecipient()?.let { recipients.add(it) }
        }
        for (participant in eventParticipants) {
            participant.toRecipient()?.let { recipients.add(it) }
        }
        return recipients.distinctBy { it.dedupeKey() }
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
            .mapNotNull { row -> row.toLinkedRecipient() }
            .distinctBy { it.dedupeKey() }

    fun resolveAnsweredAvailabilityRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> =
        answeredRosterRows(seasonId, eventId)
            .mapNotNull { row -> row.toReachableRecipient() }
            .distinctBy { it.dedupeKey() }

    fun resolveCompositionEngagedRecipients(eventId: UUID): List<NotificationRecipient> {
        val slotParticipantIds =
            slotRepository
                .findByEventId(eventId)
                .filter {
                    it.hasAssignee() &&
                        (
                            it.participationStatus == SlotParticipationStatus.PENDING ||
                                it.participationStatus == SlotParticipationStatus.CONFIRMED
                        )
                }.mapNotNull { it.assignedParticipantId() }
        val declineParticipantIds =
            declineRepository.findByEventIdOrderByDeclinedAtDesc(eventId).mapNotNull { decline ->
                decline.seasonParticipantId ?: decline.eventParticipantId
            }
        return resolveAssigneeRecipients((slotParticipantIds + declineParticipantIds).distinct())
    }

    fun resolveEngagedEventRosterRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> {
        val answered = resolveAnsweredAvailabilityRecipients(seasonId, eventId)
        val compositionEngaged = resolveCompositionEngagedRecipients(eventId)
        return (answered + compositionEngaged).distinctBy { it.dedupeKey() }
    }

    fun resolveEventArchivedRecipients(
        seasonId: UUID,
        eventId: UUID,
    ): List<NotificationRecipient> =
        resolveEngagedEventRosterRecipients(seasonId, eventId)
            .filter { recipient -> isActiveEngagedMember(seasonId, eventId, recipient) }

    private fun isActiveEngagedMember(
        seasonId: UUID,
        eventId: UUID,
        recipient: NotificationRecipient,
    ): Boolean {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = true)
        val rosterRow =
            roster.firstOrNull { row ->
                (recipient.userId != null && row.userId == recipient.userId) ||
                    (
                        recipient.userId == null &&
                            recipient.email != null &&
                            row.email.equals(recipient.email, ignoreCase = true)
                    )
            } ?: return false
        val participantId = rosterRow.seasonParticipantId ?: rosterRow.eventParticipantId ?: return false
        seasonParticipantRepository.findById(participantId).orElse(null)?.let { seasonParticipant ->
            if (seasonParticipant.status != ParticipantStatus.ACTIVE) return false
            seasonParticipant.troupeMembership?.let { membership ->
                if (membership.status != TroupeMembershipStatus.ACTIVE) return false
            }
            return recipient.userId?.let { resolveEligibleSeasonParticipantUserId(seasonParticipant) == it }
                ?: seasonParticipant.normalizedEmail?.equals(recipient.email, ignoreCase = true) == true
        }
        eventParticipantRepository.findById(participantId).orElse(null)?.let { eventParticipant ->
            if (eventParticipant.status != ParticipantStatus.ACTIVE) return false
            return recipient.userId?.let { resolveEligibleEventParticipantUserId(eventParticipant) == it }
                ?: eventParticipant.normalizedEmail?.equals(recipient.email, ignoreCase = true) == true
        }
        return false
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

    private fun unknownRosterRows(
        seasonId: UUID,
        eventId: UUID,
    ): List<EventRosterParticipantDto> {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = false)
        val index = buildAvailabilityIndex(eventId)
        return roster.filter { row -> availabilityStatus(row, index) == AvailabilityStatusMapper.UNKNOWN }
    }

    private fun answeredRosterRows(
        seasonId: UUID,
        eventId: UUID,
    ): List<EventRosterParticipantDto> {
        val roster = eventRosterService.buildRoster(seasonId, eventId, includeEmail = true)
        val index = buildAvailabilityIndex(eventId)
        return roster.filter { row ->
            availabilityStatus(row, index) in
                setOf(AvailabilityStatusMapper.AVAILABLE, AvailabilityStatusMapper.UNAVAILABLE)
        }
    }

    private fun excludeActor(
        recipients: List<NotificationRecipient>,
        actorUserId: UUID?,
    ): List<NotificationRecipient> =
        recipients
            .distinctBy { it.userId }
            .filter { recipient -> actorUserId == null || recipient.userId != actorUserId }

    private fun com.hatcast.api.organizer.EventOrganizerEntity.toLinkedRecipient(): NotificationRecipient? =
        user.id.let { userId ->
            NotificationRecipient(userId = userId, displayName = user.displayName.orEmpty())
        }

    private fun com.hatcast.api.organizer.SeasonOrganizerEntity.toLinkedRecipient(): NotificationRecipient? =
        user.id.let { userId ->
            NotificationRecipient(userId = userId, displayName = user.displayName.orEmpty())
        }

    private fun NotificationRecipient.dedupeKey(): String =
        userId?.toString() ?: email?.trim()?.lowercase().orEmpty()

    private fun EventRosterParticipantDto.toLinkedRecipient(): NotificationRecipient? =
        userId?.let { NotificationRecipient(userId = it, displayName = displayName) }

    private fun EventRosterParticipantDto.toReachableRecipient(): NotificationRecipient? =
        when {
            userId != null -> NotificationRecipient(userId = userId, displayName = displayName)
            !email.isNullOrBlank() -> NotificationRecipient(userId = null, displayName = displayName, email = email)
            else -> null
        }

    private fun SeasonParticipantEntity.toRecipient(): NotificationRecipient? =
        user?.id?.let { NotificationRecipient(userId = it, displayName = displayName) }
            ?: normalizedEmail?.takeIf { it.isNotBlank() }?.let {
                NotificationRecipient(userId = null, displayName = displayName, email = it)
            }

    private fun EventParticipantEntity.toRecipient(): NotificationRecipient? =
        when {
            user?.id != null -> NotificationRecipient(userId = user!!.id, displayName = displayName)
            seasonParticipant?.user?.id != null ->
                NotificationRecipient(userId = seasonParticipant!!.user!!.id, displayName = displayName)
            !normalizedEmail.isNullOrBlank() ->
                NotificationRecipient(userId = null, displayName = displayName, email = normalizedEmail)
            else -> null
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

    private fun requiredPositions(roleSlots: Map<String, Int>): List<Pair<String, Int>> =
        roleSlots.flatMap { (roleKey, count) ->
            (0 until count).map { roleKey to it }
        }
}
