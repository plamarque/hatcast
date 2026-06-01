package com.hatcast.api.notification

import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.season.SeasonStatisticsService
import com.hatcast.api.user.UserRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ProxyWorkflowNotificationAdapter(
    private val dispatcher: NotificationDispatcher,
    private val userRepository: UserRepository,
) : ProxyNotificationPort {
    override fun notifyProxyAvailabilityRecorded(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        subjectUserId: UUID,
        change: ProxyAvailabilityChange,
    ) {
        if (actorUserId == subjectUserId) {
            return
        }
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.PROXY_AVAILABILITY_RECORDED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
                subjectUserId = subjectUserId,
                actorDisplayName = resolveActorDisplayName(actorUserId),
                proxyChangeSummary =
                    ProxyChangeSummary.Availability(
                        beforeLabel = change.beforeLabel,
                        afterLabel = change.afterLabel,
                        roleKeysSummary = change.roleKeysSummary,
                        commentSnippet = change.commentSnippet,
                    ),
            ),
        )
    }

    override fun notifyProxyParticipationRecorded(
        eventId: UUID,
        seasonId: UUID,
        troupeId: UUID,
        actorUserId: UUID,
        subjectUserId: UUID,
        roleKey: String,
        participationStatus: SlotParticipationStatus,
    ) {
        if (actorUserId == subjectUserId) {
            return
        }
        val roleLabel = SeasonStatisticsService.ROLE_LABELS[roleKey] ?: roleKey
        dispatcher.dispatch(
            NotificationDispatchContext(
                intent = NotificationIntent.PROXY_CONFIRMATION_RECORDED,
                eventId = eventId,
                seasonId = seasonId,
                troupeId = troupeId,
                actorUserId = actorUserId,
                subjectUserId = subjectUserId,
                roleKey = roleKey,
                actorDisplayName = resolveActorDisplayName(actorUserId),
                proxyChangeSummary =
                    ProxyChangeSummary.Participation(
                        decisionLabel = ProxyNotificationLabels.participationStatusLabel(participationStatus),
                        roleLabel = roleLabel,
                    ),
            ),
        )
    }

    private fun resolveActorDisplayName(actorUserId: UUID): String {
        val user = userRepository.findById(actorUserId).orElse(null) ?: return "Un organisateur"
        return user.memberDisplayName?.trim()?.takeIf { it.isNotEmpty() }
            ?: user.displayName?.trim()?.takeIf { it.isNotEmpty() }
            ?: "Un organisateur"
    }
}
