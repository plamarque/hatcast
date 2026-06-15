package com.hatcast.api.availability

import com.hatcast.api.event.SpectacleCategoryCompartmentJpql
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.time.Instant
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

    /**
     * Available rows on validated past events in the same season/compartment (19.10 operational scope).
     */
    @Query(
        """
        SELECT ea FROM EventAvailabilityEntity ea
        JOIN FETCH ea.event e
        JOIN EventCompositionEntity c ON c.eventId = e.id
        LEFT JOIN FETCH ea.seasonParticipant sp
        LEFT JOIN FETCH ea.eventParticipant ep
        LEFT JOIN FETCH ea.user u
        WHERE e.season.id = :seasonId
          AND e.id <> :excludeEventId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND ea.status = com.hatcast.api.availability.StoredAvailabilityStatus.AVAILABLE
          AND (
            sp.id IN :participantIds
            OR ep.id IN :participantIds
            OR ea.user.id IN :userIds
          )
          AND ${SpectacleCategoryCompartmentJpql.EVENT_IN_CATEGORY}
        """,
    )
    fun findAvailableOnValidatedEventsOperational(
        @Param("seasonId") seasonId: UUID,
        @Param("excludeEventId") excludeEventId: UUID,
        @Param("categorySlug") categorySlug: String,
        @Param("participantIds") participantIds: Collection<UUID>,
        @Param("userIds") userIds: Collection<UUID>,
    ): List<EventAvailabilityEntity>

    /**
     * Available rows on validated past events strictly before [beforeEvent] (19.10 retrospective scope).
     */
    @Query(
        """
        SELECT ea FROM EventAvailabilityEntity ea
        JOIN FETCH ea.event e
        JOIN EventCompositionEntity c ON c.eventId = e.id
        LEFT JOIN FETCH ea.seasonParticipant sp
        LEFT JOIN FETCH ea.eventParticipant ep
        LEFT JOIN FETCH ea.user u
        WHERE e.season.id = :seasonId
          AND e.archived = false
          AND c.validatedAt IS NOT NULL
          AND ea.status = com.hatcast.api.availability.StoredAvailabilityStatus.AVAILABLE
          AND (
            sp.id IN :participantIds
            OR ep.id IN :participantIds
            OR ea.user.id IN :userIds
          )
          AND (
            e.startsAt < :beforeStartsAt
            OR (e.startsAt = :beforeStartsAt AND e.createdAt < :beforeCreatedAt)
            OR (e.startsAt = :beforeStartsAt AND e.createdAt = :beforeCreatedAt AND e.id < :beforeEventId)
          )
          AND ${SpectacleCategoryCompartmentJpql.EVENT_IN_CATEGORY}
        """,
    )
    fun findAvailableOnValidatedEventsRetrospective(
        @Param("seasonId") seasonId: UUID,
        @Param("beforeEventId") beforeEventId: UUID,
        @Param("beforeStartsAt") beforeStartsAt: Instant,
        @Param("beforeCreatedAt") beforeCreatedAt: Instant,
        @Param("categorySlug") categorySlug: String,
        @Param("participantIds") participantIds: Collection<UUID>,
        @Param("userIds") userIds: Collection<UUID>,
    ): List<EventAvailabilityEntity>
}
