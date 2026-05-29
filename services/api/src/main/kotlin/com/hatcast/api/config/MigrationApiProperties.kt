package com.hatcast.api.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "hatcast.migration")
data class MigrationApiProperties(
    /** When false, migration key auth is disabled (default). */
    var apiEnabled: Boolean = false,
    /** Shared secret sent as X-Hatcast-Migration-Key by the CLI orchestrator. */
    var apiKey: String = "",
    /** Existing platform user email impersonated for migration API calls. */
    var operatorEmail: String = "",
)
