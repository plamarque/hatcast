package com.hatcast.api.e2e

import com.hatcast.api.auth.GoogleIdTokenService
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Service
import java.time.Instant

/**
 * Mock Google ID token validation for Playwright E2E (profile `e2e` only).
 *
 * Known tokens (idToken value):
 * - `e2e-admin` → Patrice seed (TROUPE_ADMIN Les Improbots + super-admin plateforme)
 * - `e2e-member` → Angie seed (membre troupe, sans admin)
 */
@Service
@Profile("e2e")
@Primary
class E2eGoogleIdTokenService(
    @Value("\${hatcast.google.oauth-web-client-id:e2e-google-web-client-id}") clientId: String,
) : GoogleIdTokenService(clientId) {
    private data class Persona(
        val googleSub: String,
        val email: String,
        val name: String,
    )

    private val personas =
        mapOf(
            "e2e-admin" to
                Persona(
                    googleSub = "seed-improbots-22",
                    email = "patrice@seed.improbots.test",
                    name = "Patrice",
                ),
            "e2e-member" to
                Persona(
                    googleSub = "seed-improbots-01",
                    email = "angie@seed.improbots.test",
                    name = "Angie",
                ),
        )

    override fun validateAndParse(idToken: String): Jwt {
        val persona =
            personas[idToken.trim()]
                ?: throw IllegalArgumentException("Unknown E2E idToken persona: $idToken")
        return Jwt
            .withTokenValue(idToken)
            .header("alg", "none")
            .claim("sub", persona.googleSub)
            .claim("email", persona.email)
            .claim("name", persona.name)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(3600))
            .issuer("https://accounts.google.com")
            .build()
    }
}
