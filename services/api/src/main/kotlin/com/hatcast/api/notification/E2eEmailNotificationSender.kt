package com.hatcast.api.notification

import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Component
import java.util.UUID

/** Local E2E only: simulate successful delivery without contacting a transport. */
@Component
@Profile("e2e")
class E2eEmailNotificationSender(
    properties: NotificationEmailProperties,
    cloudflare: CloudflareEmailSendingClient,
    mailSender: ObjectProvider<JavaMailSender>,
    @Value("\${hatcast.e2e.simulated-notification-success:false}") private val simulateSuccess: Boolean,
) : EmailNotificationSender(properties, cloudflare, mailSender) {
    override fun unavailableReason(): String? = if (simulateSuccess) null else super.unavailableReason()

    override fun sendEmail(
        userId: UUID?, email: String, subject: String, htmlBody: String,
        intent: NotificationIntent, eventId: UUID?,
    ): NotificationDeliveryResult = if (simulateSuccess) {
        NotificationDeliveryResult(
            channel = NotificationChannel.EMAIL,
            status = NotificationDeliveryStatus.SENT,
            errorMessage = "e2e_simulated_delivery",
        )
    } else {
        super.sendEmail(userId, email, subject, htmlBody, intent, eventId)
    }
}
