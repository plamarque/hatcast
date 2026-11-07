package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verifyNoInteractions
import org.springframework.context.annotation.AnnotationConfigApplicationContext
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.core.env.MapPropertySource
import java.util.UUID

class E2eEmailNotificationSenderTest {
    @Test
    fun `e2e profile uses simulated successful delivery without real transports`() {
        val cloudflare: CloudflareEmailSendingClient = mock()
        val mail: JavaMailSender = mock()
        val context = AnnotationConfigApplicationContext()
        context.environment.setActiveProfiles("e2e")
        context.environment.propertySources.addFirst(MapPropertySource("test", mapOf("hatcast.e2e.simulated-notification-success" to true)))
        context.beanFactory.registerSingleton("notificationEmailProperties", NotificationEmailProperties())
        context.beanFactory.registerSingleton("cloudflareEmailClient", cloudflare)
        context.beanFactory.registerSingleton("mailSender", mail)
        context.register(EmailNotificationSender::class.java, E2eEmailNotificationSender::class.java)
        context.refresh()
        try {
            val sender = context.getBean(EmailNotificationSender::class.java)
            val result = sender.sendEmail(UUID.randomUUID(), "person@example.test", "subject", "body", NotificationIntent.MANUAL_AVAILABILITY_NUDGE, UUID.randomUUID())
            assertEquals(E2eEmailNotificationSender::class.java, sender.javaClass)
            assertEquals(NotificationDeliveryStatus.SENT, result.status)
            assertEquals("e2e_simulated_delivery", result.errorMessage)
            verifyNoInteractions(cloudflare, mail)
        } finally {
            context.close()
        }
    }
    @Test
    fun `e2e profile without explicit flag uses ordinary sender behavior`() {
        val cloudflare: CloudflareEmailSendingClient = mock()
        val mail: JavaMailSender = mock()
        val context = AnnotationConfigApplicationContext()
        context.environment.setActiveProfiles("e2e")
        context.beanFactory.registerSingleton("notificationEmailProperties", NotificationEmailProperties(enabled = false))
        context.beanFactory.registerSingleton("cloudflareEmailClient", cloudflare)
        context.beanFactory.registerSingleton("mailSender", mail)
        context.register(EmailNotificationSender::class.java, E2eEmailNotificationSender::class.java)
        context.refresh()
        try {
            val sender = context.getBean(EmailNotificationSender::class.java)
            val result = sender.sendEmail(UUID.randomUUID(), "person@example.test", "subject", "body", NotificationIntent.MANUAL_AVAILABILITY_NUDGE, UUID.randomUUID())
            assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
            assertEquals("email_disabled", result.errorMessage)
            verifyNoInteractions(cloudflare, mail)
        } finally {
            context.close()
        }
    }

}
