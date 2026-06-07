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
            weight * factor.multiplier(context)
        }

    companion object {
        val EMPTY: DrawWeightPipeline = DrawWeightPipeline(emptyList())

        fun of(vararg factors: DrawWeightFactor): DrawWeightPipeline = of(factors.toList())

        fun of(factors: List<DrawWeightFactor>): DrawWeightPipeline = DrawWeightPipeline(factors.toList())
    }
}

/** Default troupe/event configuration until Wave B factor registration (19.6+). */
object DrawWeightPipelines {
    val DEFAULT: DrawWeightPipeline = DrawWeightPipeline.EMPTY
}
