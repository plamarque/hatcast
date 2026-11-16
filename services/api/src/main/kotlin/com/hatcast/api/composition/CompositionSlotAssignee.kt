package com.hatcast.api.composition

import java.util.UUID

enum class CompositionParticipantSource {
    SEASON,
    EVENT,
}

fun EventCompositionSlotEntity.assignedParticipantId(): UUID? = seasonParticipantId ?: eventParticipantId

fun EventCompositionSlotEntity.hasAssignee(): Boolean = assignedParticipantId() != null

fun EventCompositionSlotEntity.clearAssignee() {
    seasonParticipantId = null
    eventParticipantId = null
    selectionChancePercent = null
    selectionChanceAt = null
    selectionChanceSource = null
}

fun EventCompositionSlotEntity.setAssignee(participant: CompositionEligibleParticipant) {
    if (assignedParticipantId() != participant.participantId) {
        selectionChancePercent = null
        selectionChanceAt = null
        selectionChanceSource = null
    }
    when (participant.source) {
        CompositionParticipantSource.SEASON -> {
            seasonParticipantId = participant.participantId
            eventParticipantId = null
        }
        CompositionParticipantSource.EVENT -> {
            eventParticipantId = participant.participantId
            seasonParticipantId = null
        }
    }
}
