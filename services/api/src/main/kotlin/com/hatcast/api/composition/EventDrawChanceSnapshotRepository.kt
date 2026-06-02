package com.hatcast.api.composition

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface EventDrawChanceSnapshotRepository : JpaRepository<EventDrawChanceSnapshotEntity, EventDrawChanceSnapshotId> {
    fun findByIdEventId(eventId: UUID): List<EventDrawChanceSnapshotEntity>

    fun existsByIdEventId(eventId: UUID): Boolean

    fun deleteByIdEventId(eventId: UUID)

    fun deleteByIdEventIdAndIdRoleKeyIn(
        eventId: UUID,
        roleKeys: Collection<String>,
    )
}
