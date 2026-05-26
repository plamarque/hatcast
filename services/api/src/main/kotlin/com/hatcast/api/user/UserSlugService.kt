package com.hatcast.api.user

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserSlugService(
    private val userRepository: UserRepository,
) {
    @Transactional
    fun ensureSlug(user: UserEntity): UserEntity {
        val existing = user.slug?.trim()?.takeIf { it.isNotEmpty() }
        if (existing != null) {
            return user
        }
        user.slug = allocateUniqueSlug(user)
        return userRepository.save(user)
    }

    fun allocateUniqueSlug(user: UserEntity): String {
        val emailLocal = user.email?.substringBefore('@')?.trim().orEmpty()
        val fromDisplay = user.displayName?.trim().orEmpty()
        val baseRaw =
            when {
                fromDisplay.isNotEmpty() -> UserSlugGenerator.slugify(fromDisplay)
                emailLocal.isNotEmpty() -> UserSlugGenerator.slugify(emailLocal)
                else -> "user-${user.id.toString().replace("-", "").take(12)}"
            }
        val base = baseRaw.ifEmpty { "user-${user.id.toString().replace("-", "").take(12)}" }
        var n = 1
        while (n < 10_000) {
            val candidate =
                if (n == 1) {
                    base
                } else {
                    val suffix = "-$n"
                    val maxBase = (128 - suffix.length).coerceAtLeast(1)
                    base.take(maxBase).trimEnd('-') + suffix
                }
            if (!userRepository.existsBySlug(candidate)) {
                return candidate
            }
            n++
        }
        error("Impossible d'allouer un slug utilisateur unique.")
    }
}
