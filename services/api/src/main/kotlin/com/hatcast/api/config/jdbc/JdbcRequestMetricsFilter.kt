package com.hatcast.api.config.jdbc

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.MDC
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import org.springframework.web.util.ContentCachingResponseWrapper

/**
 * Attaches per-request JDBC stats to MDC and response headers on NFR-P2 hot paths.
 * SQL text logging is gated by [HatcastJdbcProperties.queryLogEnabled] (dev opt-in only).
 *
 * Hot paths wrap the response in [ContentCachingResponseWrapper] so headers can be set
 * after controller execution without the response already being committed (Tomcat vs MockMvc).
 */
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 20)
@ConditionalOnProperty(prefix = "hatcast.jdbc", name = ["metrics-enabled"], havingValue = "true")
class JdbcRequestMetricsFilter : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        RequestJdbcMetrics.clear()
        val startedAt = System.nanoTime()
        val hotPath = isHotPath(request)
        val responseToUse: HttpServletResponse =
            if (hotPath) ContentCachingResponseWrapper(response) else response
        try {
            filterChain.doFilter(request, responseToUse)
        } finally {
            val httpTotalMs = (System.nanoTime() - startedAt) / 1_000_000
            val snapshot = RequestJdbcMetrics.snapshot()
            MDC.put("sqlStatementCount", snapshot.statementCount.toString())
            MDC.put("sqlTotalMs", snapshot.totalMs.toString())
            MDC.put("httpTotalMs", httpTotalMs.toString())
            if (hotPath) {
                responseToUse.setHeader(HEADER_SQL_COUNT, snapshot.statementCount.toString())
                responseToUse.setHeader(HEADER_SQL_TOTAL_MS, snapshot.totalMs.toString())
                responseToUse.setHeader(HEADER_HTTP_TOTAL_MS, httpTotalMs.toString())
                (responseToUse as? ContentCachingResponseWrapper)?.copyBodyToResponse()
            }
            RequestJdbcMetrics.remove()
            MDC.remove("sqlStatementCount")
            MDC.remove("sqlTotalMs")
            MDC.remove("httpTotalMs")
        }
    }

    internal fun isHotPath(request: HttpServletRequest): Boolean {
        if (request.method != "GET") return false
        val path = request.requestURI ?: return false
        if (path == "/v1/me/agenda") return true
        if (path.endsWith("/availability/summary")) return true
        if (path.endsWith("/composition")) return true
        if (path.contains("/events/") && path.endsWith("/page") &&
            (request.getParameter("tab") == "dispos" || request.getParameter("tab") == "equipe")
        ) {
            return true
        }
        return false
    }

    companion object {
        const val HEADER_SQL_COUNT = "X-Hatcast-Sql-Count"
        const val HEADER_SQL_TOTAL_MS = "X-Hatcast-Sql-Total-Ms"
        const val HEADER_HTTP_TOTAL_MS = "X-Hatcast-Http-Total-Ms"
    }
}
