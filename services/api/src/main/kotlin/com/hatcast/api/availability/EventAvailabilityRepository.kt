package com.hatcast.api.availability

import org.springframework.data.jpa.repository.JpaRepository
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

    fun findByEvent_Id(eventId: UUID): List<EventAvailabilityEntity>
}
