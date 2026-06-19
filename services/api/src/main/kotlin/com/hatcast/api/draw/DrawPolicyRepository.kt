package com.hatcast.api.draw

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface DrawPolicyRepository : JpaRepository<DrawPolicyEntity, UUID> {
    fun findByTroupeId(troupeId: UUID): List<DrawPolicyEntity>

    fun existsByTroupeIdAndScope(
        troupeId: UUID,
        scope: DrawPolicyScope,
    ): Boolean

    fun existsBySeasonIdAndScope(
        seasonId: UUID,
        scope: DrawPolicyScope,
    ): Boolean

    fun findByTroupeIdAndScope(
        troupeId: UUID,
        scope: DrawPolicyScope,
    ): DrawPolicyEntity?

    fun findBySeasonIdAndScope(
        seasonId: UUID,
        scope: DrawPolicyScope,
    ): DrawPolicyEntity?
}
