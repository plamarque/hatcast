package com.hatcast.api.availability

import java.util.UUID

/** Rows keyed by linked user id (name-only / participant-scoped rows are excluded). */
fun List<EventAvailabilityEntity>.associateByLinkedUserId(): Map<UUID, EventAvailabilityEntity> =
    mapNotNull { row -> row.user?.id?.let { it to row } }.toMap()

/**
 * Resolves availability for composition / draw pools: linked users by [userId],
 * name-only season rows by season participant id, event-only rows by event participant id.
 */
class EventAvailabilityIndex private constructor(
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

    companion object {
        fun fromRows(rows: List<EventAvailabilityEntity>): EventAvailabilityIndex =
            EventAvailabilityIndex(
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
}

fun List<EventAvailabilityEntity>.toAvailabilityIndex(): EventAvailabilityIndex =
    EventAvailabilityIndex.fromRows(this)
