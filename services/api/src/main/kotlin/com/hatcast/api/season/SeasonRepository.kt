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
