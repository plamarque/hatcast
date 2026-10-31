package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import java.sql.Timestamp
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@SpringBootTest
@ActiveProfiles("test")
class AdventRankingIntegrationTest {
    @Autowired lateinit var answers: AdventTestAnswers
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var txManager: PlatformTransactionManager
    private val troupe = UUID.randomUUID()
    private val member = UUID.randomUUID()
    private val other = UUID.randomUUID()
    private val excludedIds = setOf(UUID.randomUUID(), UUID.randomUUID())
    private val now = Instant.parse("2026-12-01T12:00:00Z")

    @BeforeEach fun prepare() {
        val slug = "ranking-$troupe"
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", troupe, "Troupe fictive", slug)
        for (id in excludedIds) jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", id, "ranking-$id", "ranking-$id")
        for ((id, name) in listOf(member to "Alex", other to "Camille")) {
            jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", id, "ranking-$id", "ranking-$id")
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, id, name)
        }
    }
    private fun insertAnswer() {
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at) VALUES (?, 1, 0, 0, 10, 1, 0, ?, ?)", member, Timestamp.from(now), Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")))
    }

    @Test fun `test includes pending while revealable calculation waits until midnight`() {
        insertAnswer()
        assertEquals(11, answers.testRanking(member, troupe, now, excludedIds).score)
        assertEquals(0, answers.testRevealableRanking(member, troupe, Instant.parse("2026-12-01T22:59:59Z"), excludedIds).score)
        assertEquals(11, answers.testRevealableRanking(member, troupe, Instant.parse("2026-12-01T23:00:00Z"), excludedIds).score)
        assertEquals(0, answers.testRanking(other, troupe, now, excludedIds).score)
    }

    @Test fun `invalid exclusion identities fail closed`() {
        val failure = assertThrows(org.springframework.web.server.ResponseStatusException::class.java) {
            answers.testRanking(member, troupe, now, setOf(UUID.randomUUID(), UUID.randomUUID()))
        }
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, failure.statusCode)
    }

    @Test fun `ranking waits for uncommitted answers and rollback produces no phantom score`() {
        val held = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult { status ->
                    jdbc.queryForObject("SELECT id FROM advent_test_clock WHERE id = 1 FOR UPDATE", Int::class.java)
                    insertAnswer()
                    held.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                    status.setRollbackOnly()
                }
            }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val read = pool.submit(Callable { answers.testRanking(member, troupe, now, excludedIds) })
            assertThrows(TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            writer.get(10, TimeUnit.SECONDS)
            assertEquals(0, read.get(10, TimeUnit.SECONDS).score)
        } finally { release.countDown(); pool.shutdownNow() }
    }
}
