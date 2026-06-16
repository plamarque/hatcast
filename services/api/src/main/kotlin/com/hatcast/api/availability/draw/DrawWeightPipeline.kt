package com.hatcast.api.availability.draw

/**
 * Ordered factor registry: `finalWeight = baseWeight × Π factorMultiplier` (ADR 0019).
 */
class DrawWeightPipeline private constructor(
    val factors: List<DrawWeightFactor>,
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

/** Default troupe/event configuration: compartment (always on) + past-participation malus (19.8 + 19.6). */
object DrawWeightPipelines {
    val DEFAULT: DrawWeightPipeline =
        DrawWeightPipeline.of(CategoryCompartmentFactor, PastParticipationFactor.DEFAULT)

    /** Test / custom formula builder — immediate replay after past participation (PO OQ-19-9-02). */
    fun withImmediateReplay(mode: ImmediateReplayMode): DrawWeightPipeline {
        if (mode == ImmediateReplayMode.OFF) {
            return DEFAULT
        }
        return DrawWeightPipeline.of(
            CategoryCompartmentFactor,
            PastParticipationFactor.DEFAULT,
            ImmediateReplayFactor(mode),
        )
    }

    fun includesImmediateReplay(pipeline: DrawWeightPipeline): Boolean =
        pipeline.factors.any { it is ImmediateReplayFactor }

    /** Test / custom formula builder — role-request aspiration bonus after past participation (19.10). */
    fun withRoleRequest(): DrawWeightPipeline =
        DrawWeightPipeline.of(
            CategoryCompartmentFactor,
            PastParticipationFactor.DEFAULT,
            RoleRequestFactor.DEFAULT,
        )

    fun includesRoleRequest(pipeline: DrawWeightPipeline): Boolean =
        pipeline.factors.any { it is RoleRequestFactor }
}
