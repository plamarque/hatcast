package com.hatcast.api.event

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

interface EventNotificationPort {
    fun publishAvailabilityOpened(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    )
}

@Component
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
}
