package com.hatcast.api.user

import java.text.Normalizer

/** Slug URL global sur `users.slug` (Story 16.1). */
object UserSlugGenerator {
    private const val MAX_SLUG_LEN = 128
    private val SLUG_PATTERN = Regex("^[a-z0-9]+(?:-[a-z0-9]+)*$")

    fun slugify(source: String): String {
        val trimmed = source.trim()
        if (trimmed.isEmpty()) {
            return ""
        }
        val nfd = Normalizer.normalize(trimmed, Normalizer.Form.NFD)
        val noMarks = nfd.replace("\\p{M}+".toRegex(), "")
        val lower = noMarks.lowercase()
        val alnum = lower.replace("[^a-z0-9]+".toRegex(), "-")
        return alnum.replace("-+".toRegex(), "-").trim('-').take(MAX_SLUG_LEN)
    }

    fun isValidSlug(slug: String): Boolean = SLUG_PATTERN.matches(slug.trim())
}
