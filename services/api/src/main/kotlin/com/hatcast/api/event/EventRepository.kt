package com.hatcast.api.event

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface EventRepository : JpaRepository<EventEntity, UUID> {
    fun findBySeason_IdOrderByStartsAtAsc(
        seasonId: UUID,
        pageable: Pageable,
    ): Page<EventEntity>

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt >= :fromInclusive
        ORDER BY e.startsAt ASC
        """,
    )
    fun findUpcomingNonArchived(
        @Param("seasonId") seasonId: UUID,
        @Param("fromInclusive") fromInclusive: Instant,
        pageable: Pageable,
    ): Page<EventEntity>
}
