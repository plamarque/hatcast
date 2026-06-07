package com.hatcast.api.availability.draw

/** Pluggable draw-weight multiplier (ADR 0019 Wave B). */
fun interface DrawWeightFactor {
    fun multiplier(context: DrawWeightContext): Double
}

/** Factor with stable id and French product copy for explainability breakdown (story 19.7). */
interface LabeledDrawWeightFactor : DrawWeightFactor {
    val factorId: String

    fun adjustmentLabel(context: DrawWeightContext): String
}
