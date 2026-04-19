package com.hatcast.api.auth

/** Claims extraits d’un ID token Identity Platform après vérification serveur. */
data class IdpTokenPayload(
    val uid: String,
    val email: String?,
    val displayName: String?,
)
