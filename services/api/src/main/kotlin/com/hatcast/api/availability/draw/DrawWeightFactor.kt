package com.hatcast.api.availability.draw

/** Pluggable draw-weight multiplier (ADR 0019 Wave B). */
fun interface DrawWeightFactor {
    fun multiplier(context: DrawWeightContext): Double
}
