package com.hatcast.api.composition

import java.util.UUID

data class TeamValidatedFyiRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID,
)

data class TeamCompleteMemberRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val actorUserId: UUID? = null,
)

data class TeamCompleteOrganizerRequestedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID? = null,
)

data class AssigneeDeclinedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID,
    val assigneeDisplayName: String,
    val roleKey: String,
    val slotIndex: Int,
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
