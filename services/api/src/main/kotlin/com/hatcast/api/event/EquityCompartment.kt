package com.hatcast.api.event

/**
 * Equity compartment slug within a season (ADR 0013).
 * Shared by statistics filtering (17.10) and composition history weighting (17.9).
 *
 * Reserved tag slugs such as `principal` are rejected at write time via [EquityTagNormalizer].
 */
object EquityCompartment {
    const val PRINCIPAL = "principal"
    const val DEPLACEMENTS = "deplacements"

    /** Compartment slug: glossary tag, legacy `deplacements` bucket, or `principal`. */
    fun slug(event: EventEntity): String =
        when {
            event.equityTag != null -> event.equityTag!!
            event.templateType == "deplacement" -> DEPLACEMENTS
            else -> PRINCIPAL
        }

    /**
     * Whether [event] counts toward validated selection history in [compartmentSlug].
     * Must stay aligned with [com.hatcast.api.composition.EventCompositionSlotRepository]
     * `countValidatedSelectionsBySeasonAndCompartment` JPQL filter.
     */
    fun eventInCompartment(
        event: EventEntity,
        compartmentSlug: String,
    ): Boolean =
        when (compartmentSlug) {
            PRINCIPAL -> event.equityTag == null && event.templateType != "deplacement"
            DEPLACEMENTS ->
                event.equityTag == DEPLACEMENTS ||
                    (event.equityTag == null && event.templateType == "deplacement")
            else -> event.equityTag == compartmentSlug
        }
}
