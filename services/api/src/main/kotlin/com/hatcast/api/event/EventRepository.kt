package com.hatcast.api.event

import com.hatcast.api.participant.GuestEventAccessJpql
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.data.jpa.repository.JpaRepository
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
          AND e.startsAt >= :fromInclusive
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt ASC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt >= :fromInclusive
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findUpcomingNonArchivedForGuest(
        @Param("seasonId") seasonId: UUID,
        @Param("fromInclusive") fromInclusive: Instant,
        @Param("guestUserId") guestUserId: UUID,
        @Param("viewerUserId") viewerUserId: UUID,
        @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
        pageable: Pageable,
    ): Page<EventEntity>

    @Query(
        """
        SELECT e FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt ASC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findBySeason_IdForGuestOrderByStartsAtAsc(
        @Param("seasonId") seasonId: UUID,
        @Param("guestUserId") guestUserId: UUID,
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
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        ORDER BY e.startsAt DESC
        """,
        countQuery =
        """
        SELECT COUNT(e) FROM EventEntity e
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND e.startsAt < :beforeExclusive
          AND ${GuestEventAccessJpql.GUEST_ACCESSIBLE_EVENT}
          AND $EVENT_LIST_VISIBILITY_JPQL
        """,
    )
    fun findPastNonArchivedForGuest(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeExclusive") beforeExclusive: Instant,
        @Param("guestUserId") guestUserId: UUID,
        @Param("viewerUserId") viewerUserId: UUID,
        @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
        pageable: Pageable,
    ): Page<EventEntity>

    fun countBySeason_IdAndArchivedFalse(seasonId: UUID): Long

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

    @Query(
        """
        SELECT DISTINCT e FROM EventEntity e
        JOIN FETCH e.season s
        JOIN FETCH s.troupe
        LEFT JOIN EventCompositionEntity c ON c.eventId = e.id
        WHERE e.archived = false
          AND e.availabilityOpenedAt IS NOT NULL
          AND (c IS NULL OR c.validatedAt IS NULL)
          AND e.startsAt >= :fromInclusive
          AND e.startsAt < :toExclusive
        ORDER BY e.startsAt ASC
        """,
    )
    fun findPublishedEventsCollectingAvailability(
        @Param("fromInclusive") fromInclusive: Instant,
        @Param("toExclusive") toExclusive: Instant,
    ): List<EventEntity>

    /**
     * Last validated event strictly before [beforeEventId] in the same category compartment.
     * Category filter aligned with [com.hatcast.api.composition.EventCompositionSlotRepository].
     */
    @Query(
        """
        SELECT e FROM EventEntity e
        INNER JOIN EventCompositionEntity c ON c.eventId = e.id
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND (
            e.startsAt < :beforeStartsAt
            OR (e.startsAt = :beforeStartsAt AND e.createdAt < :beforeCreatedAt)
            OR (e.startsAt = :beforeStartsAt AND e.createdAt = :beforeCreatedAt AND e.id < :beforeEventId)
          )
          AND (
            (:categorySlug = 'principal' AND e.category IS NULL AND e.templateType <> 'deplacement')
            OR (:categorySlug = 'deplacements' AND (e.category = 'deplacements' OR (e.category IS NULL AND e.templateType = 'deplacement')))
            OR (:categorySlug NOT IN ('principal', 'deplacements') AND e.category = :categorySlug)
          )
        ORDER BY e.startsAt DESC, e.createdAt DESC, e.id DESC
        """,
    )
    fun findImmediateValidatedPredecessorInCategory(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeEventId") beforeEventId: UUID,
        @Param("beforeStartsAt") beforeStartsAt: Instant,
        @Param("beforeCreatedAt") beforeCreatedAt: Instant,
        @Param("categorySlug") categorySlug: String,
        pageable: Pageable,
    ): List<EventEntity>
}
