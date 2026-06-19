package com.hatcast.api.availability.draw

import com.hatcast.api.role.RoleLabels
import kotlin.math.max
import kotlin.math.pow

/**
 * V1 past-participation malus: `(1 / (1 + pastSelectionCount))^strength` (ADR 0019, story 19.6 / 19.19b).
 * Stable id for factor breakdown (story 19.7).
 */
class PastParticipationFactor(
    private val strength: Double = DEFAULT_STRENGTH,
) : LabeledDrawWeightFactor {
    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double {
        val past = max(0, context.pastSelectionCount)
        if (strength == 0.0) {
            return 1.0
        }
        return (1.0 / (1.0 + past)).pow(strength)
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

    companion object {
        const val FACTOR_ID = "past_participation"
        const val DEFAULT_STRENGTH = 1.0

        val DEFAULT: PastParticipationFactor = PastParticipationFactor()
    }
}
