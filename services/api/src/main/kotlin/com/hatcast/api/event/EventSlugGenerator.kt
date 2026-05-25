package com.hatcast.api.event

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.text.Normalizer
import java.util.UUID

/**
 * Slug URL dérivé du titre ; unicité par saison gérée dans [EventService].
 */
object EventSlugGenerator {
    private const val MAX_SLUG_LEN = 128
    private val SLUG_PATTERN = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")
    private val UUID_SLUG_PATTERN =
        Regex(
            "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
            RegexOption.IGNORE_CASE,
        )

    /** Transforme un titre en segment de base pour le slug (a-z, 0-9, tirets). */
    fun slugify(title: String): String {
        val trimmed = title.trim()
        if (trimmed.isEmpty()) {
            return ""
        }
        val nfd = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
        val noMarks = nfd.replace("\\p{M}+".toRegex(), "")
        val lower = noMarks.lowercase()
        val alnum = lower.replace("[^a-z0-9]+".toRegex(), "-")
        val collapsed = alnum.replace("-+".toRegex(), "-").trim('-')
        return collapsed.take(MAX_SLUG_LEN)
    }

    fun requireValidExplicitSlug(slug: String) {
        val trimmed = slug.trim().take(MAX_SLUG_LEN).trimEnd('-')
        if (trimmed.isEmpty() || UUID_SLUG_PATTERN.matches(trimmed) || !SLUG_PATTERN.matches(trimmed)) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                if (UUID_SLUG_PATTERN.matches(trimmed)) {
                    "L’identifiant URL ne peut pas reprendre le format d’un identifiant technique."
                } else {
                    "L’identifiant URL doit contenir uniquement des lettres minuscules, chiffres et tirets."
                },
            )
        }
    }

    /**
     * Trouve un slug unique pour la saison : `base`, puis `base-2`, `base-3`, …
     * @param excludeEventId si non null, ignore cet événement (mise à jour du slug).
     */
    fun allocateUniqueSlug(
        seasonId: UUID,
        base: String,
        eventRepository: EventRepository,
        excludeEventId: UUID? = null,
    ): String {
        val normalized =
            base.trim().take(MAX_SLUG_LEN).trimEnd('-').ifEmpty {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le titre ne permet pas de générer un identifiant URL.",
                )
            }
        var n = 1
        while (n < 10_000) {
            val candidate =
                if (n == 1) {
                    normalized
                } else {
                    val suffix = "-$n"
                    val maxBase = (MAX_SLUG_LEN - suffix.length).coerceAtLeast(1)
                    normalized.take(maxBase).trimEnd('-') + suffix
                }
            val exists =
                if (excludeEventId == null) {
                    eventRepository.existsBySeason_IdAndSlug(seasonId, candidate)
                } else {
                    eventRepository.existsBySeason_IdAndSlugAndIdNot(
                        seasonId,
                        candidate,
                        excludeEventId,
                    )
                }
            if (!exists) {
                return candidate
            }
            n++
        }
        throw ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Impossible d’allouer un identifiant unique.",
        )
    }
}
