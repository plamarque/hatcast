package com.hatcast.api.troupe

import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

internal object TroupeExterneEmailSupport {
    fun normalizeOptional(value: String?): String? =
        value?.trim()?.lowercase()?.takeIf { it.isNotEmpty() }

    fun validateOptional(value: String?): String? {
        val normalized = normalizeOptional(value) ?: return null
        if (!isPlausibleEmail(normalized)) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalide.")
        }
        return normalized
    }

    private fun isPlausibleEmail(email: String): Boolean {
        val at = email.indexOf('@')
        return at > 0 && at < email.length - 1 && !email.contains(' ')
    }
}
