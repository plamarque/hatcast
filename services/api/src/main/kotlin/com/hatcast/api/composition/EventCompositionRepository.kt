package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventCompositionRepository : JpaRepository<EventCompositionEntity, UUID> {
    fun findByEventIdIn(eventIds: Collection<UUID>): List<EventCompositionEntity>
}
