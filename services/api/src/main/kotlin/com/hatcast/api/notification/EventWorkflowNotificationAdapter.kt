package com.hatcast.api.notification

import com.hatcast.api.event.EventNotificationPort
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class EventWorkflowNotificationAdapter(
    private val dispatcher: NotificationDispatcher,
) : EventNotificationPort {
    override fun publishAvailabilityOpened(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.AVAILABILITY_OPENED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
            ),
        )
    }
}
