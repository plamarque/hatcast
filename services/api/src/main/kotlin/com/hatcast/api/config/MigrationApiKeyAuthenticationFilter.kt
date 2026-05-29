package com.hatcast.api.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Authenticates migration CLI requests via [MigrationApiKeyService.HEADER_NAME].
 * When enabled and the key matches, sets [SessionUserPrincipal] for the configured operator.
 */
class MigrationApiKeyAuthenticationFilter(
    private val migrationApiKeyService: MigrationApiKeyService,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        if (!migrationApiKeyService.isEnabled()) {
            filterChain.doFilter(request, response)
            return
        }

        val provided = request.getHeader(MigrationApiKeyService.HEADER_NAME)
        if (provided.isNullOrBlank()) {
            filterChain.doFilter(request, response)
            return
        }

        if (!migrationApiKeyService.isValidKey(provided)) {
            response.sendError(HttpStatus.UNAUTHORIZED.value())
            return
        }

        val principal = migrationApiKeyService.resolveOperatorPrincipal()
        if (principal == null) {
            response.sendError(HttpStatus.UNAUTHORIZED.value())
            return
        }

        val authentication = UsernamePasswordAuthenticationToken(principal, null, principal.authorities)
        val context = SecurityContextHolder.createEmptyContext()
        context.authentication = authentication
        SecurityContextHolder.setContext(context)

        filterChain.doFilter(request, response)
    }
}
