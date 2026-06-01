package com.hatcast.api.composition

import java.util.UUID

data class TeamValidatedFyiRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
)

data class CompositionAssigneeRemovedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
    val formerAssigneeParticipantId: UUID,
    val roleKey: String,
    val slotIndex: Int,
)

data class CompositionReconfirmationRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
    val assigneeParticipantIds: List<UUID>,
)
