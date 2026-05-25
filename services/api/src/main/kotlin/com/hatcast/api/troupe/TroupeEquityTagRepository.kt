package com.hatcast.api.troupe

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TroupeEquityTagRepository : JpaRepository<TroupeEquityTagEntity, UUID> {
    fun findByTroupe_IdOrderByLabelAsc(troupeId: UUID): List<TroupeEquityTagEntity>

    fun existsByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): Boolean

    fun findByTroupe_IdAndSlug(
        troupeId: UUID,
        slug: String,
    ): TroupeEquityTagEntity?
}
