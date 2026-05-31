package com.hatcast.api.e2e

import org.springframework.context.annotation.Profile
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import jakarta.servlet.http.HttpServletRequest

@Component
@Profile("e2e")
class E2eApiKeyRequestMatcher : RequestMatcher {
    override fun matches(request: HttpServletRequest): Boolean =
        request.requestURI.startsWith("/v1/e2e/")
}
