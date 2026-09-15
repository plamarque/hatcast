package com.hatcast.api.auth

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.env.YamlPropertySourceLoader
import org.springframework.context.annotation.AnnotationConfigApplicationContext
import org.springframework.core.io.ClassPathResource
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.session.web.http.CookieSerializer

class HatcastSessionCookieConfigurationTest {
    @Test
    fun `cloud profile secure cookie property is bound to the custom serializer`() {
        val cloudProperties =
            YamlPropertySourceLoader()
                .load("application-cloud", ClassPathResource("application-cloud.yml"))
                .single()
        val context = AnnotationConfigApplicationContext()
        context.environment.propertySources.addFirst(cloudProperties)
        context.register(HatcastSessionCookieConfiguration::class.java)
        context.refresh()

        try {
            val response = MockHttpServletResponse()
            context
                .getBean(CookieSerializer::class.java)
                .writeCookieValue(CookieSerializer.CookieValue(MockHttpServletRequest(), response, "session-id"))

            assertTrue(response.getHeader("Set-Cookie")!!.contains("Secure"))
        } finally {
            context.close()
        }
    }
}
