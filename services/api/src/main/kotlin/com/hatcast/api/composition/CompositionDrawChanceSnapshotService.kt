package com.hatcast.api.composition

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

data class DrawChanceSnapshotInput(
    val roleKey: String,
    val participantId: UUID,
    val chancePercent: Int,
    val pastSelectionCount: Int,
    val requiredCount: Int,
    val candidateCount: Int,
)

@Service
class CompositionDrawChanceSnapshotService(
    private val repository: EventDrawChanceSnapshotRepository,
) {
    @Transactional(readOnly = true)
    fun findByEventId(eventId: UUID): List<EventDrawChanceSnapshotEntity> = repository.findByIdEventId(eventId)

    @Transactional(readOnly = true)
    fun existsByEventId(eventId: UUID): Boolean = repository.existsByIdEventId(eventId)

    /**
     * Full draw replaces snapshot rows for the roles that were actually fully redrawn (AC 6.14-2).
     *
     * Only roles in [fullyRedrawnRoleKeys] that produced fresh rows are deleted, so:
     * - assignees kept on a partially-filled role under a full draw keep their frozen %,
     * - a redraw that yields no candidate for a role does not wipe its existing snapshot.
     */
    @Transactional
    fun replaceForFullDraw(
        eventId: UUID,
        fullyRedrawnRoleKeys: Set<String>,
        snapshots: List<DrawChanceSnapshotInput>,
        snapshottedAt: Instant,
    ) {
        val rolesWithFreshRows = snapshots.mapTo(mutableSetOf()) { it.roleKey }
        val rolesToReplace = fullyRedrawnRoleKeys intersect rolesWithFreshRows
        if (rolesToReplace.isNotEmpty()) {
            repository.deleteByIdEventIdAndIdRoleKeyIn(eventId, rolesToReplace)
        }
        persistSnapshots(eventId, snapshots, snapshottedAt)
    }

    /**
     * Fill-empty upserts only participants touched in this draw request (AC 6.14-3).
     */
    @Transactional
    fun upsertForFillEmpty(
        eventId: UUID,
        snapshots: List<DrawChanceSnapshotInput>,
        snapshottedAt: Instant,
    ) {
        persistSnapshots(eventId, snapshots, snapshottedAt)
    }

    private fun persistSnapshots(
        eventId: UUID,
        snapshots: List<DrawChanceSnapshotInput>,
        snapshottedAt: Instant,
    ) {
        if (snapshots.isEmpty()) {
            return
        }
        val entities =
            snapshots.map { row ->
                EventDrawChanceSnapshotEntity(
                    id =
                        EventDrawChanceSnapshotId(
                            eventId = eventId,
                            roleKey = row.roleKey,
                            participantId = row.participantId,
                        ),
                    chancePercent = row.chancePercent,
                    pastSelectionCount = row.pastSelectionCount,
                    requiredCount = row.requiredCount,
                    candidateCount = row.candidateCount,
                    snapshottedAt = snapshottedAt,
                )
            }
        repository.saveAll(entities)
    }
}
