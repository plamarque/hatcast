package com.hatcast.api.user

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

/**
 * Provisions users for V1→V2 migration: email-only stubs until first Google / IdP sign-in links auth ids.
 */
@Service
class UserAccountService(
    private val userRepository: UserRepository,
    private val userSlugService: UserSlugService,
) {
    @Transactional
    fun importMigrationUser(
        rawEmail: String,
        displayName: String? = null,
        gender: MemberGender? = null,
    ): UserAccountImportOutcome {
        val email = rawEmail.trim().lowercase()
        require(email.isNotEmpty() && email.contains("@")) { "Email invalide." }
        val normalizedDisplayName = displayName?.trim()?.takeIf { it.isNotEmpty() }
        val existing = userRepository.findFirstByEmailIgnoreCase(email)
        if (existing != null) {
            if (existing.activatedAt != null) {
                return UserAccountImportOutcome.SKIPPED
            }
            var changed = false
            if (normalizedDisplayName != null && existing.displayName != normalizedDisplayName) {
                existing.displayName = normalizedDisplayName
                changed = true
            }
            if (gender != null && existing.gender != gender) {
                existing.gender = gender
                changed = true
            }
            if (changed) {
                existing.updatedAt = Instant.now()
                userRepository.save(existing)
                return UserAccountImportOutcome.UPDATED
            }
            return UserAccountImportOutcome.SKIPPED
        }
        val now = Instant.now()
        val draft =
            UserEntity(
                googleSub = null,
                idpUid = null,
                email = email,
                displayName = normalizedDisplayName,
                gender = gender,
                activatedAt = null,
                createdAt = now,
                updatedAt = now,
            )
        draft.slug = userSlugService.allocateUniqueSlug(draft)
        userRepository.save(draft)
        return UserAccountImportOutcome.CREATED
    }

    /** Ajout manuel rapide d'un membre : crée un stub si besoin (comme import migration). */
    @Transactional
    fun ensureUserByEmail(
        rawEmail: String,
        displayName: String? = null,
    ): UserEntity {
        when (importMigrationUser(rawEmail, displayName)) {
            UserAccountImportOutcome.CREATED,
            UserAccountImportOutcome.UPDATED,
            -> Unit
            UserAccountImportOutcome.SKIPPED -> Unit
        }
        return userRepository.findFirstByEmailIgnoreCase(rawEmail.trim().lowercase())
            ?: error("Utilisateur introuvable après provisionnement.")
    }

    @Transactional
    fun markActivated(user: UserEntity): UserEntity {
        if (user.activatedAt == null) {
            user.activatedAt = Instant.now()
            user.updatedAt = Instant.now()
            return userRepository.save(user)
        }
        return user
    }

    @Transactional(readOnly = true)
    fun findUserForMemberImport(rawEmail: String): UserEntity? {
        val email = rawEmail.trim().lowercase()
        if (email.isEmpty() || !email.contains("@")) {
            throw IllegalArgumentException("Email invalide.")
        }
        return userRepository.findFirstByEmailIgnoreCase(email)
    }
}
