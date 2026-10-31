package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
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
class AdventRankingPostgresTest {
    @Test fun `ranking waits for transaction outcome without phantom scores`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val username = System.getenv("ADVENT_TEST_POSTGRES_USER")
        val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, username, password))
        val schema = "advent_ranking_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", username, password)
            val jdbc = JdbcTemplate(ds)
            listOf(
                "CREATE TABLE advent_test_clock (id INTEGER PRIMARY KEY, offset_seconds BIGINT, observed_at TIMESTAMPTZ)",
                "INSERT INTO advent_test_clock VALUES (1, 0, NULL)",
                "CREATE TABLE users (id UUID PRIMARY KEY, email VARCHAR(320))",
                "CREATE TABLE troupe_memberships (troupe_id UUID, user_id UUID, display_name VARCHAR(255), status VARCHAR(32), baseline_role VARCHAR(32))",
                "CREATE TABLE advent_test_answers (user_id UUID, quiz_day INTEGER, choice INTEGER, correct_choice INTEGER, reveal_at TIMESTAMPTZ)"
            ).forEach(jdbc::execute)
            val user = UUID.randomUUID(); val troupe = UUID.randomUUID(); val excludedIds = setOf(UUID.randomUUID(), UUID.randomUUID())
            excludedIds.forEach { jdbc.update("INSERT INTO users VALUES (?, NULL)", it) }
            jdbc.update("INSERT INTO users VALUES (?, NULL)", user)
            jdbc.update("INSERT INTO troupe_memberships VALUES (?, ?, 'Alex', 'ACTIVE', 'MEMBER')", troupe, user)
            val tx = TransactionTemplate(DataSourceTransactionManager(ds))
            val service = AdventTestAnswers(jdbc)
            val now = Instant.parse("2026-12-01T12:00:00Z")
            val pool = Executors.newFixedThreadPool(2)
            try {
                for (commit in listOf(false, true)) {
                    val held = CountDownLatch(1); val release = CountDownLatch(1)
                    val writer = pool.submit {
                        tx.executeWithoutResult { status ->
                            jdbc.queryForObject("SELECT id FROM advent_test_clock WHERE id = 1 FOR UPDATE", Int::class.java)
                            jdbc.update("INSERT INTO advent_test_answers VALUES (?, 1, 0, 0, ?)", user, Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")))
                            held.countDown(); check(release.await(10, TimeUnit.SECONDS))
                            if (!commit) status.setRollbackOnly()
                        }
                    }
                    try {
                        assertTrue(held.await(10, TimeUnit.SECONDS))
                        val read = pool.submit(Callable { tx.execute { service.testRanking(user, troupe, now, excludedIds) }!! })
                        assertThrows(TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
                        release.countDown(); writer.get(10, TimeUnit.SECONDS)
                        assertEquals(if (commit) 11 else 0, read.get(10, TimeUnit.SECONDS).score)
                    } finally { release.countDown() }
                }
            } finally { pool.shutdownNow() }
        } finally { root.execute("DROP SCHEMA $schema CASCADE") }
    }
}
