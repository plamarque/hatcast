package com.hatcast.api.event

import org.slf4j.LoggerFactory
import java.util.UUID

interface EventNotificationPort {
    fun publishAvailabilityOpened(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    )

    fun publishEventDetailsChanged(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        changeSummary: com.hatcast.api.notification.EventDetailsChangeSummary,
    )

    fun publishEventArchived(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    )
}

class NoOpEventNotificationAdapter : EventNotificationPort {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun publishAvailabilityOpened(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "availability_opened eventId={} seasonId={} troupeId={} actorUserId={}",
            eventId,
            seasonId,
            troupeId,
            actorUserId,
        )
    }

    override fun publishEventDetailsChanged(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        changeSummary: com.hatcast.api.notification.EventDetailsChangeSummary,
    ) {
        log.debug(
            "event_details_changed eventId={} seasonId={} troupeId={} actorUserId={}",
            eventId,
            seasonId,
            troupeId,
            actorUserId,
        )
    }

    override fun publishEventArchived(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "event_archived eventId={} seasonId={} troupeId={} actorUserId={}",
            eventId,
            seasonId,
            troupeId,
            actorUserId,
        )
    }
}
