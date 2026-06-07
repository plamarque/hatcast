package com.hatcast.api.availability.draw

import kotlin.math.max

/**
 * V1 past-participation malus: `1 / (1 + pastSelectionCount)` (ADR 0019, story 19.6).
 * Stable id for factor breakdown (story 19.7).
 */
object PastParticipationFactor : DrawWeightFactor {
    const val FACTOR_ID = "past_participation"

    override fun multiplier(context: DrawWeightContext): Double {
        val past = max(0, context.pastSelectionCount)
        return 1.0 / (1.0 + past)
    }
}
