package com.hatcast.api.availability.draw

/**
 * Ordered factor registry: `finalWeight = baseWeight × Π factorMultiplier` (ADR 0019).
 */
class DrawWeightPipeline private constructor(
    private val factors: List<DrawWeightFactor>,
) {
    fun apply(
        baseWeight: Double,
        context: DrawWeightContext,
    ): Double =
        factors.fold(baseWeight) { weight, factor ->
            weight * sanitizeMultiplier(factor.multiplier(context))
        }

    /**
     * Invalid factor multipliers (NaN, infinite, negative) are treated as `0.0` so the
     * candidate is effectively excluded rather than corrupting the draw pool.
     */
    internal fun sanitizeMultiplier(value: Double): Double =
        if (value.isFinite() && value >= 0.0) value else 0.0

    companion object {
        val EMPTY: DrawWeightPipeline = DrawWeightPipeline(emptyList())

        fun of(vararg factors: DrawWeightFactor): DrawWeightPipeline = of(factors.toList())

        fun of(factors: List<DrawWeightFactor>): DrawWeightPipeline = DrawWeightPipeline(factors.toList())
    }
}

/** Default troupe/event configuration: V1 past-participation malus only (story 19.6). */
object DrawWeightPipelines {
    val DEFAULT: DrawWeightPipeline = DrawWeightPipeline.of(PastParticipationFactor)
}
