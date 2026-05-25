package com.hatcast.api.troupe

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface TroupeMemberCountRow {
    val troupeId: UUID
    val memberCount: Long
}

interface TroupeMembershipRepository : JpaRepository<TroupeMembershipEntity, UUID> {
    fun findByTroupe_IdAndUser_Id(
        troupeId: UUID,
        userId: UUID,
    ): TroupeMembershipEntity?

    fun findByIdAndTroupe_Id(
        id: UUID,
        troupeId: UUID,
    ): TroupeMembershipEntity?

    fun findByTroupe_Id(
        troupeId: UUID,
        pageable: Pageable,
    ): Page<TroupeMembershipEntity>

    @Query(
        """
        SELECT m FROM TroupeMembershipEntity m
        JOIN FETCH m.troupe t
        WHERE m.user.id = :userId AND m.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        ORDER BY t.name ASC
        """,
    )
    fun findActiveByUserId(
        @Param("userId") userId: UUID,
    ): List<TroupeMembershipEntity>

    fun existsByTroupe_IdAndUser_IdAndStatus(
        troupeId: UUID,
        userId: UUID,
        status: TroupeMembershipStatus,
    ): Boolean

    fun countByTroupe_IdAndStatusAndBaselineRole(
        troupeId: UUID,
        status: TroupeMembershipStatus,
        baselineRole: TroupeBaselineRole,
    ): Long

    fun countByTroupe_IdAndStatus(
        troupeId: UUID,
        status: TroupeMembershipStatus,
    ): Long

    @Query(
        """
        SELECT m.troupe.id AS troupeId, COUNT(m) AS memberCount
        FROM TroupeMembershipEntity m
        WHERE m.troupe.id IN :troupeIds
          AND m.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        GROUP BY m.troupe.id
        """,
    )
    fun countActiveMembersByTroupeIds(
        @Param("troupeIds") troupeIds: Collection<UUID>,
    ): List<TroupeMemberCountRow>

    fun findByTroupe_IdAndStatusOrderByDisplayNameAsc(
        troupeId: UUID,
        status: TroupeMembershipStatus,
        pageable: Pageable,
    ): Page<TroupeMembershipEntity>

    @Query(
        """
        SELECT m FROM TroupeMembershipEntity m
        JOIN FETCH m.user
        WHERE m.troupe.id = :troupeId
          AND m.status IN :statuses
        ORDER BY m.displayName ASC
        """,
    )
    fun findByTroupe_IdAndStatusIn(
        @Param("troupeId") troupeId: UUID,
        @Param("statuses") statuses: Collection<TroupeMembershipStatus>,
    ): List<TroupeMembershipEntity>

    @Query(
        """
        SELECT CASE WHEN COUNT(m1) > 0 THEN true ELSE false END
        FROM TroupeMembershipEntity m1, TroupeMembershipEntity m2
        WHERE m1.user.id = :viewerId AND m2.user.id = :targetUserId
        AND m1.troupe.id = m2.troupe.id
        AND m1.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        AND m2.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        """,
    )
    fun existsSharedActiveTroupe(
        @Param("viewerId") viewerId: UUID,
        @Param("targetUserId") targetUserId: UUID,
    ): Boolean
}
