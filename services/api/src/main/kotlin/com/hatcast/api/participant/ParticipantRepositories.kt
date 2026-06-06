package com.hatcast.api.participant

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface SeasonParticipantRepository : JpaRepository<SeasonParticipantEntity, UUID> {
    fun findBySeason_IdAndStatusOrderByDisplayNameAsc(
        seasonId: UUID,
        status: ParticipantStatus,
    ): List<SeasonParticipantEntity>

    @Query(
        """
        SELECT p FROM SeasonParticipantEntity p
        LEFT JOIN FETCH p.user
        LEFT JOIN FETCH p.troupeMembership
        WHERE p.season.id = :seasonId AND p.status = :status
        ORDER BY p.displayName ASC
        """,
    )
    fun findActiveForSeasonWithAssociations(
        @Param("seasonId") seasonId: UUID,
        @Param("status") status: ParticipantStatus,
    ): List<SeasonParticipantEntity>

    @Query(
        """
        SELECT p FROM SeasonParticipantEntity p
        LEFT JOIN FETCH p.user
        LEFT JOIN FETCH p.troupeMembership tm
        LEFT JOIN FETCH tm.user
        WHERE p.season.id = :seasonId
          AND p.status = :status
          AND (
            p.user.id = :userId
            OR (
              tm IS NOT NULL
              AND tm.user.id = :userId
              AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
            )
          )
        """,
    )
    fun findActiveForSeasonLinkedToUser(
        @Param("seasonId") seasonId: UUID,
        @Param("status") status: ParticipantStatus,
        @Param("userId") userId: UUID,
    ): List<SeasonParticipantEntity>

    fun findBySeason_IdAndTroupeMembership_Id(
        seasonId: UUID,
        troupeMembershipId: UUID,
    ): SeasonParticipantEntity?

    fun findBySeason_IdAndTroupeMembership_IdIn(
        seasonId: UUID,
        troupeMembershipIds: Collection<UUID>,
    ): List<SeasonParticipantEntity>

    fun findByTroupeMembership_Id(troupeMembershipId: UUID): List<SeasonParticipantEntity>

    @Query(
        """
        SELECT p FROM SeasonParticipantEntity p
        JOIN FETCH p.troupeMembership tm
        WHERE p.season.id = :seasonId
          AND p.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
          AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.INACTIVE
        """,
    )
    fun findActiveLinkedToInactiveMembershipsForSeason(
        @Param("seasonId") seasonId: UUID,
    ): List<SeasonParticipantEntity>

    @Query(
        """
        SELECT p.user.id FROM SeasonParticipantEntity p
        WHERE p.season.id = :seasonId
          AND p.status = com.hatcast.api.participant.ParticipantStatus.REMOVED
          AND p.user.id IS NOT NULL
        """,
    )
    fun findRemovedUserIdsForSeason(
        @Param("seasonId") seasonId: UUID,
    ): List<UUID>

    fun findByIdAndSeason_Id(
        id: UUID,
        seasonId: UUID,
    ): SeasonParticipantEntity?

    fun findBySeason_IdAndStatusAndUser_Id(
        seasonId: UUID,
        status: ParticipantStatus,
        userId: UUID,
    ): List<SeasonParticipantEntity>

    fun findBySeason_IdAndStatusAndTroupeMembership_Id(
        seasonId: UUID,
        status: ParticipantStatus,
        troupeMembershipId: UUID,
    ): SeasonParticipantEntity?

    fun findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIgnoreCase(
        seasonId: UUID,
        status: ParticipantStatus,
        normalizedEmail: String,
    ): List<SeasonParticipantEntity>

    fun findBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
        seasonId: UUID,
        status: ParticipantStatus,
        displayName: String,
    ): List<SeasonParticipantEntity>

    fun existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCase(
        seasonId: UUID,
        status: ParticipantStatus,
        displayName: String,
    ): Boolean

    fun existsBySeason_IdAndStatusAndTroupeMembershipIdIsNullAndDisplayNameIgnoreCaseAndIdNot(
        seasonId: UUID,
        status: ParticipantStatus,
        displayName: String,
        id: UUID,
    ): Boolean

    fun existsBySeason_IdAndStatusAndDisplayNameIgnoreCaseAndIdNot(
        seasonId: UUID,
        status: ParticipantStatus,
        displayName: String,
        id: UUID,
    ): Boolean

    fun countBySeason_IdAndStatus(
        seasonId: UUID,
        status: ParticipantStatus,
    ): Long

    @Modifying(clearAutomatically = true)
    @Query(
        """
        UPDATE SeasonParticipantEntity p
        SET p.user = :user, p.updatedAt = :now
        WHERE p.normalizedEmail = :email
        AND p.user IS NULL
        AND p.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
        """,
    )
    fun linkUnlinkedByEmail(
        @Param("email") email: String,
        @Param("user") user: com.hatcast.api.user.UserEntity,
        @Param("now") now: Instant,
    ): Int

    @Query(
        """
        SELECT p FROM SeasonParticipantEntity p
        WHERE p.user.id = :userId
        """,
    )
    fun findAllByUser_Id(
        @Param("userId") userId: UUID,
    ): List<SeasonParticipantEntity>
}

interface EventParticipantExclusionRepository : JpaRepository<EventParticipantExclusionEntity, EventParticipantExclusionId> {
    fun findByIdEventId(eventId: UUID): List<EventParticipantExclusionEntity>

    fun existsByIdEventIdAndIdSeasonParticipantId(
        eventId: UUID,
        seasonParticipantId: UUID,
    ): Boolean

    @Modifying(clearAutomatically = true)
    fun deleteByIdEventIdAndIdSeasonParticipantId(
        eventId: UUID,
        seasonParticipantId: UUID,
    ): Int
}

interface EventParticipantRepository : JpaRepository<EventParticipantEntity, UUID> {
    fun findByEvent_IdAndStatusOrderByDisplayNameAsc(
        eventId: UUID,
        status: ParticipantStatus,
    ): List<EventParticipantEntity>

    @Query(
        """
        SELECT p FROM EventParticipantEntity p
        LEFT JOIN FETCH p.user
        LEFT JOIN FETCH p.seasonParticipant sp
        LEFT JOIN FETCH sp.troupeMembership
        WHERE p.event.id = :eventId AND p.status = :status
        ORDER BY p.displayName ASC
        """,
    )
    fun findActiveForEventWithAssociations(
        @Param("eventId") eventId: UUID,
        @Param("status") status: ParticipantStatus,
    ): List<EventParticipantEntity>

    @Query(
        """
        SELECT p FROM EventParticipantEntity p
        LEFT JOIN FETCH p.user
        LEFT JOIN FETCH p.seasonParticipant sp
        WHERE p.event.id = :eventId
          AND p.status = :status
          AND (
            p.user.id = :userId
            OR sp.user.id = :userId
          )
        """,
    )
    fun findActiveForEventLinkedToUser(
        @Param("eventId") eventId: UUID,
        @Param("status") status: ParticipantStatus,
        @Param("userId") userId: UUID,
    ): List<EventParticipantEntity>

    fun findByIdAndEvent_Id(
        id: UUID,
        eventId: UUID,
    ): EventParticipantEntity?

    fun findByEvent_IdAndStatusAndUser_Id(
        eventId: UUID,
        status: ParticipantStatus,
        userId: UUID,
    ): List<EventParticipantEntity>

    fun findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIgnoreCase(
        eventId: UUID,
        status: ParticipantStatus,
        normalizedEmail: String,
    ): List<EventParticipantEntity>

    fun findByEvent_IdAndStatusAndSeasonParticipantIsNullAndNormalizedEmailIsNullAndDisplayNameIgnoreCase(
        eventId: UUID,
        status: ParticipantStatus,
        displayName: String,
    ): List<EventParticipantEntity>

    fun findByEvent_IdAndStatusAndSeasonParticipant_TroupeMembership_Id(
        eventId: UUID,
        status: ParticipantStatus,
        troupeMembershipId: UUID,
    ): List<EventParticipantEntity>

    @Modifying(clearAutomatically = true)
    @Query(
        """
        UPDATE EventParticipantEntity p
        SET p.user = :user, p.updatedAt = :now
        WHERE p.normalizedEmail = :email
        AND p.user IS NULL
        AND p.status = com.hatcast.api.participant.ParticipantStatus.ACTIVE
        """,
    )
    fun linkUnlinkedByEmail(
        @Param("email") email: String,
        @Param("user") user: com.hatcast.api.user.UserEntity,
        @Param("now") now: Instant,
    ): Int

    @Query(
        """
        SELECT p FROM EventParticipantEntity p
        WHERE p.user.id = :userId
        """,
    )
    fun findAllByUser_Id(
        @Param("userId") userId: UUID,
    ): List<EventParticipantEntity>
}
