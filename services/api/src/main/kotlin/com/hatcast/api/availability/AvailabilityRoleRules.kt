package com.hatcast.api.availability

import com.hatcast.api.event.RoleTemplates
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

object AvailabilityRoleRules {
    private const val VOLUNTEER = "volunteer"

    fun rolesRequiredForEvent(roleSlots: Map<String, Int>): List<String> =
        RoleTemplates.rolesWithSlots(RoleTemplates.normalize(roleSlots))

    fun normalizeRoleKeys(
        roleSlots: Map<String, Int>,
        requestedKeys: List<String>?,
        @Suppress("UNUSED_PARAMETER") applyVolunteerRule: Boolean = true,
    ): List<String> {
        val required = rolesRequiredForEvent(roleSlots).toSet()
        val normalized =
            requestedKeys
                .orEmpty()
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .distinct()
        val invalid = normalized.firstOrNull { it !in required }
        if (invalid != null) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Rôle invalide pour cet événement : $invalid",
            )
        }
        if (!mandatoryVolunteerCoverage(roleSlots)) {
            return normalized
        }
        if (VOLUNTEER !in required || VOLUNTEER in normalized) {
            return normalized
        }
        return normalized + VOLUNTEER
    }

    fun mandatoryVolunteerCoverage(roleSlots: Map<String, Int>): Boolean =
        (RoleTemplates.normalize(roleSlots)[VOLUNTEER] ?: 0) > 0

    fun isCandidateForRole(
        status: String,
        roleKeys: List<String>,
        roleKey: String,
    ): Boolean =
        status == AvailabilityStatusMapper.AVAILABLE &&
            (roleKeys.isEmpty() || roleKey in roleKeys)
}
