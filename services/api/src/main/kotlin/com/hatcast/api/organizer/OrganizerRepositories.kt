package com.hatcast.api.organizer

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface SeasonOrganizerRepository : JpaRepository<SeasonOrganizerEntity, SeasonOrganizerId> {
    fun existsByUser_Id(userId: UUID): Boolean

    @Query(
        """
        SELECT CASE WHEN COUNT(so) > 0 THEN true ELSE false END
        FROM SeasonOrganizerEntity so
        JOIN so.season s
        JOIN TroupeMembershipEntity tm ON tm.troupe = s.troupe AND tm.user.id = :userId
        WHERE so.user.id = :userId
          AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        """,
    )
    fun existsByUser_IdOnActiveTroupeMembership(
        @Param("userId") userId: UUID,
    ): Boolean

    fun findBySeason_IdOrderByGrantedAtAsc(seasonId: UUID): List<SeasonOrganizerEntity>

    fun findBySeason_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): SeasonOrganizerEntity?

    fun existsBySeason_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): Boolean
}

interface EventOrganizerRepository : JpaRepository<EventOrganizerEntity, EventOrganizerId> {
    fun existsByUser_Id(userId: UUID): Boolean

    @Query(
        """
        SELECT CASE WHEN COUNT(eo) > 0 THEN true ELSE false END
        FROM EventOrganizerEntity eo
        JOIN eo.event e
        JOIN e.season s
        JOIN TroupeMembershipEntity tm ON tm.troupe = s.troupe AND tm.user.id = :userId
        WHERE eo.user.id = :userId
          AND tm.status = com.hatcast.api.troupe.TroupeMembershipStatus.ACTIVE
        """,
    )
    fun existsByUser_IdOnActiveTroupeMembership(
        @Param("userId") userId: UUID,
    ): Boolean

    fun findByEvent_IdOrderByGrantedAtAsc(eventId: UUID): List<EventOrganizerEntity>

    fun findByEvent_Season_IdAndUser_Id(
        seasonId: UUID,
        userId: UUID,
    ): List<EventOrganizerEntity>

    fun findByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): EventOrganizerEntity?

    fun existsByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): Boolean

    fun findByEvent_IdInAndUser_Id(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): List<EventOrganizerEntity>
}
