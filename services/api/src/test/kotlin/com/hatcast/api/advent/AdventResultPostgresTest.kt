package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.transaction.support.TransactionTemplate
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/** Dedicated disposable PostgreSQL only: independent schema in a throwaway database. */
@EnabledIfEnvironmentVariable(named = "ADVENT_TEST_POSTGRES_URL", matches = ".+")
class AdventResultPostgresTest {
    @Test fun `selected quiz transfer leaves test answers and destination state untouched`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val root = JdbcTemplate(DriverManagerDataSource(url, System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")))
        val suffix = UUID.randomUUID().toString().replace("-", "")
        val source = "advent_source_$suffix"
        val destination = "advent_destination_$suffix"
        root.execute("CREATE SCHEMA $source")
        root.execute("CREATE SCHEMA $destination")
        try {
            val migration = javaClass.getResource("/db/migration/V75__advent_quizzes.sql")!!.readText()
            fun schemaJdbc(schema: String): JdbcTemplate = JdbcTemplate(DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")))
            val src = schemaJdbc(source)
            val dst = schemaJdbc(destination)
            src.execute("CREATE TABLE advent_test_answers (quiz_day INTEGER)")
            dst.execute("CREATE TABLE advent_test_answers (quiz_day INTEGER)")
            for (db in listOf(src, dst)) for (table in listOf("advent_test_attempts", "advent_test_generations", "advent_test_replays", "advent_test_member_state", "advent_test_clock_advances")) db.execute("CREATE TABLE $table (marker INTEGER)")
            src.update("INSERT INTO advent_test_answers VALUES (1), (2)")
            src.execute(migration); dst.execute(migration)
            assertTrue(src.queryForObject("SELECT reset_required FROM advent_content_transition WHERE id = 1", Boolean::class.java)!!)
            assertFalse(dst.queryForObject("SELECT reset_required FROM advent_content_transition WHERE id = 1", Boolean::class.java)!!)
            seedAdventQuizzes(src)
            dst.update("INSERT INTO advent_test_answers VALUES (9)")
            val query = "SELECT quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation FROM advent_quizzes WHERE quiz_day = ?"
            val insert = "INSERT INTO advent_quizzes (quiz_day, display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (quiz_day) DO NOTHING"
            fun copy(day: Int): Int {
                val row = src.queryForList(query, day).single()
                return dst.update(insert, row["quiz_day"], row["display_name"], row["portrait_ref"], row["statement_0"], row["statement_1"], row["statement_2"], row["false_choice"], row["explanation"])
            }
            val tx = TransactionTemplate(DataSourceTransactionManager(dst.dataSource!!))
            assertEquals(1, copy(2)) // Existing destination conflict remains untouched.
            tx.executeWithoutResult { status ->
                assertEquals(1, copy(1))
                assertEquals(0, copy(2))
                status.setRollbackOnly()
            }
            assertEquals(listOf(2), dst.queryForList("SELECT quiz_day FROM advent_quizzes", Int::class.java))
            tx.executeWithoutResult { assertEquals(1, copy(1)); assertEquals(src.queryForList(query, 1), dst.queryForList(query, 1)) }
            assertEquals(listOf(1, 2), dst.queryForList("SELECT quiz_day FROM advent_quizzes ORDER BY quiz_day", Int::class.java))
            tx.executeWithoutResult {
                val saved = src.queryForList(query, 1)
                val locked = dst.queryForList(query + " FOR UPDATE", 1)
                assertEquals(saved, locked)
                assertEquals(1, dst.update("DELETE FROM advent_quizzes WHERE quiz_day = ?", 1))
            }
            assertEquals(listOf(2), dst.queryForList("SELECT quiz_day FROM advent_quizzes", Int::class.java))
            assertEquals(listOf(9), dst.queryForList("SELECT quiz_day FROM advent_test_answers", Int::class.java))
            assertEquals(2, src.queryForObject("SELECT COUNT(*) FROM advent_test_answers", Int::class.java))
        } finally {
            root.execute("DROP SCHEMA $source CASCADE")
            root.execute("DROP SCHEMA $destination CASCADE")
        }
    }

    @Test fun `migration fences pending-only attempts and generations without deleting them`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val root = JdbcTemplate(DriverManagerDataSource(url, System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")))
        for (pendingTable in listOf("advent_test_attempts", "advent_test_generations")) {
            val schema = "advent_pending_" + UUID.randomUUID().toString().replace("-", "")
            root.execute("CREATE SCHEMA $schema")
            try {
                val db = JdbcTemplate(DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", System.getenv("ADVENT_TEST_POSTGRES_USER"), System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")))
                for (table in listOf("advent_test_answers", "advent_test_attempts", "advent_test_generations", "advent_test_replays", "advent_test_member_state", "advent_test_clock_advances")) db.execute("CREATE TABLE $table (marker INTEGER)")
                db.update("INSERT INTO $pendingTable VALUES (1)")
                db.execute(javaClass.getResource("/db/migration/V75__advent_quizzes.sql")!!.readText())
                assertTrue(db.queryForObject("SELECT reset_required FROM advent_content_transition WHERE id = 1", Boolean::class.java)!!)
                assertEquals(1, db.queryForObject("SELECT COUNT(*) FROM $pendingTable", Int::class.java))
                assertEquals(0, db.queryForObject("SELECT COUNT(*) FROM advent_test_answers", Int::class.java))
            } finally { root.execute("DROP SCHEMA $schema CASCADE") }
        }
    }

    @Test fun `reveal waits for confirmation commit and ignores rollback`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val user = System.getenv("ADVENT_TEST_POSTGRES_USER")
        val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = DriverManagerDataSource(url, user, password)
        val schema = "advent_test_" + UUID.randomUUID().toString().replace("-", "")
        val rootJdbc = JdbcTemplate(root)
        rootJdbc.execute("CREATE SCHEMA $schema")
        try {
            val dataSource = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", user, password)
            val jdbc = JdbcTemplate(dataSource)
            listOf(
                "CREATE TABLE advent_test_clock (id INTEGER PRIMARY KEY, offset_seconds BIGINT, observed_at TIMESTAMPTZ, session_id UUID)",
                "INSERT INTO advent_test_clock VALUES (1, 0, NULL, NULL)",
                "CREATE TABLE advent_test_clock_advances (id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, received_at TIMESTAMPTZ, offset_seconds BIGINT)",
                "CREATE TABLE advent_test_answers (user_id UUID, quiz_day INTEGER, choice INTEGER, correct_choice INTEGER, response_points INTEGER, participation_points INTEGER, bonus_points INTEGER, received_at TIMESTAMPTZ, reveal_at TIMESTAMPTZ, replay_token UUID, answer_id UUID, seen_at TIMESTAMPTZ, PRIMARY KEY (user_id, quiz_day))",
                "CREATE TABLE advent_test_attempts (id UUID, user_id UUID, quiz_day INTEGER, cancelled BOOLEAN)",
                "CREATE TABLE advent_test_generations (user_id UUID, quiz_day INTEGER, generation UUID)",
                "CREATE TABLE advent_test_replays (user_id UUID, quiz_day INTEGER)",
                "CREATE TABLE advent_test_member_state (user_id UUID PRIMARY KEY, correct_streak INTEGER)",
            ).forEach(jdbc::execute)
            val migration = javaClass.getResource("/db/migration/V75__advent_quizzes.sql")!!.readText()
            jdbc.execute(migration)
            seedAdventQuizzes(jdbc)
            val service = AdventTestAnswers(jdbc)
            val tx = TransactionTemplate(DataSourceTransactionManager(dataSource))
            val member = UUID.randomUUID()
            val now = Instant.parse("2026-12-01T12:00:00Z")
            val held = CountDownLatch(1)
            val release = CountDownLatch(1)
            val pool = Executors.newFixedThreadPool(2)
            try {
                val writer = pool.submit {
                    try {
                        tx.executeWithoutResult {
                            service.confirm(member, 1, 0, now)
                            service.advanceDay(now)
                            held.countDown()
                            check(release.await(10, TimeUnit.SECONDS))
                            throw IllegalStateException("rollback")
                        }
                    } catch (_: IllegalStateException) { }
                }
                assertTrue(held.await(10, TimeUnit.SECONDS))
                val read = pool.submit(Callable { tx.execute { service.latestUnseen(member, now) } })
                assertThrows(java.util.concurrent.TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
                release.countDown()
                writer.get(10, TimeUnit.SECONDS)
                assertNull(read.get(10, TimeUnit.SECONDS))
                tx.executeWithoutResult { service.confirm(member, 1, 0, now); service.advanceDay(now) }
                assertEquals(11, tx.execute { service.latestUnseen(member, now) }!!.totalPoints)
                assertEquals("2026-12-01", tx.execute { service.previousDay(now) }.toString())
                assertNull(tx.execute { service.result(member, 1, now) })
                assertEquals("2026-12-02", tx.execute { service.advanceDay(now) }.toString())
                assertEquals(11, tx.execute { service.result(member, 1, now) }!!.totalPoints)
            } finally { release.countDown(); pool.shutdownNow() }
        } finally { rootJdbc.execute("DROP SCHEMA $schema CASCADE") }
    }
}
