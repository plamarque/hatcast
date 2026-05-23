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

    fun findBySeason_IdAndTroupeMembership_Id(
        seasonId: UUID,
        troupeMembershipId: UUID,
    ): SeasonParticipantEntity?

    fun findByIdAndSeason_Id(
        id: UUID,
        seasonId: UUID,
    ): SeasonParticipantEntity?

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
}

interface EventParticipantRepository : JpaRepository<EventParticipantEntity, UUID> {
    fun findByEvent_IdAndStatusOrderByDisplayNameAsc(
        eventId: UUID,
        status: ParticipantStatus,
    ): List<EventParticipantEntity>

    fun findByIdAndEvent_Id(
        id: UUID,
        eventId: UUID,
    ): EventParticipantEntity?

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
}
