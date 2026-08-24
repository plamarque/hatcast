package com.hatcast.api.auth

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.session.web.http.CookieSerializer
import org.springframework.session.web.http.DefaultCookieSerializer

/**
 * Persists the opaque HatCast session handle only for an explicit remembered sign-in.
 *
 * The server-side session interval remains the authority for expiry. This serializer only
 * decides whether the browser retains the HttpOnly handle after it is closed.
 */
class HatcastSessionCookieSerializer(
    cookieName: String,
    useSecureCookie: Boolean,
    sameSite: String,
    private val rememberMeSeconds: Int,
) : CookieSerializer {
    private val delegate =
        DefaultCookieSerializer().apply {
            setCookieName(cookieName)
            setUseHttpOnlyCookie(true)
            setUseSecureCookie(useSecureCookie)
            setSameSite(sameSite)
        }

    override fun readCookieValues(request: HttpServletRequest): List<String> =
        delegate.readCookieValues(request)

    override fun writeCookieValue(cookieValue: CookieSerializer.CookieValue) {
        if (
            cookieValue.cookieMaxAge < 0 &&
            cookieValue.cookieValue.isNotBlank() &&
            isRemembered(cookieValue.request)
        ) {
            cookieValue.cookieMaxAge = rememberMeSeconds
        }
        delegate.writeCookieValue(cookieValue)
    }

    private fun isRemembered(request: HttpServletRequest): Boolean =
        (request.getAttribute(AuthSessionPolicy.REMEMBER_ME_REQUEST_ATTRIBUTE) as? Boolean)
            ?: (request.getSession(false)?.getAttribute(AuthSessionPolicy.REMEMBER_ME_SESSION_ATTRIBUTE) as? Boolean)
            ?: false
}
