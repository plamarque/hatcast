package com.hatcast.api.troupe

import com.hatcast.api.season.SeasonSlugGenerator
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

/**
 * Slug URL dérivé du nom de troupe (sans saisie utilisateur) ; unicité globale sur [TroupeEntity.slug].
 */
object TroupeSlugGenerator {
    private const val MAX_SLUG_LEN = 128

    /** Transforme un nom en segment de base pour le slug (a-z, 0-9, tirets). */
    fun slugify(name: String): String = SeasonSlugGenerator.slugify(name)

    /**
     * Trouve un slug unique globalement : `base`, puis `base-2`, `base-3`, …
     */
    fun allocateUniqueSlug(
        base: String,
        troupeRepository: TroupeRepository,
    ): String {
        val normalized =
            base.trim().take(MAX_SLUG_LEN).trimEnd('-').ifEmpty {
                throw ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nom ne permet pas de générer un identifiant URL.",
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
            if (!troupeRepository.existsBySlug(candidate)) {
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
