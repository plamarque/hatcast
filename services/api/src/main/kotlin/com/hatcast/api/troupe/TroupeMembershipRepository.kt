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
        value =
            """
            SELECT m.id FROM TroupeMembershipEntity m
            WHERE m.troupe.id = :troupeId
            """,
        countQuery =
            """
            SELECT COUNT(m) FROM TroupeMembershipEntity m
            WHERE m.troupe.id = :troupeId
            """,
    )
    fun findIdsByTroupe_Id(
        @Param("troupeId") troupeId: UUID,
        pageable: Pageable,
    ): Page<UUID>

    @Query(
        value =
            """
            SELECT m.id FROM TroupeMembershipEntity m
            WHERE m.troupe.id = :troupeId AND m.status = :status
            """,
        countQuery =
            """
            SELECT COUNT(m) FROM TroupeMembershipEntity m
            WHERE m.troupe.id = :troupeId AND m.status = :status
            """,
    )
    fun findIdsByTroupe_IdAndStatus(
        @Param("troupeId") troupeId: UUID,
        @Param("status") status: TroupeMembershipStatus,
        pageable: Pageable,
    ): Page<UUID>

    @Query(
        """
        SELECT m FROM TroupeMembershipEntity m
        LEFT JOIN FETCH m.user
        WHERE m.id IN :ids
        """,
    )
    fun findByIdInWithUser(
        @Param("ids") ids: Collection<UUID>,
    ): List<TroupeMembershipEntity>

    @Query(
        """
        SELECT m FROM TroupeMembershipEntity m
        LEFT JOIN FETCH m.user
        WHERE m.troupe.id = :troupeId
          AND m.status = :status
          AND m.id IN :ids
        """,
    )
    fun findByTroupe_IdAndStatusAndIdInWithUser(
        @Param("troupeId") troupeId: UUID,
        @Param("status") status: TroupeMembershipStatus,
        @Param("ids") ids: Collection<UUID>,
    ): List<TroupeMembershipEntity>

    @Query(
        """
        SELECT m FROM TroupeMembershipEntity m
        JOIN FETCH m.troupe t
        WHERE m.user.id = :userId
          AND m.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
          AND m.baselineRole <> com.hatcast.api.troupe.TroupeBaselineRole.EXTERNE
        ORDER BY t.name ASC
        """,
    )
    fun findActiveByUserId(
        @Param("userId") userId: UUID,
    ): List<TroupeMembershipEntity>

    fun findByTroupe_IdAndUser_IdAndBaselineRole(
        troupeId: UUID,
        userId: UUID,
        baselineRole: TroupeBaselineRole,
    ): TroupeMembershipEntity?

    fun findFirstByTroupe_IdAndBaselineRoleAndStatusAndNormalizedEmailIgnoreCase(
        troupeId: UUID,
        baselineRole: TroupeBaselineRole,
        status: TroupeMembershipStatus,
        normalizedEmail: String,
    ): TroupeMembershipEntity?

    fun findFirstByTroupe_IdAndBaselineRoleAndStatusAndDisplayNameIgnoreCase(
        troupeId: UUID,
        baselineRole: TroupeBaselineRole,
        status: TroupeMembershipStatus,
        displayName: String,
    ): TroupeMembershipEntity?

    fun findFirstByTroupe_IdAndBaselineRoleAndNormalizedEmailIgnoreCase(
        troupeId: UUID,
        baselineRole: TroupeBaselineRole,
        normalizedEmail: String,
    ): TroupeMembershipEntity?

    fun findFirstByTroupe_IdAndBaselineRoleAndDisplayNameIgnoreCase(
        troupeId: UUID,
        baselineRole: TroupeBaselineRole,
        displayName: String,
    ): TroupeMembershipEntity?

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

    @Query(
        """
        SELECT m.troupe.id AS troupeId, COUNT(m) AS memberCount
        FROM TroupeMembershipEntity m
        WHERE m.troupe.id IN :troupeIds
          AND m.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
          AND m.baselineRole <> com.hatcast.api.troupe.TroupeBaselineRole.EXTERNE
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
        LEFT JOIN FETCH m.user
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
