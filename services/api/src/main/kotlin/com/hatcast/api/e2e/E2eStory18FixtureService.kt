package com.hatcast.api.e2e

import com.hatcast.api.e2e.dto.Story18CleanupResponse
import com.hatcast.api.user.UserRepository
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Profile("e2e")
class E2eStory18FixtureService(
    private val userRepository: UserRepository,
) {
    @Transactional
    fun cleanupUserByEmail(email: String): Story18CleanupResponse {
        val normalized = email.trim()
        val user = userRepository.findFirstByEmailIgnoreCase(normalized)
        if (user != null) {
            userRepository.delete(user)
            return Story18CleanupResponse(deleted = true, email = normalized)
        }
        return Story18CleanupResponse(deleted = false, email = normalized)
    }
}
