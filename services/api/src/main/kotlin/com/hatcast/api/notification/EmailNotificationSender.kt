package com.hatcast.api.notification

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class EmailNotificationSender(
    private val emailProperties: NotificationEmailProperties,
    private val cloudflareEmailClient: CloudflareEmailSendingClient,
    private val mailSenderProvider: ObjectProvider<JavaMailSender>,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun sendEmail(
        userId: UUID,
        email: String,
        subject: String,
        payload: NotificationPayload,
        intent: NotificationIntent,
        eventId: UUID?,
    ): NotificationDeliveryResult {
        if (!emailProperties.enabled) {
            log.warn(
                "notification_email_skipped reason=email_disabled intent={} userId={} eventId={}",
                intent,
                userId,
                eventId,
            )
            return NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "email_disabled",
            )
        }

        val htmlBody = buildHtmlBody(payload)

        if (cloudflareEmailClient.isAvailable()) {
            return sendViaCloudflare(userId, email, subject, htmlBody, intent, eventId)
        }

        val mailSender = mailSenderProvider.getIfAvailable()
        if (mailSender == null) {
            log.warn(
                "notification_email_skipped reason=mail_not_configured intent={} userId={} eventId={}",
                intent,
                userId,
                eventId,
            )
            return NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SKIPPED,
                errorMessage = "mail_not_configured",
            )
        }

        return sendViaSmtp(userId, email, subject, htmlBody, intent, eventId, mailSender)
    }

    private fun sendViaCloudflare(
        userId: UUID,
        email: String,
        subject: String,
        htmlBody: String,
        intent: NotificationIntent,
        eventId: UUID?,
    ): NotificationDeliveryResult {
        val outcome =
            cloudflareEmailClient.send(
                to = email,
                fromHeader = emailProperties.from,
                subject = subject,
                htmlBody = htmlBody,
            )
        return if (outcome.sent) {
            NotificationDeliveryResult(channel = NotificationChannel.EMAIL, status = NotificationDeliveryStatus.SENT)
        } else {
            log.warn(
                "notification_email_failed intent={} userId={} eventId={} channel=EMAIL provider=cloudflare error={}",
                intent,
                userId,
                eventId,
                outcome.errorMessage,
            )
            NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.FAILED,
                errorMessage = outcome.errorMessage,
            )
        }
    }

    private fun sendViaSmtp(
        userId: UUID,
        email: String,
        subject: String,
        htmlBody: String,
        intent: NotificationIntent,
        eventId: UUID?,
        mailSender: JavaMailSender,
    ): NotificationDeliveryResult =
        try {
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, Charsets.UTF_8.name())
            helper.setFrom(emailProperties.from)
            helper.setTo(email)
            helper.setSubject(subject)
            helper.setText(htmlBody, true)
            mailSender.send(message)
            NotificationDeliveryResult(channel = NotificationChannel.EMAIL, status = NotificationDeliveryStatus.SENT)
        } catch (ex: Exception) {
            val error = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown")
            log.warn(
                "notification_email_failed intent={} userId={} eventId={} channel=EMAIL provider=smtp error={}",
                intent,
                userId,
                eventId,
                error,
            )
            NotificationDeliveryResult(
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.FAILED,
                errorMessage = error,
            )
        }

    private fun buildHtmlBody(payload: NotificationPayload): String =
        """
        <p>${payload.body}</p>
        <p><a href="${payload.url}">Ouvrir dans HatCast</a></p>
        """.trimIndent()
}
