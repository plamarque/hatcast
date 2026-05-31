package com.hatcast.api.e2e

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/** Rejects calls under `/v1/e2e/` without a valid fixture API key (profile e2e only). */
@Component
@Profile("e2e")
class E2eApiKeyAuthenticationFilter(
    private val e2eApiKeyService: E2eApiKeyService,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        if (!request.requestURI.startsWith("/v1/e2e/")) {
            filterChain.doFilter(request, response)
            return
        }
        if (!e2eApiKeyService.isValidKey(request.getHeader(E2eApiKeyService.HEADER_NAME))) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid or missing E2E API key")
            return
        }
        filterChain.doFilter(request, response)
    }
}
