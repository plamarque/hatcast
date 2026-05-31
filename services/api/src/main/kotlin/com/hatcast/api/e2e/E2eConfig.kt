package com.hatcast.api.e2e

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("e2e")
@EnableConfigurationProperties(E2eApiProperties::class)
class E2eConfig
