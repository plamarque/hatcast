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
    @Test fun `preview reads only its owners future result on PostgreSQL`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val root = JdbcTemplate(DriverManagerDataSource(url, System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")))
        val schema = "advent_preview_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD"))
            val jdbc = JdbcTemplate(ds)
            listOf(
                "CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY, test_session_id UUID)", "INSERT INTO advent_member_lock VALUES (1, NULL)",
                "CREATE TABLE advent_member_answers (user_id UUID, quiz_day INTEGER, answer_id UUID, choice INTEGER, correct_choice INTEGER, answered_at TIMESTAMPTZ, reveal_at TIMESTAMPTZ, seen_at TIMESTAMPTZ, late BOOLEAN NOT NULL DEFAULT FALSE)",
                "CREATE TABLE advent_member_attempts (id UUID PRIMARY KEY, user_id UUID, quiz_day INTEGER, late BOOLEAN NOT NULL DEFAULT FALSE, cancelled BOOLEAN NOT NULL DEFAULT FALSE)",
                "CREATE TABLE advent_member_generations (user_id UUID, quiz_day INTEGER, generation UUID, late BOOLEAN NOT NULL DEFAULT FALSE)",
                "CREATE TABLE advent_member_replays (user_id UUID, quiz_day INTEGER, late BOOLEAN NOT NULL DEFAULT FALSE)",
                "CREATE TABLE advent_quizzes (quiz_day INTEGER, display_name TEXT, portrait_ref TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, false_choice INTEGER, explanation TEXT)",
                "INSERT INTO advent_quizzes VALUES (23, 'Fictif', NULL, 'A', 'B', 'C', 1, 'Explication fictive')"
            ).forEach(jdbc::execute)
            val owner = UUID.randomUUID(); val other = UUID.randomUUID()
            jdbc.update("INSERT INTO advent_member_answers VALUES (?, 23, ?, 1, 1, ?, ?, ?, FALSE)", owner, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-11-30T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-23T23:00:00Z")), Timestamp.from(Instant.parse("2026-11-30T12:00:00Z")))
            val clock = mock(AdventMemberClock::class.java)
            `when`(clock.instant()).thenReturn(Instant.parse("2026-11-30T22:59:59Z"))
            val game = AdventMemberGame(jdbc, clock, AdventTestAnswers(jdbc), MockEnvironment())
            val tx = TransactionTemplate(DataSourceTransactionManager(ds))
            tx.executeWithoutResult {
                assertEquals("Explication fictive", game.result(owner, 23, preview = true)!!.explanation)
                assertNull(game.result(other, 23, preview = true))
                assertThrows(org.springframework.web.server.ResponseStatusException::class.java) { game.result(owner, 23) }
                assertEquals("correct", game.calendar(owner, preview = true).days!!.single { it.day == 23 }.outcome)
                val generation = game.reconcile(other, 23, preview = true).generation!!
                val attempt = UUID.randomUUID()
                assertEquals("available", game.reserve(other, 23, attempt, generation, preview = true).status)
                assertEquals("recorded", game.confirm(other, 23, 1, attempt, preview = true).status)
                val result = game.result(other, 23, preview = true)!!
                assertEquals("Explication fictive", result.explanation)
                game.acknowledge(other, 23, UUID.fromString(result.answerId), preview = true)
                assertNull(game.latestUnseen(other, preview = true))
            }
        } finally { root.execute("DROP SCHEMA $schema CASCADE") }
    }
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

    @Test fun `late answer migration preserves existing data and defaults and stores explicit late writes`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val username = System.getenv("ADVENT_TEST_POSTGRES_USER"); val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, username, password))
        val schema = "advent_late_migration_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", username, password)
            val jdbc = JdbcTemplate(ds)
            val tables = listOf("advent_member_answers", "advent_member_generations", "advent_member_attempts", "advent_member_replays")
            for (table in tables) {
                jdbc.execute("CREATE TABLE $table (id INTEGER PRIMARY KEY, marker TEXT NOT NULL)")
                jdbc.update("INSERT INTO $table (id, marker) VALUES (1, 'existing fiction')")
            }
            ds.connection.use { ScriptUtils.executeSqlScript(it, ClassPathResource("db/migration/V79__advent_late_answers.sql")) }
            for (table in tables) {
                assertEquals("existing fiction", jdbc.queryForObject("SELECT marker FROM $table WHERE id = 1", String::class.java))
                assertFalse(jdbc.queryForObject("SELECT late FROM $table WHERE id = 1", Boolean::class.java)!!)
                jdbc.update("INSERT INTO $table (id, marker) VALUES (2, 'normal fiction')")
                assertFalse(jdbc.queryForObject("SELECT late FROM $table WHERE id = 2", Boolean::class.java)!!)
                jdbc.update("INSERT INTO $table (id, marker, late) VALUES (3, 'late fiction', TRUE)")
                assertTrue(jdbc.queryForObject("SELECT late FROM $table WHERE id = 3", Boolean::class.java)!!)
                assertEquals(3, jdbc.queryForObject("SELECT COUNT(*) FROM $table", Int::class.java))
                assertThrows(org.springframework.dao.DataIntegrityViolationException::class.java) {
                    jdbc.update("INSERT INTO $table (id, marker, late) VALUES (4, 'invalid fiction', NULL)")
                }
            }
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
                "CREATE TABLE advent_member_answers (user_id UUID, quiz_day INTEGER, answer_id UUID, choice INTEGER, correct_choice INTEGER, answered_at TIMESTAMPTZ, reveal_at TIMESTAMPTZ, seen_at TIMESTAMPTZ, late BOOLEAN NOT NULL DEFAULT FALSE)",
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
                        jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at) VALUES (?, 1, ?, 0, 0, ?, ?, ?)", member, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")), Timestamp.from(Instant.parse("2026-12-02T00:00:00Z")))
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
