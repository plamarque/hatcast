package com.hatcast.api.notification

import com.hatcast.api.composition.SlotParticipationStatus
import java.util.UUID

interface ProxyNotificationPort {
    fun notifyProxyAvailabilityRecorded(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        subjectUserId: UUID,
        change: ProxyAvailabilityChange,
    )

    fun notifyProxyParticipationRecorded(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        subjectUserId: UUID,
        roleKey: String,
        participationStatus: SlotParticipationStatus,
    )
}
