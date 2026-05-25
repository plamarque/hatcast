package com.hatcast.api.participant

import java.util.UUID

/** Dedupes `ensureMembershipParticipants` within a single HTTP request (composition perf). */
object MembershipSyncScope {
    private val syncedSeasonIds = ThreadLocal.withInitial { mutableSetOf<UUID>() }

    /** @return true when this season was not yet synced in the current request scope */
    fun markSynced(seasonId: UUID): Boolean = syncedSeasonIds.get().add(seasonId)

    fun clear() {
        syncedSeasonIds.remove()
    }
}
