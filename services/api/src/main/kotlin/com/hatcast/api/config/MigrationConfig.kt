package com.hatcast.api.config

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableConfigurationProperties(MigrationApiProperties::class)
class MigrationConfig {
    @Bean
    fun migrationApiKeyAuthenticationFilter(
        migrationApiKeyService: MigrationApiKeyService,
    ): MigrationApiKeyAuthenticationFilter = MigrationApiKeyAuthenticationFilter(migrationApiKeyService)

    @Bean
    fun migrationApiKeyRequestMatcher(
        migrationApiKeyService: MigrationApiKeyService,
    ): MigrationApiKeyRequestMatcher = MigrationApiKeyRequestMatcher(migrationApiKeyService)
}
