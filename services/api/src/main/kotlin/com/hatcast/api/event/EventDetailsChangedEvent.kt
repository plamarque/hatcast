package com.hatcast.api.event

import com.hatcast.api.notification.EventDetailsChangeSummary
import java.util.UUID

data class EventDetailsChangedEvent(
    val eventId: UUID,
    val seasonId: UUID,
    val troupeId: UUID,
    val actorUserId: UUID,
    val changeSummary: EventDetailsChangeSummary,
)
