package com.hatcast.api.composition

import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonEntity
import java.util.UUID

object CompositionLinkedParticipantResolver {
    fun resolveViewerParticipantIds(
        season: SeasonEntity,
        eventId: UUID,
        userId: UUID,
        seasonParticipantRepository: SeasonParticipantRepository,
        eventParticipantRepository: EventParticipantRepository,
        seasonParticipantIdsBySeasonId: MutableMap<UUID, Set<UUID>>? = null,
    ): Set<UUID> {
        val seasonId = season.id
        val ids = linkedSetOf<UUID>()
        val seasonParticipantIds =
            if (seasonParticipantIdsBySeasonId != null) {
                seasonParticipantIdsBySeasonId.getOrPut(seasonId) {
                    seasonParticipantRepository
                        .findActiveForSeasonLinkedToUser(seasonId, ParticipantStatus.ACTIVE, userId)
                        .map { it.id }
                        .toSet()
                }
            } else {
                seasonParticipantRepository
                    .findActiveForSeasonLinkedToUser(seasonId, ParticipantStatus.ACTIVE, userId)
                    .map { it.id }
                    .toSet()
            }
        ids.addAll(seasonParticipantIds)
        val eventRows =
            eventParticipantRepository.findActiveForEventLinkedToUser(
                eventId,
                ParticipantStatus.ACTIVE,
                userId,
            )
        for (row in eventRows) {
            val linkedSeasonParticipantId = row.seasonParticipant?.id
            if (linkedSeasonParticipantId != null && linkedSeasonParticipantId in seasonParticipantIds) {
                continue
            }
            ids.add(row.id)
        }
        return ids
    }
}
