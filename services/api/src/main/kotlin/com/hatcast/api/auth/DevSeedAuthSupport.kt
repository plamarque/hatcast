package com.hatcast.api.auth

import com.hatcast.api.user.UserEntity

/**
 * Dev-only auth for Les Improbots seed accounts (`@seed.improbots.test`).
 * Password = seed user [UserEntity.slug] (or [UserEntity.memberDisplayName] fallback) lowercased;
 * if shorter than 8 chars, repeat until length ≥ 8
 * (matches Angular login min length for short slugs like `angie` → `angieang`).
 */
object DevSeedAuthSupport {
    const val SEED_EMAIL_DOMAIN = "@seed.improbots.test"
    const val DEV_SEED_IDP_PREFIX = "dev-seed-idp|"

    fun isSeedEmail(email: String?): Boolean =
        email?.trim()?.lowercase()?.endsWith(SEED_EMAIL_DOMAIN) == true

    fun expectedPassword(user: UserEntity): String? {
        val slug = seedCredentialSlug(user) ?: return null
        return padSeedPassword(slug)
    }

    fun seedCredentialSlug(user: UserEntity): String? =
        user.slug?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }
            ?: user.memberDisplayName?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }

    fun passwordMatches(
        user: UserEntity,
        providedPassword: String,
    ): Boolean {
        val expected = expectedPassword(user) ?: return false
        return providedPassword == expected
    }

    fun syntheticIdpUid(user: UserEntity): String {
        val googleSub = user.googleSub?.trim().orEmpty()
        if (googleSub.isNotEmpty()) {
            return "dev-seed-$googleSub"
        }
        return "dev-seed-${user.id}"
    }

    private fun padSeedPassword(slug: String): String {
        if (slug.length >= 8) {
            return slug
        }
        val repeated = buildString {
            while (length < 8) {
                append(slug)
            }
        }
        return repeated.take(8)
    }
}
