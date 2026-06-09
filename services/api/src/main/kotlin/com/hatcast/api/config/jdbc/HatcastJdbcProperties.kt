package com.hatcast.api.config.jdbc

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.jdbc")
data class HatcastJdbcProperties(
    /** Wrap datasource with ttddyy proxy (dev/staging opt-in; disabled on cloud prod profile). */
    val metricsEnabled: Boolean = false,
    /** Log each SQL statement as structured JSON when true (never on cloud profile). */
    val queryLogEnabled: Boolean = false,
    /** Slow query threshold for WARN logs (ms). */
    val slowQueryThresholdMs: Long = 100,
)
