package com.hatcast.api.text

import java.text.Collator
import java.util.Locale

/**
 * Comparaisons locale françaises alignées sur V1
 * (`localeCompare(..., 'fr', { sensitivity: 'base' })`).
 */
object FrenchCollator {
    private val collator: Collator =
        Collator.getInstance(Locale.FRENCH).apply {
            strength = Collator.PRIMARY
        }

    fun compare(
        a: String,
        b: String,
    ): Int = collator.compare(a, b)
}

fun <T> Iterable<T>.sortedByFrenchDisplayName(name: (T) -> String): List<T> =
    sortedWith { left, right -> FrenchCollator.compare(name(left), name(right)) }
