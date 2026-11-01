package com.hatcast.api.notification

import com.hatcast.api.advent.AdventRealClock
import com.hatcast.api.advent.AdventTestAnswers
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.mock.env.MockEnvironment
import org.springframework.transaction.support.TransactionTemplate
import java.time.Instant
import java.util.UUID

class AdventReminderJobTest {
    @Test
    fun `production dispatches only eligible members once and development never dispatches`() {
        val ds = DriverManagerDataSource("jdbc:h2:mem:${UUID.randomUUID()};DB_CLOSE_DELAY=-1", "sa", "")
        val jdbc = JdbcTemplate(ds)
        listOf(
            "CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY)", "INSERT INTO advent_member_lock VALUES (1)",
            "CREATE TABLE advent_quizzes (quiz_day INTEGER PRIMARY KEY, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)",
            "INSERT INTO advent_quizzes VALUES (1, 'Fictif', NULL, 'A', 'B', 'C', 0, NULL)",
            "CREATE TABLE troupe_memberships (troupe_id UUID, user_id UUID, status TEXT, baseline_role TEXT)",
            "CREATE TABLE advent_reminder_preferences (user_id UUID PRIMARY KEY, enabled BOOLEAN)",
            "CREATE TABLE advent_reminder_devices (user_id UUID)",
            "CREATE TABLE advent_member_answers (user_id UUID, quiz_day INTEGER)",
            "CREATE TABLE advent_reminder_attempts (quiz_day INTEGER, user_id UUID, attempted_at TIMESTAMP WITH TIME ZONE, PRIMARY KEY (quiz_day, user_id))",
        ).forEach(jdbc::execute)
        val troupe = UUID.randomUUID()
        val eligible = UUID.randomUUID()
        val answered = UUID.randomUUID()
        for (user in listOf(eligible, answered)) {
            jdbc.update("INSERT INTO troupe_memberships VALUES (?, ?, 'ACTIVE', 'MEMBRE')", troupe, user)
            jdbc.update("INSERT INTO advent_reminder_preferences VALUES (?, TRUE)", user)
            jdbc.update("INSERT INTO advent_reminder_devices VALUES (?)", user)
        }
        jdbc.update("INSERT INTO advent_member_answers VALUES (?, 1)", answered)
        val sender = mock<WebPushNotificationSender>()
        val clock = mock<AdventRealClock>()
        whenever(clock.instant()).thenReturn(Instant.parse("2026-12-01T09:00:00Z"))
        val tx = TransactionTemplate(DataSourceTransactionManager(ds))
        fun job(profile: String) = AdventReminderJob(jdbc, AdventTestAnswers(jdbc), MockEnvironment().withProperty("hatcast.advent.troupe-id", troupe.toString()).apply { setActiveProfiles(profile) }, tx, sender, clock)

        job("dev").run()
        job("test").run()
        verifyNoInteractions(sender)
        val production = job("prod")
        production.run()
        production.run()
        val payload = argumentCaptor<NotificationPayload>()
        verify(sender, times(1)).sendAdventPush(eq(eligible), payload.capture())
        org.junit.jupiter.api.Assertions.assertEquals("/avent", payload.firstValue.url)
        verify(sender, never()).sendAdventPush(eq(answered), any())
    }
}
