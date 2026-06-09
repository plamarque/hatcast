package com.hatcast.api.event

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

/**
 * Normalise une catégorie de spectacle en slug canonique (a-z, 0-9, tirets, max 64).
 */
object CategorySlugNormalizer {
    const val MAX_LEN = 64
    private val SLUG_PATTERN = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
    /** Slugs interdits : le compartiment principal est représenté par `null` en base. */
    private val RESERVED_SLUGS = setOf("principal", "main")

    /**
     * @param raw valeur utilisateur (création / mise à jour)
     * @return slug canonique non vide
     */
    fun normalizeSlug(raw: String): String {
        rejectInvalidRaw(raw)
        val slug =
            EventSlugGenerator
                .slugify(raw)
                .take(MAX_LEN)
                .trimEnd('-')
        if (slug.isEmpty() || !SLUG_PATTERN.matches(slug) || slug in RESERVED_SLUGS) {
            throw invalidTag()
        }
        return slug
    }

    /** Libellé affiché pour une entrée glossaire auto-créée. */
    fun labelForAutoCreate(raw: String): String {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) {
            return trimmed
        }
        val slug = normalizeSlug(trimmed)
        if (trimmed.equals(slug, ignoreCase = true) || trimmed == slug) {
            return titleCaseSlug(slug)
        }
        return trimmed
    }

    private fun rejectInvalidRaw(raw: String) {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) {
            throw invalidTag()
        }
        if (trimmed.contains(',') || trimmed.contains(';')) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Une seule catégorie est autorisée par spectacle.",
            )
        }
    }

    private fun titleCaseSlug(slug: String): String =
        slug
            .split('-')
            .filter { it.isNotEmpty() }
            .joinToString(" ") { part -> part.replaceFirstChar { c -> c.uppercaseChar() } }

    private fun invalidTag(): ResponseStatusException =
        ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Catégorie invalide.",
        )
}
