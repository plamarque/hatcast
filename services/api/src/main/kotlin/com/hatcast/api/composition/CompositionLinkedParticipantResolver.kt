package com.hatcast.api.composition

import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.troupe.TroupeMembershipStatus
import java.util.UUID

object CompositionLinkedParticipantResolver {
    fun resolveViewerParticipantIds(
        season: SeasonEntity,
        eventId: UUID,
        userId: UUID,
        seasonParticipantRepository: SeasonParticipantRepository,
        eventParticipantRepository: EventParticipantRepository,
        seasonParticipantService: SeasonParticipantService,
    ): Set<UUID> {
        val seasonId = season.id
        seasonParticipantService.ensureMembershipParticipants(season)
        val ids = linkedSetOf<UUID>()
        val seasonRows =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, ParticipantStatus.ACTIVE)
                .filter { row ->
                    row.troupeMembership == null ||
                        row.troupeMembership?.status == TroupeMembershipStatus.ACTIVE
                }
        for (row in seasonRows) {
            val directUser = row.user?.id == userId
            val membershipUser = row.troupeMembership?.user?.id == userId
            if (directUser || membershipUser) {
                ids.add(row.id)
            }
        }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
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
            if (row.user?.id == userId) {
                ids.add(row.id)
            }
        }
        return ids
    }
}
