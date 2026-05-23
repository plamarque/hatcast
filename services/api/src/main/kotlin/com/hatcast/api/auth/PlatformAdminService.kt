package com.hatcast.api.auth

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * Administrateurs plateforme (super-admin) identifiés par email — parité V1 / ADR-0005.
 */
@Component
class PlatformAdminService(
    @Value("\${hatcast.auth.super-admin-emails:}") private val superAdminEmailsRaw: String,
) {
    private val superAdminEmails: Set<String> =
        superAdminEmailsRaw
            .split(',')
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }
            .toSet()

    fun isPlatformAdmin(principal: SessionUserPrincipal): Boolean {
        val email = principal.email?.trim()?.lowercase() ?: return false
        return email in superAdminEmails
    }
}
