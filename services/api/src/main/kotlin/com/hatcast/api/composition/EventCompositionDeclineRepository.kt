package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventCompositionDeclineRepository : JpaRepository<EventCompositionDeclineEntity, UUID> {
    fun findByEventIdOrderByDeclinedAtDesc(eventId: UUID): List<EventCompositionDeclineEntity>
}
