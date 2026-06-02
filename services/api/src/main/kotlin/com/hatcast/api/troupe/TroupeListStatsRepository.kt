package com.hatcast.api.troupe

import com.hatcast.api.event.EventEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface TroupeUpcomingEventCountRow {
    val troupeId: UUID
    val eventCount: Long
}

/**
 * Batch counts for troupe list cards (Story 17.3).
 * Upcoming eligibility mirrors [com.hatcast.api.agenda.UserAgendaRepository.findUpcomingForUser].
 */
interface TroupeListStatsRepository : JpaRepository<EventEntity, UUID> {
    @Query(
        """
        SELECT t.id AS troupeId, COUNT(DISTINCT e.id) AS eventCount
        FROM EventEntity e
        JOIN e.season s
        JOIN s.troupe t
        WHERE e.archived = false
          AND s.archived = false
          AND e.startsAt >= :fromInclusive
          AND t.id IN :troupeIds
          AND (
            s.id IN (
              SELECT sp.season.id FROM SeasonParticipantEntity sp
              WHERE sp.user.id = :userId
                AND sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            )
            OR e.id IN (
              SELECT ep.event.id FROM EventParticipantEntity ep
              WHERE ep.user.id = :userId
                AND ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            )
          )
        GROUP BY t.id
        """,
    )
    fun countUpcomingEventsByTroupeIdsForUser(
        @Param("userId") userId: UUID,
        @Param("troupeIds") troupeIds: Collection<UUID>,
        @Param("fromInclusive") fromInclusive: Instant,
    ): List<TroupeUpcomingEventCountRow>

    /** Troupe-wide upcoming event count for public directory cards (Story 4.1 — not user-scoped). */
    @Query(
        """
        SELECT t.id AS troupeId, COUNT(DISTINCT e.id) AS eventCount
        FROM EventEntity e
        JOIN e.season s
        JOIN s.troupe t
        WHERE e.archived = false
          AND s.archived = false
          AND e.startsAt >= :fromInclusive
          AND t.id IN :troupeIds
        GROUP BY t.id
        """,
    )
    fun countUpcomingEventsByTroupeIds(
        @Param("troupeIds") troupeIds: Collection<UUID>,
        @Param("fromInclusive") fromInclusive: Instant,
    ): List<TroupeUpcomingEventCountRow>
}
