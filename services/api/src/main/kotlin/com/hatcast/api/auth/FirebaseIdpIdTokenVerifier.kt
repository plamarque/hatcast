package com.hatcast.api.auth

import com.google.firebase.auth.FirebaseAuth
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Vérification via Firebase Admin SDK (artefact `firebase-admin`) — même protocole de tokens qu’Identity Platform.
 */
@Component
@Profile("!test & !e2e")
class FirebaseIdpIdTokenVerifier : IdpIdTokenVerifier {
    override fun verify(idToken: String): IdpTokenPayload {
        val decoded = FirebaseAuth.getInstance().verifyIdToken(idToken)
        return IdpTokenPayload(
            uid = decoded.uid,
            email = decoded.email,
            displayName = decoded.name,
        )
    }
}
