package com.hatcast.api.auth

import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt

/**
 * Valide que le claim [Jwt] `aud` contient le client ID Web OAuth (string ou liste).
 */
class GoogleAudienceValidator(
    private val expectedClientId: String,
) : OAuth2TokenValidator<Jwt> {
    override fun validate(token: Jwt): OAuth2TokenValidatorResult {
        val aud = token.claims["aud"] ?: return failure()
        val ok =
            when (aud) {
                is String -> aud == expectedClientId
                is Collection<*> -> expectedClientId in aud.map { it.toString() }
                else -> false
            }
        return if (ok) {
            OAuth2TokenValidatorResult.success()
        } else {
            failure()
        }
    }

    private fun failure() =
        OAuth2TokenValidatorResult.failure(
            OAuth2Error("invalid_token", "Invalid or missing audience", null),
        )
}
