package com.hatcast.api.composition

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.util.UUID

interface CompositionNotificationPort {
    fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    )
}

@Component
class NoOpCompositionNotificationAdapter : CompositionNotificationPort {
    private val log = LoggerFactory.getLogger(javaClass)

    override fun publishDraftCompositionShared(
        eventId: UUID,
        seasonId: UUID,
        actorUserId: UUID,
    ) {
        log.debug(
            "draft_composition_shared eventId={} seasonId={} actorUserId={}",
            eventId,
            seasonId,
            actorUserId,
        )
    }
}
