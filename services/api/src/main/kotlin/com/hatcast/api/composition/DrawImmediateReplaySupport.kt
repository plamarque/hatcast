package com.hatcast.api.composition

import com.hatcast.api.availability.draw.DrawWeightPipeline
import com.hatcast.api.availability.draw.DrawWeightPipelines
import com.hatcast.api.event.EventEntity
import java.time.Instant
import java.util.UUID

/** Resolves immediate-replay draw inputs only when the pipeline includes [ImmediateReplayFactor] (19.9). */
internal object DrawImmediateReplaySupport {
    data class ReplayWeightInputs(
        val byParticipant: Map<UUID, Boolean> = emptyMap(),
        val predecessorTitle: String? = null,
        val predecessorStartsAt: Instant? = null,
    )

    fun replayInputsForRolePool(
        pipeline: DrawWeightPipeline,
        event: EventEntity,
        roleKey: String,
        pool: List<CompositionEligibleParticipant>,
        replayService: ImmediatePredecessorRoleReplayService,
    ): ReplayWeightInputs {
        if (!DrawWeightPipelines.includesImmediateReplay(pipeline)) {
            return ReplayWeightInputs()
        }
        val snapshot =
            replayService.playedSameRoleOnImmediatePredecessorByParticipant(
                currentEvent = event,
                roleKey = roleKey,
                eligibleInPool = pool,
            )
        return ReplayWeightInputs(
            byParticipant = snapshot.playedSameRoleOnImmediatePredecessorByParticipant,
            predecessorTitle = snapshot.predecessor?.title,
            predecessorStartsAt = snapshot.predecessor?.startsAt,
        )
    }
}
