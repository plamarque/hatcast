package com.hatcast.api.participant

import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/** Skips full membership→season sync when a recent pass found all rows already aligned. */
object MembershipParticipantSyncCache {
    private val inSyncSeasonIds = ConcurrentHashMap.newKeySet<UUID>()

    fun isInSync(seasonId: UUID): Boolean = seasonId in inSyncSeasonIds

    fun markInSync(seasonId: UUID) {
        inSyncSeasonIds.add(seasonId)
    }

    fun invalidate(seasonId: UUID) {
        inSyncSeasonIds.remove(seasonId)
    }
}
