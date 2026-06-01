package com.hatcast.api.composition

import com.hatcast.api.event.RoleTemplates
import org.springframework.stereotype.Service
import java.time.Instant

data class CompositionSnapshot(
    val validatedAt: Instant?,
    val publishedAt: Instant? = null,
)

data class CompositionSlotSnapshot(
    val roleKey: String,
    val slotIndex: Int,
    val participantId: java.util.UUID?,
    val participationStatus: SlotParticipationStatus,
    val waived: Boolean,
)

@Service
class CompositionLifecycleService {
    fun computeLifecycle(
        composition: CompositionSnapshot?,
        slots: List<CompositionSlotSnapshot>,
        roleSlots: Map<String, Int>,
        viewerCanSeeDraft: Boolean,
    ): CompositionLifecycleView {
        val raw = computeRawLifecycle(composition, slots, roleSlots)
        val display =
            if (raw == CompositionLifecycle.DRAFT_COMPOSITION && !viewerCanSeeDraft) {
                CompositionLifecycle.PREPARING
            } else {
                raw
            }
        return CompositionLifecycleView(
            compositionLifecycle = display,
            teamStatusBadge = TeamStatusBadgeMapper.fromLifecycle(display),
        )
    }

    fun computeRawLifecycle(
        composition: CompositionSnapshot?,
        slots: List<CompositionSlotSnapshot>,
        roleSlots: Map<String, Int>,
    ): CompositionLifecycle {
        val assignedCount = slots.count { it.participantId != null }
        if (composition == null) {
            return CompositionLifecycle.PREPARING
        }
        if (assignedCount == 0) {
            return if (composition.validatedAt != null) {
                CompositionLifecycle.GAPS_TO_FILL
            } else {
                CompositionLifecycle.PREPARING
            }
        }
        if (composition.validatedAt == null) {
            return CompositionLifecycle.DRAFT_COMPOSITION
        }
        if (hasEmptyRequiredSlot(slots, roleSlots)) {
            return CompositionLifecycle.GAPS_TO_FILL
        }
        if (allRequiredSlotsComplete(slots, roleSlots)) {
            return CompositionLifecycle.COMPLETE
        }
        return CompositionLifecycle.AWAITING_CONFIRMATIONS
    }

    private fun hasEmptyRequiredSlot(
        slots: List<CompositionSlotSnapshot>,
        roleSlots: Map<String, Int>,
    ): Boolean {
        val byPosition = slots.associateBy { it.roleKey to it.slotIndex }
        return requiredPositions(roleSlots).any { (role, index) ->
            val row = byPosition[role to index]
            row == null || !isEffectivelyFilled(row)
        }
    }

    private fun allRequiredSlotsComplete(
        slots: List<CompositionSlotSnapshot>,
        roleSlots: Map<String, Int>,
    ): Boolean {
        val byPosition = slots.associateBy { it.roleKey to it.slotIndex }
        return requiredPositions(roleSlots).all { (role, index) ->
            val row = byPosition[role to index] ?: return false
            isEffectivelyFilled(row) &&
                (row.waived || row.participationStatus == SlotParticipationStatus.CONFIRMED)
        }
    }

    private fun isEffectivelyFilled(row: CompositionSlotSnapshot): Boolean =
        row.participantId != null && row.participationStatus != SlotParticipationStatus.DECLINED

    private fun requiredPositions(roleSlots: Map<String, Int>): List<Pair<String, Int>> {
        val normalized = RoleTemplates.normalize(roleSlots)
        return normalized.flatMap { (role, count) ->
            (0 until count).map { role to it }
        }
    }
}

object TeamStatusBadgeMapper {
    fun fromLifecycle(lifecycle: CompositionLifecycle): TeamStatusBadge {
        val key =
            when (lifecycle) {
                CompositionLifecycle.PREPARING -> TeamStatusBadgeKey.COLLECTING
                CompositionLifecycle.DRAFT_COMPOSITION,
                CompositionLifecycle.AWAITING_CONFIRMATIONS,
                CompositionLifecycle.GAPS_TO_FILL,
                -> TeamStatusBadgeKey.PREPARING
                CompositionLifecycle.COMPLETE -> TeamStatusBadgeKey.CONFIRMED
            }
        return TeamStatusBadge(
            key = key,
            label = labelFor(key),
            tone = key.toTone(),
            shortLabel = shortLabelFor(key),
        )
    }

    fun draftEventBadge(): TeamStatusBadge =
        TeamStatusBadge(
            key = TeamStatusBadgeKey.DRAFT,
            label = "Brouillon",
            tone = TeamStatusBadgeKey.DRAFT.toTone(),
            shortLabel = "Brouillon",
        )

    private fun labelFor(key: TeamStatusBadgeKey): String =
        when (key) {
            TeamStatusBadgeKey.DRAFT -> "Brouillon"
            TeamStatusBadgeKey.COLLECTING -> "Collecte des dispos"
            TeamStatusBadgeKey.PREPARING -> "Équipe en préparation"
            TeamStatusBadgeKey.CONFIRMED -> "Équipe confirmée"
        }

    private fun shortLabelFor(key: TeamStatusBadgeKey): String =
        when (key) {
            TeamStatusBadgeKey.DRAFT -> "Brouillon"
            TeamStatusBadgeKey.COLLECTING -> "Collecte"
            TeamStatusBadgeKey.PREPARING -> "Préparation"
            TeamStatusBadgeKey.CONFIRMED -> "Confirmé"
        }
}
