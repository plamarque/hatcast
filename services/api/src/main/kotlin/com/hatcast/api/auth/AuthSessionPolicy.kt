package com.hatcast.api.auth

import jakarta.servlet.http.HttpServletRequest
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
    companion object {
        const val REMEMBER_ME_REQUEST_ATTRIBUTE = "hatcast.auth.remember-me"
        const val REMEMBER_ME_SESSION_ATTRIBUTE = "hatcast.auth.remember-me-policy"
    }

    fun applyToSession(
        session: HttpSession,
        rememberMe: Boolean,
    ) {
        session.maxInactiveInterval = if (rememberMe) rememberMeSeconds else noRememberMeSeconds
    }

    fun applyToSession(
        request: HttpServletRequest,
        rememberMe: Boolean,
    ) {
        // The login page can reach this endpoint with an anonymous or expired session cookie.
        // Rotate it so Spring Session writes a fresh cookie with the selected browser lifetime.
        request.getSession(false)?.invalidate()
        request.setAttribute(REMEMBER_ME_REQUEST_ATTRIBUTE, rememberMe)
        request.session.let { session ->
            session.setAttribute(REMEMBER_ME_SESSION_ATTRIBUTE, rememberMe)
            applyToSession(session, rememberMe)
        }
    }
}
