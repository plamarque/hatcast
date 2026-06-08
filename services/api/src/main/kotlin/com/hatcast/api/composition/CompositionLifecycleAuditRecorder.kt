package com.hatcast.api.composition

import com.hatcast.api.audit.AuditActionType
import com.hatcast.api.audit.AuditEventRecorder
import com.hatcast.api.audit.AuditRecordRequest
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.RoleTemplates
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CompositionLifecycleAuditRecorder(
    private val compositionRepository: EventCompositionRepository,
    private val slotRepository: EventCompositionSlotRepository,
    private val lifecycleService: CompositionLifecycleService,
    private val auditRecorder: AuditEventRecorder,
    private val eventPublisher: ApplicationEventPublisher,
) {
    fun captureRawLifecycle(
        eventId: UUID,
        roleSlots: Map<String, Int>,
    ): CompositionLifecycle {
        val composition = compositionRepository.findById(eventId).orElse(null)
        val slots = slotRepository.findByEventId(eventId).map { it.toLifecycleSnapshot() }
        val snapshot =
            composition?.let {
                CompositionSnapshot(validatedAt = it.validatedAt, publishedAt = it.publishedAt)
            }
        return lifecycleService.computeRawLifecycle(
            composition = snapshot,
            slots = slots,
            roleSlots = RoleTemplates.normalize(roleSlots),
        )
    }

    fun recordIfChanged(
        event: EventEntity,
        seasonId: UUID,
        before: CompositionLifecycle,
    ) {
        val after = captureRawLifecycle(event.id, event.roleSlots)
        if (before == after) {
            return
        }
        val beforeBadge = TeamStatusBadgeMapper.fromLifecycle(before)
        val afterBadge = TeamStatusBadgeMapper.fromLifecycle(after)
        auditRecorder.record(
            AuditRecordRequest(
                actionType = AuditActionType.COMPOSITION_LIFECYCLE_CHANGED,
                actorUserId = null,
                troupeId = event.season.troupe.id,
                seasonId = seasonId,
                eventId = event.id,
                before =
                    mapOf(
                        "compositionLifecycle" to before.toApiValue(),
                        "teamStatusBadgeKey" to beforeBadge.key.toApiKey(),
                    ),
                after =
                    mapOf(
                        "compositionLifecycle" to after.toApiValue(),
                        "teamStatusBadgeKey" to afterBadge.key.toApiKey(),
                    ),
            ),
        )
        if (before != CompositionLifecycle.COMPLETE && after == CompositionLifecycle.COMPLETE) {
            eventPublisher.publishEvent(
                TeamCompleteMemberRequestedEvent(
                    eventId = event.id,
                    seasonId = seasonId,
                ),
            )
            eventPublisher.publishEvent(
                TeamCompleteOrganizerRequestedEvent(
                    eventId = event.id,
                    seasonId = seasonId,
                    troupeId = event.season.troupe.id,
                ),
            )
        }
    }
}

private fun EventCompositionSlotEntity.toLifecycleSnapshot(): CompositionSlotSnapshot =
    CompositionSlotSnapshot(
        roleKey = roleKey,
        slotIndex = slotIndex,
        participantId = assignedParticipantId(),
        participationStatus = participationStatus,
        waived = waived,
    )
