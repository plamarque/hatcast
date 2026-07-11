package com.hatcast.api.availability.draw

/**
 * Category compartment factor (story 19.8, ex-17.9).
 *
 * Compartment isolation is applied via scoped [DrawWeightContext.pastSelectionCount] from
 * [CategoryCompartmentHistoryScope] before the draw pipeline runs. This factor is always active
 * in [DrawWeightPipelines.DEFAULT] with multiplier `1.0` so final weights stay identical to
 * pre-19.8 runtime. It is **not** surfaced in chance breakdown: category only redefines the
 * basis for [PastParticipationFactor], it is not a separate explainability criterion.
 */
object CategoryCompartmentFactor : LabeledDrawWeightFactor {
    const val FACTOR_ID = "equity_tag"

    override val factorId: String = FACTOR_ID

    override fun multiplier(context: DrawWeightContext): Double = 1.0

    override fun adjustmentLabel(context: DrawWeightContext): String = FACTOR_ID
}
