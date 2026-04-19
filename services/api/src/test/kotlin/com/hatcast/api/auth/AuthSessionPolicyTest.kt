package com.hatcast.api.auth

import jakarta.servlet.http.HttpSession
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify

class AuthSessionPolicyTest {
    @Test
    fun `applyToSession sets long interval when rememberMe true`() {
        val session = mock<HttpSession>()
        val policy =
            AuthSessionPolicy(
                rememberMeSeconds = 2592000,
                noRememberMeSeconds = 1800,
            )

        policy.applyToSession(session, rememberMe = true)

        verify(session).setMaxInactiveInterval(2592000)
    }

    @Test
    fun `applyToSession sets short interval when rememberMe false`() {
        val session = mock<HttpSession>()
        val policy =
            AuthSessionPolicy(
                rememberMeSeconds = 2592000,
                noRememberMeSeconds = 1800,
            )

        policy.applyToSession(session, rememberMe = false)

        verify(session).setMaxInactiveInterval(1800)
    }
}
