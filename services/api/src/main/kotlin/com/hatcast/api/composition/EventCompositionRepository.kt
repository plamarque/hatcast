package com.hatcast.api.composition

import jakarta.persistence.LockModeType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import java.util.Optional
import java.util.UUID

interface EventCompositionRepository : JpaRepository<EventCompositionEntity, UUID> {
    fun findByEventIdIn(eventIds: Collection<UUID>): List<EventCompositionEntity>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EventCompositionEntity e WHERE e.eventId = :eventId")
    fun findByEventIdForUpdate(eventId: UUID): Optional<EventCompositionEntity>
}
