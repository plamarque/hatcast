package com.hatcast.api.season

import com.hatcast.api.event.EventEntity

/** Story 17.10 — filter stats events by spectacle group (compartment) before aggregation. */
object SeasonStatisticsCompartments {
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

    /** Compartment slug for filtering: `principal`, glossary slug, or legacy `deplacements` bucket. */
    fun compartmentSlug(event: EventEntity): String =
        when {
            event.equityTag != null -> event.equityTag!!
            event.templateType == "deplacement" -> "deplacements"
            else -> "principal"
        }

    fun matches(
        event: EventEntity,
        filter: Filter,
    ): Boolean =
        when (filter) {
            Filter.All -> true
            Filter.None -> false
            is Filter.Selected -> compartmentSlug(event) in filter.slugs
        }
}
