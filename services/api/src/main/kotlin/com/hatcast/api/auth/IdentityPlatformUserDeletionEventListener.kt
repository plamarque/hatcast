package com.hatcast.api.auth

import com.hatcast.api.user.UserRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import java.time.Instant

@Component
class IdentityPlatformUserDeletionEventListener(
    private val deletionSupport: IdentityPlatformUserDeletionSupport,
    private val userRepository: UserRepository,
) {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun onDeletionRequested(event: IdentityPlatformUserDeletionRequestedEvent) {
        if (event.idpUid.isBlank()) {
            return
        }
        val attempted = deletionSupport.deleteUserIfAvailable(event.idpUid)
        if (!attempted) {
            return
        }
        userRepository.findById(event.userId).orElse(null)?.takeIf { it.idpUid == event.idpUid }?.let { user ->
            user.idpUid = null
            user.updatedAt = Instant.now()
            userRepository.save(user)
        }
    }
}
