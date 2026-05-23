package com.hatcast.api.troupe

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

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

    fun findByTroupe_IdAndStatusOrderByDisplayNameAsc(
        troupeId: UUID,
        status: TroupeMembershipStatus,
        pageable: Pageable,
    ): Page<TroupeMembershipEntity>
}
