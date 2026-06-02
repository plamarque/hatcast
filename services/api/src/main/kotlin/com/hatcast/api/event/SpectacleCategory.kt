package com.hatcast.api.event

/**
 * Spectacle category slug within a season (ADR 0013).
 * Shared by statistics filtering (17.10) and composition history weighting (17.9).
 *
 * Reserved slugs such as `principal` are rejected at write time via [CategorySlugNormalizer].
 */
object SpectacleCategory {
    const val PRINCIPAL = "principal"
    const val DEPLACEMENTS = "deplacements"

    /** Category slug: glossary entry, legacy `deplacements` bucket, or `principal`. */
    fun slug(event: EventEntity): String =
        when {
            event.category != null -> event.category!!
            event.templateType == "deplacement" -> DEPLACEMENTS
            else -> PRINCIPAL
        }

    /**
     * Whether [event] counts toward validated selection history in [categorySlug].
     * Must stay aligned with [com.hatcast.api.composition.EventCompositionSlotRepository]
     * `countValidatedSelectionsBySeasonAndCategory` JPQL filter.
     */
    fun eventInCategory(
        event: EventEntity,
        categorySlug: String,
    ): Boolean =
        when (categorySlug) {
            PRINCIPAL -> event.category == null && event.templateType != "deplacement"
            DEPLACEMENTS ->
                event.category == DEPLACEMENTS ||
                    (event.category == null && event.templateType == "deplacement")
            else -> event.category == categorySlug
        }
}
