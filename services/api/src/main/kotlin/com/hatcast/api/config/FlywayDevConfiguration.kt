package com.hatcast.api.config

import org.flywaydb.core.Flyway
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * En dev, regénération de seeds Flyway (V17, V19…) modifie les checksums déjà appliqués sur Neon.
 * [repair] puis [migrate] évite l'échec « checksum mismatch » (voir application-dev.yml).
 */
@Configuration
@ConditionalOnProperty(prefix = "spring.flyway", name = ["repair-on-migrate"], havingValue = "true")
class FlywayDevConfiguration {
    @Bean
    fun flywayMigrationStrategy(): FlywayMigrationStrategy =
        FlywayMigrationStrategy { flyway: Flyway ->
            flyway.repair()
            flyway.migrate()
        }
}
