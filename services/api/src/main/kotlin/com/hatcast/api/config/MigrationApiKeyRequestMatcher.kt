package com.hatcast.api.config

import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.web.util.matcher.RequestMatcher

/** Skips CSRF when migration API key header is sent (valid key auth runs in [MigrationApiKeyAuthenticationFilter]). */
class MigrationApiKeyRequestMatcher(
    private val migrationApiKeyService: MigrationApiKeyService,
) : RequestMatcher {
    override fun matches(request: HttpServletRequest): Boolean {
        if (!migrationApiKeyService.isEnabled()) return false
        return !request.getHeader(MigrationApiKeyService.HEADER_NAME).isNullOrBlank()
    }
}
