package com.hatcast.api.inbox

import com.hatcast.api.composition.EventCompositionSlotEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface PendingConfirmationSlotRow {
  val eventId: UUID
  val roleKey: String
  val seasonParticipantId: UUID?
  val eventParticipantId: UUID?
}

interface MeInboxRepository : JpaRepository<EventCompositionSlotEntity, UUID> {
  @Query(
    """
    SELECT
      s.eventId AS eventId,
      s.roleKey AS roleKey,
      s.seasonParticipantId AS seasonParticipantId,
      s.eventParticipantId AS eventParticipantId
    FROM EventCompositionSlotEntity s
    JOIN EventCompositionEntity c ON c.eventId = s.eventId
    JOIN EventEntity e ON e.id = s.eventId
    JOIN e.season season
    WHERE c.validatedAt IS NOT NULL
      AND s.participationStatus = com.hatcast.api.composition.SlotParticipationStatus.PENDING
      AND (s.seasonParticipantId IS NOT NULL OR s.eventParticipantId IS NOT NULL)
      AND e.archived = false
      AND season.archived = false
      AND e.startsAt >= :fromInclusive
      AND (
        (s.seasonParticipantId IS NOT NULL AND s.seasonParticipantId IN (
          SELECT sp.id FROM SeasonParticipantEntity sp
          LEFT JOIN sp.troupeMembership tm
          WHERE sp.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        ))
        OR (s.eventParticipantId IS NOT NULL AND s.eventParticipantId IN (
          SELECT ep.id FROM EventParticipantEntity ep
          LEFT JOIN ep.seasonParticipant sp
          LEFT JOIN sp.troupeMembership tm
          WHERE ep.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
            AND (
              ep.user.id = :userId
              OR sp.user.id = :userId
              OR (
                tm IS NOT NULL
                AND tm.user.id = :userId
                AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
              )
            )
        ))
      )
    """,
  )
  fun findPendingConfirmationSlotsForUser(
    @Param("userId") userId: UUID,
    @Param("fromInclusive") fromInclusive: Instant,
  ): List<PendingConfirmationSlotRow>
}
