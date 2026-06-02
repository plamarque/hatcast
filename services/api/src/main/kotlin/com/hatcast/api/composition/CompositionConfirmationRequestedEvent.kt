package com.hatcast.api.composition

import java.util.UUID

data class CompositionConfirmationRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
    val assigneeParticipantIds: List<UUID> = emptyList(),
)
