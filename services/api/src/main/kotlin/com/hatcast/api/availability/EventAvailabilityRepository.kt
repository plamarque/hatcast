package com.hatcast.api.availability

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventAvailabilityRepository : JpaRepository<EventAvailabilityEntity, EventAvailabilityId> {
    fun findByEvent_IdAndUser_Id(
        eventId: UUID,
        userId: UUID,
    ): EventAvailabilityEntity?

    fun findByEvent_IdInAndUser_Id(
        eventIds: Collection<UUID>,
        userId: UUID,
    ): List<EventAvailabilityEntity>
}
