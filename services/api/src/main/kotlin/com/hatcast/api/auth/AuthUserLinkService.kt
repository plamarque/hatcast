package com.hatcast.api.auth

import com.hatcast.api.user.UserAccountService
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

/**
 * Resolves or links application users on sign-in (supports V1 migration stubs pre-filled by email).
 */
@Service
class AuthUserLinkService(
    private val userRepository: UserRepository,
    private val userAccountService: UserAccountService,
) {
    fun resolveGoogleSignInUser(
        googleSub: String,
        email: String?,
        displayName: String?,
    ): UserEntity {
        userRepository.findByGoogleSub(googleSub)?.let { existing ->
            return userAccountService.markActivated(updateProfile(existing, email, displayName))
        }

        val normalizedEmail = email?.trim()?.lowercase()?.takeIf { it.contains("@") }
        if (normalizedEmail != null) {
            userRepository.findFirstByEmailIgnoreCase(normalizedEmail)?.let { byEmail ->
                if (byEmail.googleSub != null && byEmail.googleSub != googleSub) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cet email est déjà associé à un autre compte Google.",
                    )
                }
                byEmail.googleSub = googleSub
                return userAccountService.markActivated(updateProfile(byEmail, normalizedEmail, displayName))
            }
        }

        val now = Instant.now()
        return userRepository.save(
            UserEntity(
                googleSub = googleSub,
                idpUid = null,
                email = normalizedEmail ?: email,
                displayName = displayName,
                activatedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    fun resolveIdpSignInUser(
        idpUid: String,
        email: String?,
        displayName: String?,
    ): UserEntity {
        userRepository.findByIdpUid(idpUid)?.let { existing ->
            return userAccountService.markActivated(updateProfile(existing, email, displayName))
        }

        val normalizedEmail = email?.trim()?.lowercase()?.takeIf { it.contains("@") }
        if (normalizedEmail != null) {
            userRepository.findFirstByEmailIgnoreCase(normalizedEmail)?.let { byEmail ->
                if (byEmail.idpUid != null && byEmail.idpUid != idpUid) {
                    throw ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cet email est déjà associé à un autre compte.",
                    )
                }
                byEmail.idpUid = idpUid
                return userAccountService.markActivated(updateProfile(byEmail, normalizedEmail, displayName))
            }
        }

        val now = Instant.now()
        return userRepository.save(
            UserEntity(
                googleSub = null,
                idpUid = idpUid,
                email = normalizedEmail ?: email,
                displayName = displayName,
                activatedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
    }

    private fun updateProfile(
        user: UserEntity,
        email: String?,
        displayName: String?,
    ): UserEntity {
        if (!email.isNullOrBlank()) {
            user.email = email.trim().lowercase()
        }
        if (!displayName.isNullOrBlank()) {
            user.displayName = displayName
        }
        user.updatedAt = Instant.now()
        return userRepository.save(user)
    }
}
