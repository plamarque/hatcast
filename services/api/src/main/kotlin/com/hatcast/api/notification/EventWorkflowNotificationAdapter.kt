package com.hatcast.api.notification

import com.hatcast.api.event.EventNotificationPort
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class EventWorkflowNotificationAdapter(
    private val dispatcher: NotificationDispatcher,
) : EventNotificationPort {
    override fun publishEventDraftCreated(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.EVENT_DRAFT_CREATED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
            ),
        )
    }

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

    override fun publishEventDetailsChanged(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        changeSummary: EventDetailsChangeSummary,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.EVENT_DETAILS_CHANGED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
                eventDetailsChangeSummary = changeSummary,
            ),
        )
    }

    override fun publishEventArchived(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
    ) {
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.EVENT_ARCHIVED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
            ),
        )
    }
}
