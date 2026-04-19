package com.hatcast.api.auth

/**
 * Vérifie un ID token émis pour le projet Identity Platform (issuer typique `securetoken.google.com`).
 */
fun interface IdpIdTokenVerifier {
    fun verify(idToken: String): IdpTokenPayload
}
