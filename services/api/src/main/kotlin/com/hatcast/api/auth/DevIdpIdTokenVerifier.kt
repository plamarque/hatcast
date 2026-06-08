package com.hatcast.api.auth

import com.hatcast.api.user.UserRepository
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Dev profile: accepts mock ID tokens for Improbots seed roster (`dev-seed-idp|email|password`),
 * otherwise delegates to Firebase Admin when available.
 */
@Component
@Profile("dev")
@Primary
class DevIdpIdTokenVerifier(
    private val userRepository: UserRepository,
    private val firebaseIdpIdTokenVerifier: FirebaseIdpIdTokenVerifier,
) : IdpIdTokenVerifier {
    override fun verify(idToken: String): IdpTokenPayload {
        val trimmed = idToken.trim()
        if (trimmed.startsWith(DevSeedAuthSupport.DEV_SEED_IDP_PREFIX)) {
            return verifyDevSeedToken(trimmed)
        }
        return firebaseIdpIdTokenVerifier.verify(trimmed)
    }

    private fun verifyDevSeedToken(token: String): IdpTokenPayload {
        val parts = token.split('|', limit = 3)
        if (parts.size < 3 || parts[1].isBlank() || parts[2].isEmpty()) {
            throw IllegalArgumentException("Malformed dev seed Identity Platform idToken")
        }
        val email = parts[1].trim().lowercase()
        val password = parts[2]
        if (!DevSeedAuthSupport.isSeedEmail(email)) {
            throw IllegalArgumentException("Dev seed login limited to $SEED_EMAIL_DOMAIN accounts")
        }
        val user =
            userRepository.findFirstByEmailIgnoreCase(email)
                ?: throw IllegalArgumentException("Unknown dev seed account")
        if (!DevSeedAuthSupport.passwordMatches(user, password)) {
            throw IllegalArgumentException("Invalid dev seed password")
        }
        return IdpTokenPayload(
            uid = DevSeedAuthSupport.syntheticIdpUid(user),
            email = email,
            displayName = user.displayName,
        )
    }

    private companion object {
        private val SEED_EMAIL_DOMAIN = DevSeedAuthSupport.SEED_EMAIL_DOMAIN
    }
}
