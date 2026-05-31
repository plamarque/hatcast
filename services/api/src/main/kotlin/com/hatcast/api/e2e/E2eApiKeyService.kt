package com.hatcast.api.e2e

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

@Service
@Profile("e2e")
class E2eApiKeyService(
    private val properties: E2eApiProperties,
) {
    companion object {
        const val HEADER_NAME = "X-Hatcast-E2E-Key"
    }

    fun isEnabled(): Boolean = properties.apiEnabled && properties.apiKey.isNotBlank()

    fun isValidKey(provided: String?): Boolean {
        if (!isEnabled() || provided.isNullOrBlank()) return false
        val expected = properties.apiKey.toByteArray(StandardCharsets.UTF_8)
        val actual = provided.toByteArray(StandardCharsets.UTF_8)
        return MessageDigest.isEqual(expected, actual)
    }
}
