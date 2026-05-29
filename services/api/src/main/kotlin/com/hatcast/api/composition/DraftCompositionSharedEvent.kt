package com.hatcast.api.composition

import java.util.UUID

data class DraftCompositionSharedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
)
