package com.hatcast.api.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.security.web.csrf.CsrfTokenRepository
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Spring Security 6 defers CSRF token resolution; materialize it so
 * [org.springframework.security.web.csrf.CookieCsrfTokenRepository] writes `XSRF-TOKEN`
 * for SPA clients (`document.cookie` + `X-XSRF-TOKEN`).
 */
@Component
class CsrfCookiePublishingFilter(
    private val csrfTokenRepository: CsrfTokenRepository,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        publishCsrfCookieIfNeeded(request, response)
        filterChain.doFilter(request, response)
    }

    private fun publishCsrfCookieIfNeeded(
        request: HttpServletRequest,
        response: HttpServletResponse,
    ) {
        if (response.isCommitted) {
            return
        }
        val token =
            (request.getAttribute("_csrf") as? CsrfToken)
                ?: csrfTokenRepository.loadToken(request)
                ?: return
        token.token
        csrfTokenRepository.saveToken(token, request, response)
    }
}
