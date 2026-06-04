package com.hatcast.api.notification

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.mock
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider
import org.springframework.mail.javamail.JavaMailSender
import java.util.UUID

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension::class)
class EmailNotificationSenderTest {
    private val emailProperties =
        NotificationEmailProperties(
            enabled = true,
            from = "HatCast <noreply@hatcast.app>",
        )
    private val cloudflareClient: CloudflareEmailSendingClient = mock()
    private val mailSender: JavaMailSender = mock()
    private val mailSenderProvider: ObjectProvider<JavaMailSender> = mock()

    private val sender =
        EmailNotificationSender(
            emailProperties = emailProperties,
            cloudflareEmailClient = cloudflareClient,
            mailSenderProvider = mailSenderProvider,
        )

    private val payload =
        NotificationPayload(
            title = "T",
            body = "Body",
            url = "https://hatcast.app/saison/x/event/y",
        )

    @Test
    fun `uses Cloudflare when client is available`() {
        whenever(cloudflareClient.isAvailable()).thenReturn(true)
        whenever(cloudflareClient.send(any(), any(), any(), any())).thenReturn(CloudflareSendOutcome.success())

        val result =
            sender.sendEmail(
                userId = UUID.randomUUID(),
                email = "user@example.com",
                subject = "Test",
                payload = payload,
                intent = NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                eventId = null,
            )

        assertEquals(NotificationDeliveryStatus.SENT, result.status)
        verify(cloudflareClient).send(
            to = eq("user@example.com"),
            fromHeader = eq("HatCast <noreply@hatcast.app>"),
            subject = eq("Test"),
            htmlBody = any(),
        )
        verify(mailSenderProvider, never()).getIfAvailable()
    }

    @Test
    fun `skips when disabled`() {
        val disabledSender =
            EmailNotificationSender(
                emailProperties = emailProperties.copy(enabled = false),
                cloudflareEmailClient = cloudflareClient,
                mailSenderProvider = mailSenderProvider,
            )

        val result =
            disabledSender.sendEmail(
                UUID.randomUUID(),
                "user@example.com",
                "Test",
                payload,
                NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                null,
            )

        assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
        verify(cloudflareClient, never()).send(any(), any(), any(), any())
    }

    @Test
    fun `skips when neither Cloudflare nor SMTP configured`() {
        whenever(cloudflareClient.isAvailable()).thenReturn(false)
        whenever(mailSenderProvider.getIfAvailable()).thenReturn(null)

        val result =
            sender.sendEmail(
                UUID.randomUUID(),
                "user@example.com",
                "Test",
                payload,
                NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                null,
            )

        assertEquals(NotificationDeliveryStatus.SKIPPED, result.status)
        assertEquals("mail_not_configured", result.errorMessage)
    }
}
