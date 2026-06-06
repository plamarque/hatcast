package com.hatcast.api.season

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface SeasonRepository : JpaRepository<SeasonEntity, UUID> {
    @Query(
        """
        SELECT s FROM SeasonEntity s
        WHERE s.troupe.id = :troupeId
        """,
    )
    fun findAllByTroupeId(
        @Param("troupeId") troupeId: UUID,
        pageable: Pageable,
    ): Page<SeasonEntity>

    @Query(
        """
        SELECT s FROM SeasonEntity s
        WHERE s.troupe.id = :troupeId
        ORDER BY s.title ASC
        """,
    )
    fun findAllByTroupeIdList(
        @Param("troupeId") troupeId: UUID,
    ): List<SeasonEntity>

    fun existsByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): Boolean

    fun existsByTroupe_IdAndSlugAndIdNot(
        troupeId: UUID,
        slug: String,
        id: UUID,
    ): Boolean

    fun findByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): SeasonEntity?

    fun findAllBySlug(slug: String): List<SeasonEntity>

    @Query(
        """
        SELECT DISTINCT s FROM SeasonEntity s
        WHERE s.troupe.id = :troupeId
          AND (
            EXISTS (
              SELECT 1 FROM SeasonParticipantEntity sp
              LEFT JOIN sp.troupeMembership tm
              WHERE sp.season.id = s.id
                AND sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
                AND sp.invitationScope IS NOT NULL
                AND (
                  sp.user.id = :userId
                  OR (
                    tm IS NOT NULL
                    AND tm.user.id = :userId
                    AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
                  )
                )
            )
            OR EXISTS (
              SELECT 1 FROM EventParticipantEntity ep
              LEFT JOIN ep.seasonParticipant esp
              LEFT JOIN esp.troupeMembership etm
              WHERE ep.event.season.id = s.id
                AND ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
                AND ep.event.archived = false
                AND (
                  ep.user.id = :userId
                  OR esp.user.id = :userId
                  OR (
                    etm IS NOT NULL
                    AND etm.user.id = :userId
                    AND etm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
                  )
                )
            )
          )
        ORDER BY s.createdAt DESC
        """,
    )
    fun findInvitedForUserInTroupe(
        @Param("troupeId") troupeId: UUID,
        @Param("userId") userId: UUID,
    ): List<SeasonEntity>

    @Query(
        """
        SELECT DISTINCT s.troupe.id FROM SeasonEntity s
        WHERE (
            EXISTS (
              SELECT 1 FROM SeasonParticipantEntity sp
              LEFT JOIN sp.troupeMembership tm
              WHERE sp.season.id = s.id
                AND sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
                AND sp.invitationScope IS NOT NULL
                AND (
                  sp.user.id = :userId
                  OR (
                    tm IS NOT NULL
                    AND tm.user.id = :userId
                    AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
                  )
                )
            )
            OR EXISTS (
              SELECT 1 FROM EventParticipantEntity ep
              LEFT JOIN ep.seasonParticipant esp
              LEFT JOIN esp.troupeMembership etm
              WHERE ep.event.season.id = s.id
                AND ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
                AND ep.event.archived = false
                AND (
                  ep.user.id = :userId
                  OR esp.user.id = :userId
                  OR (
                    etm IS NOT NULL
                    AND etm.user.id = :userId
                    AND etm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
                  )
                )
            )
          )
        """,
    )
    fun findTroupeIdsWithGuestInvitationForUser(
        @Param("userId") userId: UUID,
    ): List<UUID>

    fun findByTroupe_IdAndIsActiveTrue(troupeId: UUID): SeasonEntity?

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE SeasonEntity s SET s.isActive = false, s.updatedAt = :now
        WHERE s.troupe.id = :troupeId AND s.isActive = true
        """,
    )
    fun deactivateAllActiveInTroupe(
        @Param("troupeId") troupeId: UUID,
        @Param("now") now: Instant,
    ): Int
}
