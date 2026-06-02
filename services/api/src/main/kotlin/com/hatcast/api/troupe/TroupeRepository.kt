package com.hatcast.api.troupe

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface TroupeRepository : JpaRepository<TroupeEntity, UUID> {
    fun existsBySlug(slug: String): Boolean

    fun findBySlug(slug: String): TroupeEntity?

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TroupeEntity t WHERE t.id = :id")
    fun findByIdForMembershipJoin(
        @Param("id") id: UUID,
    ): TroupeEntity?

    fun findByListedInDirectoryTrueAndIsDemoFalseOrderByNameAsc(): List<TroupeEntity>

    fun findByIdAndListedInDirectoryTrueAndIsDemoFalse(id: UUID): TroupeEntity?
}
