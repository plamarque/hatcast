package com.hatcast.api.composition

import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.availability.draw.CategoryCompartmentHistoryScope
import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * Counts past validated events where a participant was available for [roleKey] but not selected (19.10).
 */
@Service
class UnfulfilledRoleRequestService(
    private val availabilityRepository: EventAvailabilityRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val declineRepository: EventCompositionDeclineRepository,
    private val seasonParticipantRepository: SeasonParticipantRepository,
    private val eventParticipantRepository: EventParticipantRepository,
    private val compartmentHistory: CategoryCompartmentHistoryScope,
) {
    fun unfulfilledRoleRequestCountByParticipant(
        event: EventEntity,
        roleKey: String,
        participantIds: Collection<UUID>,
        mode: SelectionHistoryMode,
    ): Map<UUID, Int> {
        if (participantIds.isEmpty()) {
            return emptyMap()
        }
        val categorySlug = compartmentHistory.categorySlug(event)
        val identities = identitiesForParticipants(participantIds)
        val userIds = identities.values.mapNotNull { it.userId }.distinct()
        val availabilityRows =
            when (mode) {
                SelectionHistoryMode.OPERATIONAL ->
                    availabilityRepository.findAvailableOnValidatedEventsOperational(
                        seasonId = event.season.id,
                        excludeEventId = event.id,
                        categorySlug = categorySlug,
                        participantIds = participantIds,
                        userIds = userIds,
                    )
                SelectionHistoryMode.RETROSPECTIVE ->
                    availabilityRepository.findAvailableOnValidatedEventsRetrospective(
                        seasonId = event.season.id,
                        beforeEventId = event.id,
                        beforeStartsAt = event.startsAt,
                        beforeCreatedAt = event.createdAt,
                        categorySlug = categorySlug,
                        participantIds = participantIds,
                        userIds = userIds,
                    )
            }
        val candidateRows =
            availabilityRows.mapNotNull { row ->
                val participantId = resolvePoolParticipantId(row, identities) ?: return@mapNotNull null
                if (!AvailabilityRoleRules.isCandidateForRole(
                        AvailabilityStatusMapper.AVAILABLE,
                        row.roleKeys,
                        roleKey,
                    )
                ) {
                    return@mapNotNull null
                }
                CandidateAvailabilityRow(
                    eventId = row.event.id,
                    participantId = participantId,
                    identity = identities[participantId] ?: return@mapNotNull null,
                )
            }
        if (candidateRows.isEmpty()) {
            return participantIds.associateWith { 0 }
        }
        val eventIds = candidateRows.map { it.eventId }.distinct()
        val fulfilledSlots =
            slotRepository.findValidatedAssigneesForRoleOnEvents(eventIds, roleKey)
        val fulfilledIdentitiesByEvent =
            fulfilledSlots
                .groupBy { it.eventId }
                .mapValues { (_, slots) ->
                    CompositionParticipantIdentityResolver.identitiesForSlots(
                        slots,
                        seasonParticipantRepository,
                        eventParticipantRepository,
                    )
                }
        val declinedIdentitiesByEvent =
            identitiesForDeclines(
                declineRepository.findByEventIdIn(eventIds).filter { it.roleKey == roleKey },
            )
        val counts = mutableMapOf<UUID, Int>()
        participantIds.forEach { counts[it] = 0 }
        for (row in candidateRows.distinctBy { it.participantId to it.eventId }) {
            val fulfilledBySlot =
                fulfilledIdentitiesByEvent[row.eventId]
                    ?.values
                    ?.any { assignedIdentity ->
                        row.identity.matchesRoleWith(roleKey, roleKey, assignedIdentity)
                    } == true
            val fulfilledByDecline =
                declinedIdentitiesByEvent[row.eventId]
                    ?.any { declineIdentity ->
                        row.identity.matchesRoleWith(roleKey, roleKey, declineIdentity)
                    } == true
            if (!fulfilledBySlot && !fulfilledByDecline) {
                counts[row.participantId] = (counts[row.participantId] ?: 0) + 1
            }
        }
        return counts
    }

    private fun identitiesForDeclines(
        declines: List<EventCompositionDeclineEntity>,
    ): Map<UUID, List<CompositionParticipantIdentity>> {
        if (declines.isEmpty()) {
            return emptyMap()
        }
        val seasonIds = declines.mapNotNull { it.seasonParticipantId }.toSet()
        val eventParticipantIds = declines.mapNotNull { it.eventParticipantId }.toSet()
        val seasonRowsById =
            if (seasonIds.isEmpty()) {
                emptyMap()
            } else {
                seasonParticipantRepository.findAllById(seasonIds).associateBy { it.id }
            }
        val eventRowsById =
            if (eventParticipantIds.isEmpty()) {
                emptyMap()
            } else {
                eventParticipantRepository.findAllById(eventParticipantIds).associateBy { it.id }
            }
        return declines
            .groupBy { it.eventId }
            .mapValues { (_, rows) ->
                rows.map { decline ->
                    decline.seasonParticipantId?.let { seasonParticipantId ->
                        val row = seasonRowsById[seasonParticipantId]
                        CompositionParticipantIdentity(
                            seasonParticipantId = seasonParticipantId,
                            userId = row?.user?.id ?: row?.troupeMembership?.user?.id,
                        )
                    }
                        ?: decline.eventParticipantId?.let { eventParticipantId ->
                            val row = eventRowsById[eventParticipantId]
                            CompositionParticipantIdentity(
                                seasonParticipantId = row?.seasonParticipant?.id,
                                userId = row?.user?.id,
                            )
                        }
                        ?: CompositionParticipantIdentity(seasonParticipantId = null, userId = null)
                }
            }
    }

    private fun identitiesForParticipants(
        participantIds: Collection<UUID>,
    ): Map<UUID, CompositionParticipantIdentity> {
        val seasonRows =
            seasonParticipantRepository.findAllById(participantIds).associateBy { it.id }
        val eventRows =
            eventParticipantRepository.findAllById(participantIds).associateBy { it.id }
        return participantIds.associateWith { participantId ->
            seasonRows[participantId]?.let { row ->
                CompositionParticipantIdentity(
                    seasonParticipantId = row.id,
                    userId = row.user?.id ?: row.troupeMembership?.user?.id,
                )
            }
                ?: eventRows[participantId]?.let { row ->
                    CompositionParticipantIdentity(
                        seasonParticipantId = row.seasonParticipant?.id,
                        userId = row.user?.id,
                    )
                }
                ?: CompositionParticipantIdentity(seasonParticipantId = participantId, userId = null)
        }
    }

    private fun resolvePoolParticipantId(
        row: EventAvailabilityEntity,
        identities: Map<UUID, CompositionParticipantIdentity>,
    ): UUID? {
        row.seasonParticipant?.id?.let { seasonId ->
            if (seasonId in identities) {
                return seasonId
            }
        }
        row.eventParticipant?.id?.let { eventParticipantId ->
            if (eventParticipantId in identities) {
                return eventParticipantId
            }
        }
        val userId = row.user?.id ?: return null
        return identities.entries.firstOrNull { (_, identity) -> identity.userId == userId }?.key
    }

    private data class CandidateAvailabilityRow(
        val eventId: UUID,
        val participantId: UUID,
        val identity: CompositionParticipantIdentity,
    )
}
