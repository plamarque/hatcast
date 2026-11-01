package com.hatcast.api.notification

import com.hatcast.api.advent.AdventTestAnswers
import com.hatcast.api.advent.AdventRealClock
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.mockito.Mockito.mock
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.mock.env.MockEnvironment
import org.springframework.transaction.support.TransactionTemplate
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@EnabledIfEnvironmentVariable(named = "ADVENT_TEST_POSTGRES_URL", matches = ".+")
class AdventReminderPostgresTest {
    @Test fun `endpoint ownership changes serialize across transactions`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val ds = DriverManagerDataSource(url, System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD"))
        val tx = TransactionTemplate(DataSourceTransactionManager(ds))
        val service = UserPushSubscriptionService(mock(com.hatcast.api.user.UserRepository::class.java), mock(UserPushSubscriptionRepository::class.java), mock(AdventReminderDeviceRepository::class.java), JdbcTemplate(ds))
        val held = CountDownLatch(1); val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val first = pool.submit { tx.executeWithoutResult {
                service.lockEndpoint("https://push.example.test/same-device")
                held.countDown(); check(release.await(10, TimeUnit.SECONDS))
            } }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val second = pool.submit { tx.executeWithoutResult { service.lockEndpoint("https://push.example.test/same-device") } }
            assertThrows(TimeoutException::class.java) { second.get(100, TimeUnit.MILLISECONDS) }
            release.countDown(); first.get(10, TimeUnit.SECONDS); second.get(10, TimeUnit.SECONDS)
        } finally { release.countDown(); pool.shutdownNow() }
    }

    @Test fun `concurrent reservations and answers serialize without sending`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val username = System.getenv("ADVENT_TEST_POSTGRES_USER"); val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, username, password))
        val schema = "reminder_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", username, password)
            val jdbc = JdbcTemplate(ds)
            listOf(
                "CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY)", "INSERT INTO advent_member_lock VALUES (1)",
                "CREATE TABLE advent_quizzes (quiz_day INTEGER PRIMARY KEY, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)",
                "INSERT INTO advent_quizzes VALUES (1, 'Fictif', NULL, 'A', 'B', 'C', 0, NULL)",
                "CREATE TABLE troupe_memberships (troupe_id UUID, user_id UUID, status TEXT, baseline_role TEXT)",
                "CREATE TABLE advent_reminder_preferences (user_id UUID PRIMARY KEY, enabled BOOLEAN)",
                "CREATE TABLE advent_reminder_devices (user_id UUID)",
                "CREATE TABLE advent_member_answers (user_id UUID, quiz_day INTEGER)",
                "CREATE TABLE advent_reminder_attempts (quiz_day INTEGER, user_id UUID, attempted_at TIMESTAMPTZ, PRIMARY KEY (quiz_day, user_id))"
            ).forEach(jdbc::execute)
            val user = UUID.randomUUID(); val troupe = UUID.randomUUID()
            jdbc.update("INSERT INTO troupe_memberships VALUES (?, ?, 'ACTIVE', 'MEMBRE')", troupe, user)
            jdbc.update("INSERT INTO advent_reminder_preferences VALUES (?, TRUE)", user)
            jdbc.update("INSERT INTO advent_reminder_devices VALUES (?)", user)
            val tx = TransactionTemplate(DataSourceTransactionManager(ds))
            val job = AdventReminderJob(jdbc, AdventTestAnswers(jdbc), MockEnvironment(), tx, mock(WebPushNotificationSender::class.java), AdventRealClock())
            val now = Instant.parse("2026-12-01T09:00:00Z")
            val pool = Executors.newFixedThreadPool(2)
            try {
                val gate = CountDownLatch(1)
                val jobs = (1..2).map { pool.submit(Callable { gate.await(); job.reserve(troupe) { now } }) }
                gate.countDown()
                assertEquals(1, jobs.sumOf { it.get(10, TimeUnit.SECONDS).size })
                assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_reminder_attempts", Int::class.java))
                jdbc.update("DELETE FROM advent_reminder_attempts")
                val locked = CountDownLatch(1); val release = CountDownLatch(1)
                val answer = pool.submit { tx.executeWithoutResult {
                    jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
                    jdbc.update("INSERT INTO advent_member_answers VALUES (?, 1)", user)
                    locked.countDown(); check(release.await(10, TimeUnit.SECONDS))
                } }
                try {
                    assertTrue(locked.await(10, TimeUnit.SECONDS))
                    val reservation = pool.submit(Callable { job.reserve(troupe) { now } })
                    assertThrows(TimeoutException::class.java) { reservation.get(100, TimeUnit.MILLISECONDS) }
                    release.countDown(); answer.get(10, TimeUnit.SECONDS)
                    assertTrue(reservation.get(10, TimeUnit.SECONDS).isEmpty())
                    assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_reminder_attempts", Int::class.java))
                } finally { release.countDown() }
                jdbc.update("DELETE FROM advent_member_answers")
                jdbc.update("DELETE FROM advent_quizzes")
                assertTrue(job.reserve(troupe) { now }.isEmpty())
                jdbc.update("INSERT INTO advent_quizzes VALUES (1, 'Fictif', NULL, 'A', 'B', 'C', 0, NULL)")
                jdbc.update("UPDATE advent_reminder_preferences SET enabled = FALSE")
                assertTrue(job.reserve(troupe) { now }.isEmpty())
                jdbc.update("UPDATE advent_reminder_preferences SET enabled = TRUE")
                jdbc.update("UPDATE troupe_memberships SET status = 'INACTIVE'")
                assertTrue(job.reserve(troupe) { now }.isEmpty())
                jdbc.update("UPDATE troupe_memberships SET status = 'ACTIVE'")
                assertEquals(listOf(user), job.reserve(troupe) { now.plusSeconds(3600) })
            } finally { pool.shutdownNow() }
        } finally { root.execute("DROP SCHEMA $schema CASCADE") }
    }
}
