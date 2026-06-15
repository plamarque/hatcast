package com.hatcast.api.event

/**
 * Shared JPQL fragment for spectacle category compartment filtering (19.8 / 19.10).
 * Must stay aligned with [SpectacleCategory.eventInCategory] and
 * [com.hatcast.api.composition.EventCompositionSlotRepository] selection-history queries.
 */
object SpectacleCategoryCompartmentJpql {
    const val EVENT_IN_CATEGORY: String =
        """
        (
            (:categorySlug = 'principal' AND e.category IS NULL AND e.templateType <> 'deplacement')
            OR (:categorySlug = 'deplacements' AND (e.category = 'deplacements' OR (e.category IS NULL AND e.templateType = 'deplacement')))
            OR (:categorySlug NOT IN ('principal', 'deplacements') AND e.category = :categorySlug)
        )
        """
}
