package com.hatcast.api.event

import java.util.UUID

data class EventDraftCreatedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID,
)
