package com.hatcast.api.config

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean
import org.springframework.core.io.ClassPathResource

/**
 * OPS-12 / BUG-013: guardrails so Hikari does not keep Neon always-on (scale-to-zero / Free CU-h).
 */
class NeonHikariScaleToZeroConfigTest {

    @Test
    fun `cloud profile allows empty pool and disables db health ping`() {
        val props = loadYaml("application-cloud.yml")
        assertEquals("0", props.getProperty("spring.datasource.hikari.minimum-idle"))
        assertEquals("5", props.getProperty("spring.datasource.hikari.maximum-pool-size"))
        assertEquals("60000", props.getProperty("spring.datasource.hikari.idle-timeout"))
        assertEquals("20000", props.getProperty("spring.datasource.hikari.connection-timeout"))
        assertEquals("280000", props.getProperty("spring.datasource.hikari.max-lifetime"))
        assertFalse(props.containsKey("spring.datasource.hikari.keepalive-time"))
        assertEquals("false", props.getProperty("management.health.db.enabled"))
        assertEquals("0 30 3 * * *", props.getProperty("spring.session.jdbc.cleanup-cron"))
    }

    @Test
    fun `dev profile mirrors cloud idle policy for Neon local branch`() {
        val props = loadYaml("application-dev.yml")
        assertEquals("0", props.getProperty("spring.datasource.hikari.minimum-idle"))
        assertEquals("5", props.getProperty("spring.datasource.hikari.maximum-pool-size"))
        assertEquals("60000", props.getProperty("spring.datasource.hikari.idle-timeout"))
        assertEquals("20000", props.getProperty("spring.datasource.hikari.connection-timeout"))
        assertEquals("280000", props.getProperty("spring.datasource.hikari.max-lifetime"))
        assertEquals("false", props.getProperty("management.health.db.enabled"))
        assertFalse(props.containsKey("spring.datasource.hikari.keepalive-time"))
        assertEquals("0 30 3 * * *", props.getProperty("spring.session.jdbc.cleanup-cron"))
    }

    private fun loadYaml(classpathName: String): java.util.Properties {
        val factory = YamlPropertiesFactoryBean()
        factory.setResources(ClassPathResource(classpathName))
        return factory.`object` ?: error("Failed to load $classpathName")
    }
}
