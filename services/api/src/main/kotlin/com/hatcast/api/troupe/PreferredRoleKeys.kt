package com.hatcast.api.troupe

import com.hatcast.api.event.RoleKeys
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

object PreferredRoleKeys {
    const val VOLUNTEER = "volunteer"

    /** V1 parity: empty/unset storage means all roles are preferred. */
    fun effectiveKeys(stored: List<String>): List<String> {
        if (stored.isEmpty()) return RoleKeys.ALL
        return normalize(stored)
    }

    fun normalize(raw: List<String>): List<String> {
        val valid = RoleKeys.ALL.toSet()
        val trimmed = raw.map { it.trim() }.filter { it.isNotEmpty() }
        val invalid = trimmed.filter { !valid.contains(it) }.distinct()
        if (invalid.isNotEmpty()) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Clé de rôle invalide : ${invalid.first()}",
            )
        }
        return ensureVolunteer(trimmed.distinct())
    }

    fun ensureVolunteer(keys: List<String>): List<String> =
        if (keys.contains(VOLUNTEER)) {
            keys
        } else {
            keys + VOLUNTEER
        }
}
