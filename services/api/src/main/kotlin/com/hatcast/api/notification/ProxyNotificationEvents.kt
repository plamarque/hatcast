package com.hatcast.api.notification

import com.hatcast.api.composition.SlotParticipationStatus
import java.util.UUID

data class ProxyAvailabilityRecordedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID,
    val subjectUserId: UUID,
    val change: ProxyAvailabilityChange,
)

data class ProxyAvailabilityChange(
    val beforeLabel: String,
    val afterLabel: String,
    val roleKeysSummary: String? = null,
    val commentSnippet: String? = null,
)

data class ProxyParticipationRecordedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID,
    val subjectUserId: UUID,
    val roleKey: String,
    val participationStatus: SlotParticipationStatus,
    val beforeParticipationStatus: SlotParticipationStatus? = null,
)
