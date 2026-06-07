package com.hatcast.api.e2e

import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.auth.IdpTokenPayload
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Mock Identity Platform ID token validation for Playwright E2E (profile `e2e` only).
 *
 * Token format: `e2e-idp|{uid}|{email}|{displayName}` (displayName optional).
 * Used with mocked Firebase REST responses in Playwright — no Firebase Admin credentials required in CI.
 */
@Component
@Profile("e2e")
@Primary
class E2eIdpIdTokenVerifier : IdpIdTokenVerifier {
    override fun verify(idToken: String): IdpTokenPayload {
        val trimmed = idToken.trim()
        if (!trimmed.startsWith(E2E_IDP_PREFIX)) {
            throw IllegalArgumentException("Unknown E2E Identity Platform idToken (expected $E2E_IDP_PREFIX…)")
        }
        val parts = trimmed.split('|', limit = 4)
        if (parts.size < 3 || parts[1].isBlank() || parts[2].isBlank()) {
            throw IllegalArgumentException("Malformed E2E Identity Platform idToken")
        }
        return IdpTokenPayload(
            uid = parts[1],
            email = parts[2],
            displayName = parts.getOrNull(3)?.takeIf { it.isNotBlank() },
        )
    }

    companion object {
        const val E2E_IDP_PREFIX = "e2e-idp|"

        fun buildToken(
            uid: String,
            email: String,
            displayName: String? = null,
        ): String =
            listOfNotNull(
                E2E_IDP_PREFIX.removeSuffix("|"),
                uid,
                email,
                displayName?.takeIf { it.isNotBlank() },
            ).joinToString("|")
    }
}
