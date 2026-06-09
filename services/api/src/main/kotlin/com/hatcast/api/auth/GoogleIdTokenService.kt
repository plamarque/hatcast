package com.hatcast.api.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.stereotype.Service

open class GoogleIdTokenService(
    @Value("\${hatcast.google.oauth-web-client-id:}") private val clientId: String,
) {
    private val decoder: NimbusJwtDecoder by lazy {
        require(clientId.isNotBlank()) {
            "HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID must be set to validate Google ID tokens"
        }
        NimbusJwtDecoder.withJwkSetUri(JWKS_URI).build().apply {
            setJwtValidator(
                DelegatingOAuth2TokenValidator(
                    JwtValidators.createDefaultWithIssuer(GOOGLE_ISSUER),
                    GoogleAudienceValidator(clientId),
                ),
            )
        }
    }

    open fun validateAndParse(idToken: String): Jwt = decoder.decode(idToken)

    companion object {
        private const val JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs"
        private const val GOOGLE_ISSUER = "https://accounts.google.com"
    }
}

@Service
@Profile("!e2e & !offline")
class ProductionGoogleIdTokenService(
    @Value("\${hatcast.google.oauth-web-client-id:}") clientId: String,
) : GoogleIdTokenService(clientId)
