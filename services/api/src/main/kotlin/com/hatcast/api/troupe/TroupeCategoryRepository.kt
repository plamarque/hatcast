package com.hatcast.api.troupe

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TroupeCategoryRepository : JpaRepository<TroupeCategoryEntity, UUID> {
    fun findByTroupe_IdOrderByLabelAsc(troupeId: UUID): List<TroupeCategoryEntity>

    fun existsByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): Boolean

    fun findByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): TroupeCategoryEntity?
}
