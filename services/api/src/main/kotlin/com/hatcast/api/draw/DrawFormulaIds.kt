package com.hatcast.api.draw

import java.util.UUID

/** Deterministic ids for seeded draw formulas (story 19.16 AC 4). */
object DrawFormulaIds {
    private const val SYSTEM_V1_NAMESPACE = "hatcast:draw:system-v1:"

    fun systemV1(troupeId: UUID): UUID =
        UUID.nameUUIDFromBytes("$SYSTEM_V1_NAMESPACE$troupeId".toByteArray(Charsets.UTF_8))
}
