package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventCompositionSlotRepository : JpaRepository<EventCompositionSlotEntity, UUID> {
    fun findByEventIdIn(eventIds: Collection<UUID>): List<EventCompositionSlotEntity>

    fun findByEventId(eventId: UUID): List<EventCompositionSlotEntity>
}
