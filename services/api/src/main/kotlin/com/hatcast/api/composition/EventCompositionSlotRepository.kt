package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface EventCompositionSlotRepository : JpaRepository<EventCompositionSlotEntity, UUID> {
    fun findByEventIdIn(eventIds: Collection<UUID>): List<EventCompositionSlotEntity>

    fun findByEventId(eventId: UUID): List<EventCompositionSlotEntity>

    fun findByEventIdAndRoleKeyAndSlotIndex(
        eventId: UUID,
        roleKey: String,
        slotIndex: Int,
    ): EventCompositionSlotEntity?

    @Query(
        """
        SELECT COALESCE(s.seasonParticipantId, s.eventParticipantId) AS participantId, s.roleKey AS roleKey, COUNT(s) AS selectionCount
        FROM EventCompositionSlotEntity s
        JOIN EventCompositionEntity c ON c.eventId = s.eventId
        JOIN EventEntity e ON e.id = s.eventId
        WHERE e.season.id = :seasonId
          AND s.eventId <> :excludeEventId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND COALESCE(s.seasonParticipantId, s.eventParticipantId) IS NOT NULL
          AND s.participationStatus <> com.hatcast.api.composition.SlotParticipationStatus.DECLINED
          AND (
            (:categorySlug = 'principal' AND e.category IS NULL AND e.templateType <> 'deplacement')
            OR (:categorySlug = 'deplacements' AND (e.category = 'deplacements' OR (e.category IS NULL AND e.templateType = 'deplacement')))
            OR (:categorySlug NOT IN ('principal', 'deplacements') AND e.category = :categorySlug)
          )
        GROUP BY COALESCE(s.seasonParticipantId, s.eventParticipantId), s.roleKey
        """,
    )
    fun countValidatedSelectionsBySeasonAndCategory(
        @Param("seasonId") seasonId: UUID,
        @Param("excludeEventId") excludeEventId: UUID,
        @Param("categorySlug") categorySlug: String,
    ): List<RoleSelectionCountProjection>

    @Query(
        """
        SELECT COALESCE(s.seasonParticipantId, s.eventParticipantId) AS participantId, s.roleKey AS roleKey, COUNT(s) AS selectionCount
        FROM EventCompositionSlotEntity s
        JOIN EventCompositionEntity c ON c.eventId = s.eventId
        JOIN EventEntity e ON e.id = s.eventId
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND COALESCE(s.seasonParticipantId, s.eventParticipantId) IS NOT NULL
          AND s.participationStatus <> com.hatcast.api.composition.SlotParticipationStatus.DECLINED
          AND (
            e.startsAt < :beforeStartsAt
            OR (e.startsAt = :beforeStartsAt AND e.createdAt < :beforeCreatedAt)
            OR (e.startsAt = :beforeStartsAt AND e.createdAt = :beforeCreatedAt AND e.id < :beforeEventId)
          )
          AND (
            (:categorySlug = 'principal' AND e.category IS NULL AND e.templateType <> 'deplacement')
            OR (:categorySlug = 'deplacements' AND (e.category = 'deplacements' OR (e.category IS NULL AND e.templateType = 'deplacement')))
            OR (:categorySlug NOT IN ('principal', 'deplacements') AND e.category = :categorySlug)
          )
        GROUP BY COALESCE(s.seasonParticipantId, s.eventParticipantId), s.roleKey
        """,
    )
    fun countValidatedSelectionsBeforeEvent(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeEventId") beforeEventId: UUID,
        @Param("beforeStartsAt") beforeStartsAt: Instant,
        @Param("beforeCreatedAt") beforeCreatedAt: Instant,
        @Param("categorySlug") categorySlug: String,
    ): List<RoleSelectionCountProjection>

    @Query(
        """
        SELECT COALESCE(s.seasonParticipantId, s.eventParticipantId) AS participantId, s.roleKey AS roleKey, COUNT(s) AS selectionCount
        FROM EventCompositionSlotEntity s
        JOIN EventCompositionEntity c ON c.eventId = s.eventId
        JOIN EventEntity e ON e.id = s.eventId
        WHERE e.season.id = :seasonId
          AND s.eventId <> :excludeEventId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND COALESCE(s.seasonParticipantId, s.eventParticipantId) IS NOT NULL
          AND s.participationStatus <> com.hatcast.api.composition.SlotParticipationStatus.DECLINED
        GROUP BY COALESCE(s.seasonParticipantId, s.eventParticipantId), s.roleKey
        """,
    )
    fun countValidatedSelectionsBySeasonAllCategories(
        @Param("seasonId") seasonId: UUID,
        @Param("excludeEventId") excludeEventId: UUID,
    ): List<RoleSelectionCountProjection>

    @Query(
        """
        SELECT COALESCE(s.seasonParticipantId, s.eventParticipantId) AS participantId, s.roleKey AS roleKey, COUNT(s) AS selectionCount
        FROM EventCompositionSlotEntity s
        JOIN EventCompositionEntity c ON c.eventId = s.eventId
        JOIN EventEntity e ON e.id = s.eventId
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND COALESCE(s.seasonParticipantId, s.eventParticipantId) IS NOT NULL
          AND s.participationStatus <> com.hatcast.api.composition.SlotParticipationStatus.DECLINED
          AND (
            e.startsAt < :beforeStartsAt
            OR (e.startsAt = :beforeStartsAt AND e.createdAt < :beforeCreatedAt)
            OR (e.startsAt = :beforeStartsAt AND e.createdAt = :beforeCreatedAt AND e.id < :beforeEventId)
          )
        GROUP BY COALESCE(s.seasonParticipantId, s.eventParticipantId), s.roleKey
        """,
    )
    fun countValidatedSelectionsBeforeEventAllCategories(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeEventId") beforeEventId: UUID,
        @Param("beforeStartsAt") beforeStartsAt: Instant,
        @Param("beforeCreatedAt") beforeCreatedAt: Instant,
    ): List<RoleSelectionCountProjection>
}
