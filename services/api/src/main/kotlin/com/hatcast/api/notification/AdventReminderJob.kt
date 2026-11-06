package com.hatcast.api.notification

import com.hatcast.api.advent.AdventTestAnswers
import com.hatcast.api.advent.AdventRealClock
import org.slf4j.LoggerFactory
import org.springframework.core.env.Environment
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.util.UUID

/** A real-clock, best-effort invitation; marks are committed before network I/O. */
@Component
class AdventReminderJob(
    private val jdbc: JdbcTemplate,
    private val quizzes: AdventTestAnswers,
    private val environment: Environment,
    private val transactions: TransactionTemplate,
    private val sender: WebPushNotificationSender,
    private val realClock: AdventRealClock,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 0 10 * * *", zone = "Europe/Paris", scheduler = "adventReminderScheduler")
    fun run() {
        // Development and local previews never send, irrespective of their simulated clock.
        val profiles = environment.activeProfiles.toSet()
        if (profiles.any { it in setOf("test", "dev", "offline") }) return
        if ("prod" !in profiles && !(profiles == setOf("cloud") && environment.getProperty("K_SERVICE") == "hatcast-v2")) return
        val troupe = try { UUID.fromString(environment.getProperty("hatcast.advent.troupe-id", "")) } catch (_: IllegalArgumentException) { return }
        var day: Int? = null
        val recipients = reserve(troupe) { realClock.instant().also { day = adventReminderDay(it) } }
        val payload = adventReminderPayload(day ?: return)
        recipients.forEach { user ->
            try { sender.sendAdventPush(user, payload) } catch (ex: Exception) { log.warn("advent_reminder_failed userId={}", user, ex) }
        }
    }

    /** Does not send; the supplied time exists to exercise the reservation in isolated tests. */
    internal fun reserve(troupe: UUID, realTime: () -> Instant): List<UUID> = transactions.execute {
            jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
            val now = realTime()
            val day = adventReminderDay(now) ?: return@execute emptyList<UUID>()
            if (quizzes.quiz(day) == null) return@execute emptyList<UUID>()
            val eligible = jdbc.query("""
                SELECT p.user_id FROM advent_reminder_preferences p
                JOIN troupe_memberships m ON m.user_id = p.user_id AND m.troupe_id = ?
                WHERE p.enabled = TRUE AND m.status = 'ACTIVE' AND m.baseline_role <> 'EXTERNE'
                AND EXISTS (SELECT 1 FROM advent_reminder_devices s WHERE s.user_id = p.user_id)
                AND NOT EXISTS (SELECT 1 FROM advent_member_answers a WHERE a.user_id = p.user_id AND a.quiz_day = ?)
                AND NOT EXISTS (SELECT 1 FROM advent_reminder_attempts r WHERE r.user_id = p.user_id AND r.quiz_day = ?)
            """.trimIndent(), { rs, _ -> UUID.fromString(rs.getString(1)) }, troupe, day, day)
            eligible.forEach { user -> jdbc.update("INSERT INTO advent_reminder_attempts (quiz_day, user_id, attempted_at) VALUES (?, ?, ?)", day, user, Timestamp.from(now)) }
            eligible
        } ?: emptyList()
}

internal fun adventReminderDay(now: Instant): Int? {
    val local = now.atZone(ZoneId.of("Europe/Paris"))
    val date = local.toLocalDate()
    if (date.isBefore(LocalDate.of(2026, 12, 1)) || date.isAfter(LocalDate.of(2026, 12, 24)) || local.toLocalTime().isBefore(LocalTime.of(10, 0))) return null
    return date.dayOfMonth
}

internal fun adventReminderPayload(day: Int, test: Boolean = false): NotificationPayload =
    NotificationPayload("Quiz de l’Avent", "Le quiz du jour t’attend !", "/avent?jour=$day" + if (test) "&test=1" else "", kind = "advent")
