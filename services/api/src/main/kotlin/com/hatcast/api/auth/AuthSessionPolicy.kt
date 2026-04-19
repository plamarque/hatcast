package com.hatcast.api.auth

import jakarta.servlet.http.HttpSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * Applique la durée d’inactivité de session HTTP selon « se souvenir de moi » (story 1.4).
 */
@Component
class AuthSessionPolicy(
    @Value("\${hatcast.auth.remember-me-seconds:2592000}") private val rememberMeSeconds: Int,
    @Value("\${hatcast.auth.no-remember-me-seconds:1800}") private val noRememberMeSeconds: Int,
) {
    fun applyToSession(
        session: HttpSession,
        rememberMe: Boolean,
    ) {
        session.maxInactiveInterval = if (rememberMe) rememberMeSeconds else noRememberMeSeconds
    }
}
