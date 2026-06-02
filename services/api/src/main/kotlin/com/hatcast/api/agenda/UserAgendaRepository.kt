package com.hatcast.api.agenda

import com.hatcast.api.event.EVENT_LIST_VISIBILITY_JPQL
import com.hatcast.api.event.EventEntity
import com.hatcast.api.participant.ParticipantStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface ParticipatingTroupeCatalogRow {
  val id: UUID
  val name: String
  val slug: String
}

interface ParticipatingSeasonCatalogRow {
  val id: UUID
  val title: String
  val slug: String
  val troupeId: UUID
}

interface UserAgendaRow {
  val eventId: UUID
  val eventSlug: String
  val title: String
  val startsAt: Instant
  val location: String?
  val description: String?
  val troupeId: UUID
  val troupeName: String
  val troupeSlug: String
  val seasonId: UUID
  val seasonSlug: String
  val seasonTitle: String
}

interface UserAgendaRepository : JpaRepository<EventEntity, UUID> {
  @Query(
    value =
    """
    SELECT DISTINCT
      e.id AS eventId,
      e.slug AS eventSlug,
      e.title AS title,
      e.startsAt AS startsAt,
      e.location AS location,
      e.description AS description,
      t.id AS troupeId,
      t.name AS troupeName,
      t.slug AS troupeSlug,
      s.id AS seasonId,
      s.slug AS seasonSlug,
      s.title AS seasonTitle
    FROM EventEntity e
    JOIN e.season s
    JOIN s.troupe t
    WHERE e.archived = false
      AND s.archived = false
      AND e.startsAt >= :fromInclusive
      AND (
        s.id IN (
          SELECT sp.season.id FROM SeasonParticipantEntity sp
          LEFT JOIN sp.troupeMembership tm
          WHERE sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
        OR e.id IN (
          SELECT ep.event.id FROM EventParticipantEntity ep
          LEFT JOIN ep.seasonParticipant sp
          LEFT JOIN sp.troupeMembership tm
          WHERE ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              ep.user.id = :userId
              OR sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
      )
      AND (:troupeId IS NULL OR t.id = :troupeId)
      AND (:seasonId IS NULL OR s.id = :seasonId)
      AND $EVENT_LIST_VISIBILITY_JPQL
    ORDER BY e.startsAt ASC, e.id ASC
    """,
    countQuery =
    """
    SELECT COUNT(DISTINCT e.id) FROM EventEntity e
    JOIN e.season s
    JOIN s.troupe t
    WHERE e.archived = false
      AND s.archived = false
      AND e.startsAt >= :fromInclusive
      AND (
        s.id IN (
          SELECT sp.season.id FROM SeasonParticipantEntity sp
          LEFT JOIN sp.troupeMembership tm
          WHERE sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
        OR e.id IN (
          SELECT ep.event.id FROM EventParticipantEntity ep
          LEFT JOIN ep.seasonParticipant sp
          LEFT JOIN sp.troupeMembership tm
          WHERE ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              ep.user.id = :userId
              OR sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
      )
      AND (:troupeId IS NULL OR t.id = :troupeId)
      AND (:seasonId IS NULL OR s.id = :seasonId)
      AND $EVENT_LIST_VISIBILITY_JPQL
    """,
  )
  fun findUpcomingForUser(
    @Param("userId") userId: UUID,
    @Param("fromInclusive") fromInclusive: Instant,
    @Param("troupeId") troupeId: UUID?,
    @Param("seasonId") seasonId: UUID?,
    @Param("viewerUserId") viewerUserId: UUID,
    @Param("applyDraftVisibility") applyDraftVisibility: Boolean,
    pageable: Pageable,
  ): Page<UserAgendaRow>

  @Query(
    value =
    """
    SELECT DISTINCT
      e.id AS eventId,
      e.slug AS eventSlug,
      e.title AS title,
      e.startsAt AS startsAt,
      e.location AS location,
      e.description AS description,
      t.id AS troupeId,
      t.name AS troupeName,
      t.slug AS troupeSlug,
      s.id AS seasonId,
      s.slug AS seasonSlug,
      s.title AS seasonTitle
    FROM EventEntity e
    JOIN e.season s
    JOIN s.troupe t
    WHERE e.archived = false
      AND s.archived = false
      AND e.id IN :eventIds
      AND (
        s.id IN (
          SELECT sp.season.id FROM SeasonParticipantEntity sp
          LEFT JOIN sp.troupeMembership tm
          WHERE sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
        OR e.id IN (
          SELECT ep.event.id FROM EventParticipantEntity ep
          LEFT JOIN ep.seasonParticipant sp
          LEFT JOIN sp.troupeMembership tm
          WHERE ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              ep.user.id = :userId
              OR sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        )
      )
    ORDER BY e.startsAt ASC, e.id ASC
    """,
  )
  fun findParticipatedEventsByIds(
    @Param("userId") userId: UUID,
    @Param("eventIds") eventIds: Collection<UUID>,
  ): List<UserAgendaRow>

  @Query(
    """
    SELECT DISTINCT s.troupe.id FROM SeasonParticipantEntity sp
    JOIN sp.season s
    WHERE sp.user.id = :userId
      AND sp.status = :status
      AND s.archived = false
    """,
  )
  fun findParticipatingTroupeIdsFromSeason(
    @Param("userId") userId: UUID,
    @Param("status") status: ParticipantStatus = ParticipantStatus.ACTIVE,
  ): List<UUID>

  @Query(
    """
    SELECT DISTINCT s.id FROM SeasonParticipantEntity sp
    JOIN sp.season s
    LEFT JOIN sp.troupeMembership tm
    WHERE sp.status = :status
      AND s.archived = false
      AND (
        sp.user.id = :userId
        OR (
          tm IS NOT NULL
          AND tm.user.id = :userId
          AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        )
      )
    """,
  )
  fun findParticipatingSeasonIdsFromSeason(
    @Param("userId") userId: UUID,
    @Param("status") status: ParticipantStatus = ParticipantStatus.ACTIVE,
  ): List<UUID>

  @Query(
    """
    SELECT DISTINCT e.season.troupe.id FROM EventParticipantEntity ep
    JOIN ep.event e
    JOIN e.season s
    WHERE ep.user.id = :userId
      AND ep.status = :status
      AND e.archived = false
      AND s.archived = false
      AND NOT EXISTS (
        SELECT 1 FROM SeasonParticipantEntity sp
        WHERE sp.user.id = :userId
          AND sp.season.id = s.id
          AND sp.status = :status
      )
    """,
  )
  fun findParticipatingTroupeIdsFromEventOnly(
    @Param("userId") userId: UUID,
    @Param("status") status: ParticipantStatus = ParticipantStatus.ACTIVE,
  ): List<UUID>

  @Query(
    """
    SELECT DISTINCT e.season.id FROM EventParticipantEntity ep
    JOIN ep.event e
    JOIN e.season s
    WHERE ep.user.id = :userId
      AND ep.status = :status
      AND e.archived = false
      AND s.archived = false
      AND NOT EXISTS (
        SELECT 1 FROM SeasonParticipantEntity sp
        WHERE sp.user.id = :userId
          AND sp.season.id = s.id
          AND sp.status = :status
      )
    """,
  )
  fun findParticipatingSeasonIdsFromEventOnly(
    @Param("userId") userId: UUID,
    @Param("status") status: ParticipantStatus = ParticipantStatus.ACTIVE,
  ): List<UUID>

  @Query(
    """
    SELECT t.id AS id, t.name AS name, t.slug AS slug
    FROM TroupeEntity t
    WHERE t.id IN :ids
    ORDER BY t.name ASC
    """,
  )
  fun findTroupeCatalogByIds(
    @Param("ids") ids: Collection<UUID>,
  ): List<ParticipatingTroupeCatalogRow>

  @Query(
    """
    SELECT s.id AS id, s.title AS title, s.slug AS slug, s.troupe.id AS troupeId
    FROM SeasonEntity s
    WHERE s.id IN :ids
      AND s.archived = false
    ORDER BY s.title ASC
    """,
  )
  fun findSeasonCatalogByIds(
    @Param("ids") ids: Collection<UUID>,
  ): List<ParticipatingSeasonCatalogRow>
}
