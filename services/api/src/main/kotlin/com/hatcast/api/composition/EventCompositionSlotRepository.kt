package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
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
            (:compartmentSlug = 'principal' AND e.equityTag IS NULL AND e.templateType <> 'deplacement')
            OR (:compartmentSlug = 'deplacements' AND (e.equityTag = 'deplacements' OR (e.equityTag IS NULL AND e.templateType = 'deplacement')))
            OR (:compartmentSlug NOT IN ('principal', 'deplacements') AND e.equityTag = :compartmentSlug)
          )
        GROUP BY COALESCE(s.seasonParticipantId, s.eventParticipantId), s.roleKey
        """,
    )
    fun countValidatedSelectionsBySeasonAndCompartment(
        @Param("seasonId") seasonId: UUID,
        @Param("excludeEventId") excludeEventId: UUID,
        @Param("compartmentSlug") compartmentSlug: String,
    ): List<RoleSelectionCountProjection>
}
