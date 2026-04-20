package com.hatcast.api.season

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.text.Normalizer
import java.util.UUID

/**
 * Slug URL dérivé du titre (sans saisie utilisateur) ; unicité par troupe gérée dans [SeasonService].
 */
object SeasonSlugGenerator {
    private const val MAX_SLUG_LEN = 128

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

    /**
     * Trouve un slug unique pour la troupe : `base`, puis `base-2`, `base-3`, …
     * @param excludeSeasonId si non null, ignore cette saison (mise à jour du titre).
     */
    fun allocateUniqueSlug(
        troupeId: UUID,
        base: String,
        seasonRepository: SeasonRepository,
        excludeSeasonId: UUID? = null,
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
                if (excludeSeasonId == null) {
                    seasonRepository.existsByTroupe_IdAndSlug(troupeId, candidate)
                } else {
                    seasonRepository.existsByTroupe_IdAndSlugAndIdNot(
                        troupeId,
                        candidate,
                        excludeSeasonId,
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
