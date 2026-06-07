package com.hatcast.api.auth

import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class IdentityPlatformUserDeletionSupport {
    private val log = LoggerFactory.getLogger(javaClass)

    /**
     * @return `true` when Firebase Admin is available and a delete was attempted (success or failure).
     */
    fun deleteUserIfAvailable(idpUid: String): Boolean {
        if (idpUid.isBlank()) {
            return false
        }
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("Firebase Admin not initialized; skipping deleteUser for idpUid {}", idpUid)
            return false
        }
        runCatching {
            FirebaseAuth.getInstance().deleteUser(idpUid)
        }.onFailure {
            log.warn("Firebase deleteUser failed for idpUid {}", idpUid, it)
        }
        return true
    }
}
