package com.hatcast.api.config.jdbc

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConditionalOnProperty(prefix = "hatcast.jdbc", name = ["metrics-enabled"], havingValue = "true")
@EnableConfigurationProperties(HatcastJdbcProperties::class)
class JdbcMetricsConfig
