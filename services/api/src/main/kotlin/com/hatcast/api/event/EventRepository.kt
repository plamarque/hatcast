package com.hatcast.api.event

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface EventRepository : JpaRepository<EventEntity, UUID> {
    fun findBySeason_IdAndSlug(
        seasonId: UUID,
        slug: String,
    ): EventEntity?

    fun existsBySeason_IdAndSlug(
        seasonId: UUID,
        slug: String,
    ): Boolean

    fun existsBySeason_IdAndSlugAndIdNot(
        seasonId: UUID,
        slug: String,
        id: UUID,
    ): Boolean

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt ASC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findBySeason_IdOrderByStartsAtAsc(
        @Param("seasonId") seasonId: UUID,
        @Param("viewerUserId") viewerUserId: UUID,
        @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
        pageable: Pageable,
    ): Page<EventEntity>

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt >= :fromInclusive
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt ASC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt >= :fromInclusive
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findUpcomingNonArchived(
        @Param("seasonId") seasonId: UUID,
        @Param("fromInclusive") fromInclusive: Instant,
        @Param("viewerUserId") viewerUserId: UUID,
        @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
        pageable: Pageable,
    ): Page<EventEntity>

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt < :beforeExclusive
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt DESC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt < :beforeExclusive
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findPastNonArchived(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeExclusive") beforeExclusive: Instant,
        @Param("viewerUserId") viewerUserId: UUID,
        @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
        pageable: Pageable,
    ): Page<EventEntity>

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
        ORDER BY e.startsAt ASC
        """,
    )
    fun findNonArchivedBySeasonId(
        @Param("seasonId") seasonId: UUID,
    ): List<EventEntity>

    fun countBySeason_IdAndArchivedFalse(seasonId: UUID): Long

    @Query(
        """
        SELECT DISTINCT e FROM EventEntity e
        JOIN FETCH e.season s
        JOIN FETCH s.troupe
        INNER JOIN EventCompositionEntity c ON c.eventId = e.id
        WHERE e.archived = false
          AND e.availabilityOpenedAt IS NOT NULL
          AND c.validatedAt IS NOT NULL
          AND e.startsAt >= :fromInclusive
        ORDER BY e.startsAt ASC
        """,
    )
    fun findValidatedOpenEventsStartingFrom(
        @Param("fromInclusive") fromInclusive: Instant,
    ): List<EventEntity>
}
