package com.hatcast.api.auth

import jakarta.servlet.http.HttpSession
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever

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

    @Test
    fun `applyToSession persists the remember policy on the server session`() {
        val request = mock<jakarta.servlet.http.HttpServletRequest>()
        val session = mock<HttpSession>()
        whenever(request.session).thenReturn(session)
        val policy = AuthSessionPolicy(rememberMeSeconds = 2592000, noRememberMeSeconds = 1800)

        policy.applyToSession(request, rememberMe = true)

        verify(request).setAttribute(AuthSessionPolicy.REMEMBER_ME_REQUEST_ATTRIBUTE, true)
        verify(session).setAttribute(AuthSessionPolicy.REMEMBER_ME_SESSION_ATTRIBUTE, true)
        verify(session).setMaxInactiveInterval(2592000)
    }

    @Test
    fun `applyToSession rotates a pre-existing session before applying a remembered login`() {
        val request = mock<jakarta.servlet.http.HttpServletRequest>()
        val oldSession = mock<HttpSession>()
        val newSession = mock<HttpSession>()
        whenever(request.getSession(false)).thenReturn(oldSession)
        whenever(request.session).thenReturn(newSession)
        val policy = AuthSessionPolicy(rememberMeSeconds = 2592000, noRememberMeSeconds = 1800)

        policy.applyToSession(request, rememberMe = true)

        verify(oldSession).invalidate()
        verify(newSession).setAttribute(AuthSessionPolicy.REMEMBER_ME_SESSION_ATTRIBUTE, true)
        verify(newSession).setMaxInactiveInterval(2592000)
    }
}
