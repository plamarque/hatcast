package com.hatcast.api.draw

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface DrawFormulaRepository : JpaRepository<DrawFormulaEntity, UUID> {
    fun findByTroupeIdAndStatusOrderByNameAsc(
        troupeId: UUID,
        status: DrawFormulaStatus,
    ): List<DrawFormulaEntity>

    fun existsByTroupeIdAndIsSystem(
        troupeId: UUID,
        isSystem: Boolean,
    ): Boolean

    fun findByTroupeIdAndIsSystem(
        troupeId: UUID,
        isSystem: Boolean,
    ): List<DrawFormulaEntity>

    fun existsByIdAndTroupeId(
        id: UUID,
        troupeId: UUID,
    ): Boolean

    fun findByTroupeIdOrderByNameAsc(troupeId: UUID): List<DrawFormulaEntity>

    fun findByIdAndTroupeId(
        id: UUID,
        troupeId: UUID,
    ): DrawFormulaEntity?
}
