package com.hatcast.api.availability.draw

import com.hatcast.api.role.RoleLabels
import kotlin.math.max

/**
 * V1 past-participation malus: `1 / (1 + pastSelectionCount)` (ADR 0019, story 19.6).
 * Stable id for factor breakdown (story 19.7).
 */
object PastParticipationFactor : LabeledDrawWeightFactor {
    const val FACTOR_ID = "past_participation"

    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double {
        val past = max(0, context.pastSelectionCount)
        return 1.0 / (1.0 + past)
    }

    override fun adjustmentLabel(context: DrawWeightContext): String {
        val past = max(0, context.pastSelectionCount)
        val roleLabel = RoleLabels.label(context.roleKey, context.participantGender)
        return if (past == 0) {
            "Jamais $roleLabel"
        } else {
            "Déjà $roleLabel $past fois"
        }
    }
}
