package com.hatcast.api.availability.draw

import com.hatcast.api.role.RoleLabels

/**
 * Penalizes or excludes candidates who held the same role on the immediate validated predecessor
 * in the same category compartment (story 19.9). Off by default in [DrawWeightPipelines.DEFAULT].
 */
class ImmediateReplayFactor(
    val mode: ImmediateReplayMode,
    private val malusMultiplier: Double = MALUS_MULTIPLIER,
) : LabeledDrawWeightFactor {
    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double {
        if (!context.playedSameRoleOnImmediatePredecessor) {
            return 1.0
        }
        return when (mode) {
            ImmediateReplayMode.OFF -> 1.0
            ImmediateReplayMode.EXCLUDE -> 0.0
            ImmediateReplayMode.MALUS -> malusMultiplier
        }
    }

    override fun adjustmentLabel(context: DrawWeightContext): String {
        return if (context.playedSameRoleOnImmediatePredecessor) {
            val roleLabel = RoleLabels.label(context.roleKey, context.participantGender)
            "$roleLabel au spectacle précédent"
        } else {
            val roleLabel = RoleLabels.label(context.roleKey)
            val role = if (roleLabel.all { it.isUpperCase() }) roleLabel else roleLabel.replaceFirstChar { it.lowercaseChar() }
            "Un autre candidat était $role au spectacle précédent"
        }
    }

    companion object {
        const val FACTOR_ID = "immediate_replay"
        const val MALUS_MULTIPLIER = 0.25
    }
}
