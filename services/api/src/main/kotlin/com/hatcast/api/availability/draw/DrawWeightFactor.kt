package com.hatcast.api.availability.draw

/**
 * Pluggable draw-weight multiplier (ADR 0019 Wave B).
 * Default troupe config uses an empty pipeline until optional factors are enabled (Wave C+).
 */
fun interface DrawWeightFactor {
    fun multiplier(context: DrawWeightContext): Double
}
