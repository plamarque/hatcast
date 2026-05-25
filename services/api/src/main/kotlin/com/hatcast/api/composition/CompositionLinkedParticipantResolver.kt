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
    ): Set<UUID> {
        val seasonId = season.id
        val ids = linkedSetOf<UUID>()
        val seasonRows =
            seasonParticipantRepository.findActiveForSeasonLinkedToUser(
                seasonId,
                ParticipantStatus.ACTIVE,
                userId,
            )
        for (row in seasonRows) {
            ids.add(row.id)
        }
        val seasonParticipantIds = seasonRows.map { it.id }.toSet()
        val eventRows =
            eventParticipantRepository.findActiveForEventLinkedToUser(
                eventId,
                ParticipantStatus.ACTIVE,
                userId,
            )
        for (row in eventRows) {
            val linkedSeasonId = row.seasonParticipant?.id
            if (linkedSeasonId != null && linkedSeasonId in seasonParticipantIds) {
                continue
            }
            ids.add(row.id)
        }
        return ids
    }
}
