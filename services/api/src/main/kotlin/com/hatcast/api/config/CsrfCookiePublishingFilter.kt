package com.hatcast.api.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Spring Security 6 defers CSRF token resolution; materialize it so
 * [org.springframework.security.web.csrf.CookieCsrfTokenRepository] writes `XSRF-TOKEN`
 * for SPA clients (`document.cookie` + `X-XSRF-TOKEN`).
 */
@Component
class CsrfCookiePublishingFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        (request.getAttribute("_csrf") as? CsrfToken)?.token
        filterChain.doFilter(request, response)
    }
}
