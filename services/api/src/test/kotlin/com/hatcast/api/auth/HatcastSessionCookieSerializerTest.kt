package com.hatcast.api.auth

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.mock.web.MockHttpSession
import org.springframework.session.web.http.CookieSerializer

class HatcastSessionCookieSerializerTest {
    @Test
    fun `remembered sign-in emits a persistent secure cookie with the configured lifetime`() {
        val request = MockHttpServletRequest()
        request.setAttribute(AuthSessionPolicy.REMEMBER_ME_REQUEST_ATTRIBUTE, true)
        val response = MockHttpServletResponse()

        HatcastSessionCookieSerializer("HATCAST_SESSION", true, "Lax", 2592000)
            .writeCookieValue(CookieSerializer.CookieValue(request, response, "session-id"))

        val header = response.getHeader("Set-Cookie")!!
        assertTrue(header.contains("Max-Age=2592000"))
        assertTrue(header.contains("Secure"))
        assertTrue(header.contains("HttpOnly"))
        assertTrue(header.contains("SameSite=Lax"))
    }

    @Test
    fun `non remembered sign-in emits a browser-session cookie`() {
        val request = MockHttpServletRequest()
        request.setAttribute(AuthSessionPolicy.REMEMBER_ME_REQUEST_ATTRIBUTE, false)
        val response = MockHttpServletResponse()

        HatcastSessionCookieSerializer("HATCAST_SESSION", false, "Lax", 2592000)
            .writeCookieValue(CookieSerializer.CookieValue(request, response, "session-id"))

        val header = response.getHeader("Set-Cookie")!!
        assertFalse(header.contains("Max-Age="))
        assertTrue(header.contains("HttpOnly"))
        assertTrue(header.contains("SameSite=Lax"))
    }

    @Test
    fun `later cookie reissue keeps the remembered policy stored on the server session`() {
        val request = MockHttpServletRequest()
        request.setSession(MockHttpSession().apply {
            setAttribute(AuthSessionPolicy.REMEMBER_ME_SESSION_ATTRIBUTE, true)
        })
        val response = MockHttpServletResponse()

        HatcastSessionCookieSerializer("HATCAST_SESSION", false, "Lax", 2592000)
            .writeCookieValue(CookieSerializer.CookieValue(request, response, "session-id"))

        assertTrue(response.getHeader("Set-Cookie")!!.contains("Max-Age=2592000"))
    }

    @Test
    fun `non remembered sign-in overrides a prior remembered cookie policy`() {
        val request = MockHttpServletRequest()
        request.setAttribute(AuthSessionPolicy.REMEMBER_ME_REQUEST_ATTRIBUTE, false)
        request.setSession(MockHttpSession().apply {
            setAttribute(AuthSessionPolicy.REMEMBER_ME_SESSION_ATTRIBUTE, false)
        })
        val response = MockHttpServletResponse()

        HatcastSessionCookieSerializer("HATCAST_SESSION", false, "Lax", 2592000)
            .writeCookieValue(CookieSerializer.CookieValue(request, response, "session-id"))

        assertFalse(response.getHeader("Set-Cookie")!!.contains("Max-Age="))
    }

    @Test
    fun `missing remember policy defaults to a browser-session cookie`() {
        val response = MockHttpServletResponse()

        HatcastSessionCookieSerializer("HATCAST_SESSION", false, "Lax", 2592000)
            .writeCookieValue(CookieSerializer.CookieValue(MockHttpServletRequest(), response, "session-id"))

        assertFalse(response.getHeader("Set-Cookie")!!.contains("Max-Age="))
    }
}
