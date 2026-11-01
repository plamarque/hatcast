package com.hatcast.api.config

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.boot.env.YamlPropertySourceLoader
import org.springframework.core.io.ClassPathResource
import org.springframework.web.cors.CorsConfiguration

class OfflineCorsPolicyTest {
    @Test fun `offline profile accepts Tailscale Serve and direct Angular but rejects unrelated origins`() {
        val source = YamlPropertySourceLoader().load("offline", ClassPathResource("application-offline.yml")).single()
        val patterns = source.getProperty("hatcast.cors.allowed-origin-patterns").toString().split(",")
        val cors = CorsConfiguration().apply { allowedOriginPatterns = patterns }
        val serve = "https://fictional.tailnet.ts.net"
        val direct = "https://fictional.tailnet.ts.net:4200"
        assertEquals(serve, cors.checkOrigin(serve))
        assertEquals(direct, cors.checkOrigin(direct))
        assertNull(cors.checkOrigin("https://unrelated.example.com"))
        assertNull(cors.checkOrigin("http://fictional.tailnet.ts.net"))
    }
}
