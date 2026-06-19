package com.hatcast.api.composition

import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.event.EventEntity
import java.util.UUID

/** Resolves role-request draw inputs only when the pipeline includes [RoleRequestFactor] (19.10). */
internal object DrawRoleRequestSupport {
    fun unfulfilledCountsForRolePool(
        pipeline: DrawWeightPipeline,
        event: EventEntity,
        roleKey: String,
        pool: List<CompositionEligibleParticipant>,
        roleRequestService: UnfulfilledRoleRequestService,
    ): Map<UUID, Int> {
        if (!DrawWeightPipelines.includesRoleRequest(pipeline)) {
            return emptyMap()
        }
        val participantIds = pool.map { it.participantId }
        val mode = SelectionHistoryModeResolver.forEvent(event)
        return roleRequestService.unfulfilledRoleRequestCountByParticipant(
            event = event,
            roleKey = roleKey,
            participantIds = participantIds,
            mode = mode,
        )
    }
}
