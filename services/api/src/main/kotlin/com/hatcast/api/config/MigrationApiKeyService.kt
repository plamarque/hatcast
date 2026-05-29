package com.hatcast.api.config

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.user.UserRepository
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

@Service
class MigrationApiKeyService(
    private val properties: MigrationApiProperties,
    private val userRepository: UserRepository,
) {
    companion object {
        const val HEADER_NAME = "X-Hatcast-Migration-Key"
    }
    fun isEnabled(): Boolean =
        properties.apiEnabled &&
            properties.apiKey.isNotBlank() &&
            properties.operatorEmail.isNotBlank()

    fun isValidKey(provided: String?): Boolean {
        if (!isEnabled() || provided.isNullOrBlank()) return false
        val expected = properties.apiKey.toByteArray(StandardCharsets.UTF_8)
        val actual = provided.toByteArray(StandardCharsets.UTF_8)
        return MessageDigest.isEqual(expected, actual)
    }

    fun resolveOperatorPrincipal(): SessionUserPrincipal? {
        if (!isEnabled()) return null
        val user =
            userRepository.findFirstByEmailIgnoreCase(properties.operatorEmail.trim())
                ?: return null
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = user.googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }
}
