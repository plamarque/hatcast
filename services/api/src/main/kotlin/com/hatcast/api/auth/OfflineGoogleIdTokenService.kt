package com.hatcast.api.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtException
import org.springframework.stereotype.Service

/**
 * Offline dev profile: rejects Google OAuth (no JWKS fetch to googleapis.com).
 * Use Les Improbots seed accounts (`@seed.improbots.test`) on `/connexion` instead.
 */
@Service
@Profile("offline")
@Primary
class OfflineGoogleIdTokenService(
    @Value("\${hatcast.google.oauth-web-client-id:offline-google-web-client-id}") clientId: String,
) : GoogleIdTokenService(clientId) {
    override fun validateAndParse(idToken: String): Jwt {
        throw JwtException(
            "Google OAuth unavailable in offline mode — sign in with a Les Improbots seed account " +
                "(@seed.improbots.test) via email and password on /connexion",
        )
    }
}
