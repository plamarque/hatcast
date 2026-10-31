package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.jdbc.datasource.init.ScriptUtils
import org.springframework.core.io.ClassPathResource
import org.springframework.mock.env.MockEnvironment
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@EnabledIfEnvironmentVariable(named = "ADVENT_TEST_POSTGRES_URL", matches = ".+")
class AdventMemberPostgresTest {
    @Test fun `offline transition migration preserves data and identifies ambiguous days`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val username = System.getenv("ADVENT_TEST_POSTGRES_USER"); val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, username, password))
        val schema = "advent_migration_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", username, password)
            val jdbc = JdbcTemplate(ds)
            jdbc.execute("CREATE TABLE advent_member_answers (quiz_day INTEGER, marker TEXT)")
            jdbc.execute("CREATE TABLE advent_member_demo_quizzes (quiz_day INTEGER, display_name TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER)")
            jdbc.execute("CREATE TABLE advent_quizzes (quiz_day INTEGER, display_name TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER)")
            jdbc.update("INSERT INTO advent_member_answers VALUES (1, 'saved'), (2, 'saved'), (3, 'saved')")
            jdbc.update("INSERT INTO advent_member_demo_quizzes VALUES (1, 'Fictif', 'A', 'B', 'C', 0), (2, 'Ancien', 'A', 'B', 'C', 0)")
            jdbc.update("INSERT INTO advent_quizzes VALUES (1, 'Fictif', 'A', 'B', 'C', 0), (2, 'Autre', 'A', 'B', 'C', 0)")
            ds.connection.use { ScriptUtils.executeSqlScript(it, ClassPathResource("db/migration/V78__advent_offline_content_conflicts.sql")) }
            assertEquals(listOf(2, 3), jdbc.queryForList("SELECT quiz_day FROM advent_offline_content_conflicts ORDER BY quiz_day", Int::class.java))
            assertEquals(3, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers", Int::class.java))
            assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM advent_quizzes", Int::class.java))
        } finally { root.execute("DROP SCHEMA $schema CASCADE") }
    }

    @Test fun `member ranking observes only committed revealed answers under lock`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val username = System.getenv("ADVENT_TEST_POSTGRES_USER"); val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, username, password))
        val schema = "advent_member_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", username, password)
            val jdbc = JdbcTemplate(ds)
            listOf(
                "CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY, test_offset_seconds BIGINT NOT NULL DEFAULT 0, test_session_id UUID)", "INSERT INTO advent_member_lock (id) VALUES (1)",
                "CREATE TABLE users (id UUID PRIMARY KEY)",
                "CREATE TABLE troupe_memberships (troupe_id UUID, user_id UUID, display_name VARCHAR(255), status VARCHAR(32), baseline_role VARCHAR(32))",
                "CREATE TABLE advent_member_answers (user_id UUID, quiz_day INTEGER, answer_id UUID, choice INTEGER, correct_choice INTEGER, answered_at TIMESTAMPTZ, reveal_at TIMESTAMPTZ, seen_at TIMESTAMPTZ)",
                "CREATE TABLE advent_quizzes (quiz_day INTEGER, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)",
                "INSERT INTO advent_quizzes VALUES (1, 'Fictif', NULL, 'A', 'B', 'C', 0, NULL)"
            ).forEach(jdbc::execute)
            val member = UUID.randomUUID(); val troupe = UUID.randomUUID(); val excluded = setOf(UUID.randomUUID(), UUID.randomUUID())
            (excluded + member).forEach { jdbc.update("INSERT INTO users VALUES (?)", it) }
            jdbc.update("INSERT INTO troupe_memberships VALUES (?, ?, 'Fictif', 'ACTIVE', 'MEMBER')", troupe, member)
            val clock = mock(AdventMemberClock::class.java)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-12-02T12:00:00Z"))
            val game = AdventMemberGame(jdbc, clock, AdventTestAnswers(jdbc), MockEnvironment())
            val tx = TransactionTemplate(DataSourceTransactionManager(ds)); val pool = Executors.newFixedThreadPool(2)
            try {
                for (commit in listOf(false, true)) {
                    val held = CountDownLatch(1); val release = CountDownLatch(1)
                    val writer = pool.submit { tx.executeWithoutResult { status ->
                        jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
                        jdbc.update("INSERT INTO advent_member_answers VALUES (?, 1, ?, 0, 0, ?, ?, ?)", member, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")), Timestamp.from(Instant.parse("2026-12-02T00:00:00Z")))
                        held.countDown(); check(release.await(10, TimeUnit.SECONDS)); if (!commit) status.setRollbackOnly()
                    } }
                    try {
                        assertTrue(held.await(10, TimeUnit.SECONDS))
                        val read = pool.submit(Callable { tx.execute { game.ranking(member, troupe, excluded) }!! })
                        assertThrows(TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
                        release.countDown(); writer.get(10, TimeUnit.SECONDS)
                        assertEquals(if (commit) 11 else 0, read.get(10, TimeUnit.SECONDS).ranking!!.score)
                    } finally { release.countDown() }
                }
            } finally { pool.shutdownNow() }
        } finally { root.execute("DROP SCHEMA $schema CASCADE") }
    }
}
