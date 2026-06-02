package com.hatcast.api.season

import com.hatcast.api.event.SpectacleCategory
import com.hatcast.api.event.EventEntity

/** Story 17.10 — filter stats events by spectacle group (compartment) before aggregation. */
object SeasonStatisticsCategoryFilter {
    sealed interface Filter {
        data object All : Filter

        data object None : Filter

        data class Selected(
            val slugs: Set<String>,
        ) : Filter
    }

    fun parse(raw: List<String>?): Filter {
        if (raw.isNullOrEmpty()) {
            return Filter.All
        }
        val tokens =
            raw
                .flatMap { it.split(',') }
                .map { it.trim() }
                .filter { it.isNotEmpty() }
        if (tokens.isEmpty()) {
            return Filter.None
        }
        if (tokens.any { it.equals("all", ignoreCase = true) }) {
            return Filter.All
        }
        return Filter.Selected(tokens.toSet())
    }

    /** Category slug for filtering: `principal`, glossary slug, or legacy `deplacements` bucket. */
    fun categorySlug(event: EventEntity): String = SpectacleCategory.slug(event)

    fun matches(
        event: EventEntity,
        filter: Filter,
    ): Boolean =
        when (filter) {
            Filter.All -> true
            Filter.None -> false
            is Filter.Selected -> categorySlug(event) in filter.slugs
        }
}
