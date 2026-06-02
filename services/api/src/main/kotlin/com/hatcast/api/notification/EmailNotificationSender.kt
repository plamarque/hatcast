package com.hatcast.api.notification

import org.slf4j.LoggerFactory
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class EmailNotificationSender(
    private val emailProperties: NotificationEmailProperties,
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
        if (!emailProperties.enabled || mailSenderProvider.getIfAvailable() == null) {
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

        return try {
            val mailSender = mailSenderProvider.getObject()
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, Charsets.UTF_8.name())
            helper.setFrom(emailProperties.from)
            helper.setTo(email)
            helper.setSubject(subject)
            helper.setText(buildHtmlBody(payload), true)
            mailSender.send(message)
            NotificationDeliveryResult(channel = NotificationChannel.EMAIL, status = NotificationDeliveryStatus.SENT)
        } catch (ex: Exception) {
            val error = ex.javaClass.simpleName + ": " + (ex.message ?: "unknown")
            log.warn(
                "notification_email_failed intent={} userId={} eventId={} channel=EMAIL error={}",
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
    }

    private fun buildHtmlBody(payload: NotificationPayload): String =
        """
        <p>${payload.body}</p>
        <p><a href="${payload.url}">Ouvrir dans HatCast</a></p>
        """.trimIndent()
}
