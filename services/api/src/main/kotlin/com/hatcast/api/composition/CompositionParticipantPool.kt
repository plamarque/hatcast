package com.hatcast.api.composition

import com.hatcast.api.availability.AvailabilityRoleRules
import com.hatcast.api.availability.AvailabilityStatusMapper
import com.hatcast.api.availability.EventAvailabilityEntity
import com.hatcast.api.availability.StoredAvailabilityStatus
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import java.util.UUID

data class CompositionEligibleParticipant(
    val participantId: UUID,
    val userId: UUID?,
    val displayName: String,
    val source: CompositionParticipantSource,
)

object CompositionParticipantPool {
    fun loadEligibleParticipants(
        seasonId: UUID,
        eventId: UUID,
        seasonParticipantRepository: SeasonParticipantRepository,
        eventParticipantRepository: EventParticipantRepository,
    ): List<CompositionEligibleParticipant> {
        val seasonRows =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val byId = linkedMapOf<UUID, CompositionEligibleParticipant>()
        val seenUserIds = mutableSetOf<UUID>()

        for (row in seasonRows) {
            byId[row.id] =
                CompositionEligibleParticipant(
                    row.id,
                    row.user?.id,
                    row.displayName,
                    CompositionParticipantSource.SEASON,
                )
            row.user?.id?.let { seenUserIds.add(it) }
        }

        val eventRows =
            eventParticipantRepository.findByEvent_IdAndStatusOrderByDisplayNameAsc(
                eventId,
                ParticipantStatus.ACTIVE,
            )
        for (row in eventRows) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            val userId = row.user?.id
            if (userId != null && userId in seenUserIds) {
                continue
            }
            byId[row.id] =
                CompositionEligibleParticipant(
                    row.id,
                    userId,
                    row.displayName,
                    CompositionParticipantSource.EVENT,
                )
            userId?.let { seenUserIds.add(it) }
        }

        return byId.values.sortedBy { it.displayName.lowercase() }
    }

    fun buildRolePool(
        eligible: List<CompositionEligibleParticipant>,
        availabilityByUserId: Map<UUID, EventAvailabilityEntity>,
        roleKey: String,
        excluded: Set<UUID>,
    ): List<CompositionEligibleParticipant> =
        eligible.filter { row ->
            if (row.participantId in excluded) {
                return@filter false
            }
            val availability = row.userId?.let { availabilityByUserId[it] } ?: return@filter false
            if (availability.status != StoredAvailabilityStatus.AVAILABLE) {
                return@filter false
            }
            val apiStatus = AvailabilityStatusMapper.toApi(availability.status)
            AvailabilityRoleRules.isCandidateForRole(
                apiStatus,
                availability.roleKeys,
                roleKey,
            )
        }
}
