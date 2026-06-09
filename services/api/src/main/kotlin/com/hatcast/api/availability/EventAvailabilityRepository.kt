package com.hatcast.api.availability

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface EventAvailabilityRepository : JpaRepository<EventAvailabilityEntity, UUID> {
    fun findByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): EventAvailabilityEntity?

    fun findByEvent_IdAndSeasonParticipant_Id(
        eventId: UUID,
        seasonParticipantId: UUID,
    ): EventAvailabilityEntity?

    fun findByEvent_IdAndEventParticipant_Id(
        eventId: UUID,
        eventParticipantId: UUID,
    ): EventAvailabilityEntity?

    fun findByEvent_IdInAndUser_Id(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): List<EventAvailabilityEntity>

    fun findByEvent_IdInAndSeasonParticipant_Id(
        eventIds: Collection<UUID>,
        seasonParticipantId: UUID,
    ): List<EventAvailabilityEntity>

    fun findByEvent_Id(eventId: UUID): List<EventAvailabilityEntity>

    fun findByEvent_IdInAndSeasonParticipant_IdIsNotNull(
        eventIds: Collection<UUID>,
    ): List<EventAvailabilityEntity>

    fun findByEvent_IdIn(eventIds: Collection<UUID>): List<EventAvailabilityEntity>

    @Query(
        """
        SELECT ea FROM EventAvailabilityEntity ea
        LEFT JOIN FETCH ea.user
        LEFT JOIN FETCH ea.seasonParticipant sp
        LEFT JOIN FETCH sp.user
        LEFT JOIN FETCH sp.troupeMembership tm
        LEFT JOIN FETCH tm.user
        LEFT JOIN FETCH ea.eventParticipant ep
        LEFT JOIN FETCH ep.user
        WHERE ea.event.id = :eventId
        """,
    )
    fun findByEvent_IdWithAssociations(
        @Param("eventId") eventId: UUID,
    ): List<EventAvailabilityEntity>
}
