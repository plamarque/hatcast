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
import java.time.Instant
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

@SpringBootTest
@ActiveProfiles("test")
class AdventResultIntegrationTest {
    @Autowired lateinit var answers: AdventTestAnswers
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var transactions: PlatformTransactionManager
    private val user = UUID.randomUUID()
    private val now = Instant.parse("2026-12-01T12:00:00Z")

    @BeforeEach fun setup() {
        seedAdventQuizzes(jdbc)
        jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", user, "result-$user", "result-$user")
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = 0, observed_at = NULL WHERE id = 1")
    }

    @Test fun `result remains secret until next Paris day and is acknowledged idempotently`() {
        answers.confirm(user, 1, 0, now)
        assertNull(answers.latestUnseen(user, now))
        assertNull(answers.result(user, 1, now))
        assertNull(answers.latestUnseen(UUID.randomUUID(), now))
        assertEquals("2026-12-02", answers.advanceDay(now).toString())
        val result = answers.latestUnseen(user, now)!!
        assertEquals(1, result.day)
        assertTrue(result.correct)
        assertEquals(11, result.totalPoints)
        assertFalse(result.seen)
        assertEquals("Explication fictive", result.explanation)
        answers.acknowledge(user, 1, UUID.fromString(result.answerId), now)
        answers.acknowledge(user, 1, UUID.fromString(result.answerId), now)
        assertNull(answers.latestUnseen(user, now))
        assertTrue(answers.result(user, 1, now)!!.seen)
    }

    @Test fun `pending newer answer does not hide most recent eligible result`() {
        answers.confirm(user, 1, 0, now)
        answers.confirm(user, 2, 1, now)
        assertEquals(1, answers.latestUnseen(user, now)!!.day)
        assertNull(answers.result(user, 2, now))
        answers.advanceDay(now)
        assertEquals(2, answers.latestUnseen(user, now)!!.day)
    }

    @Test fun `twenty fourth answer becomes revealable on Christmas`() {
        answers.confirm(user, 24, 2, now)
        assertNull(answers.result(user, 24, now))
        assertEquals("2026-12-25", answers.advanceDay(now).toString())
        assertEquals(24, answers.latestUnseen(user, now)!!.day)
    }

    @Test fun `stale acknowledgement cannot mark replayed answer`() {
        answers.confirm(user, 1, 0, now)
        answers.advanceDay(now)
        val first = answers.latestUnseen(user, now)!!
        val token = answers.state(user, 1, now).replayToken!!
        answers.replay(user, 1, token, now)
        answers.confirm(user, 1, 1, now)
        assertThrows(org.springframework.web.server.ResponseStatusException::class.java) {
            answers.acknowledge(user, 1, UUID.fromString(first.answerId), now)
        }
        assertFalse(answers.latestUnseen(user, now)!!.seen)
    }

    @Test fun `missed days preserve streak and bonuses do not overlap`() {
        listOf(1 to 0, 2 to 1, 3 to 2, 5 to 0, 6 to 2, 7 to 0, 8 to 0).forEach { (day, choice) ->
            assertEquals("recorded", answers.confirm(user, day, choice, now).status)
        }
        answers.advanceDay(now)
        assertEquals(2, answers.result(user, 3, now)!!.bonusPoints)
        assertEquals(2, answers.result(user, 7, now)!!.bonusPoints)
        val wrong = answers.result(user, 8, now)!!
        assertFalse(wrong.correct)
        assertEquals(0, wrong.responsePoints)
        assertEquals(0, wrong.bonusPoints)
        assertEquals(71, wrong.totalPoints)
    }

    @Test fun `result read waits for transaction and observes rollback`() {
        val held = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                try {
                    TransactionTemplate(transactions).executeWithoutResult {
                        answers.confirm(user, 1, 0, now)
                        answers.advanceDay(now)
                        held.countDown()
                        check(release.await(10, TimeUnit.SECONDS))
                        throw IllegalStateException("rollback")
                    }
                } catch (_: IllegalStateException) { }
            }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val reader = pool.submit(Callable { answers.latestUnseen(user, now) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { reader.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            writer.get(10, TimeUnit.SECONDS)
            assertNull(reader.get(10, TimeUnit.SECONDS))
        } finally { release.countDown(); pool.shutdownNow() }
    }
    @Test fun `acknowledgement rollback preserves unseen result`() {
        answers.confirm(user, 1, 0, now)
        answers.advanceDay(now)
        val result = answers.latestUnseen(user, now)!!
        assertThrows(IllegalStateException::class.java) {
            TransactionTemplate(transactions).executeWithoutResult {
                answers.acknowledge(user, 1, UUID.fromString(result.answerId), now)
                throw IllegalStateException("rollback")
            }
        }
        assertEquals(result.answerId, answers.latestUnseen(user, now)!!.answerId)
    }

    @Test fun `stale session cannot advance clock after reset`() {
        val old = answers.session()
        answers.reset(old)
        val before = jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1")
        assertThrows(org.springframework.web.server.ResponseStatusException::class.java) {
            TransactionTemplate(transactions).executeWithoutResult {
                answers.requireSession(old)
                answers.advanceDay(now)
            }
        }
        assertEquals(before, jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1"))
    }

    @Test fun `result waits for committed confirmation`() {
        val held = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(transactions).executeWithoutResult {
                    answers.confirm(user, 1, 0, now)
                    answers.advanceDay(now)
                    held.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val reader = pool.submit(Callable { answers.latestUnseen(user, now) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { reader.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            writer.get(10, TimeUnit.SECONDS)
            assertEquals(11, reader.get(10, TimeUnit.SECONDS)!!.totalPoints)
        } finally { release.countDown(); pool.shutdownNow() }
    }

    @Test fun `legacy answer receives stable identity before acknowledgment`() {
        answers.confirm(user, 1, 0, now)
        jdbc.update("UPDATE advent_test_answers SET answer_id = NULL WHERE user_id = ? AND quiz_day = 1", user)
        answers.advanceDay(now)
        val first = answers.latestUnseen(user, now)!!
        assertEquals(first.answerId, answers.result(user, 1, now)!!.answerId)
        answers.acknowledge(user, 1, UUID.fromString(first.answerId), now)
        assertNull(answers.latestUnseen(user, now))
        assertTrue(answers.result(user, 1, now)!!.seen)
    }

    @Test fun `moving the test clock backward keeps answers and hides the not yet revealed result`() {
        answers.confirm(user, 1, 0, now)
        assertEquals("2026-12-02", answers.advanceDay(now).toString())
        assertNotNull(answers.result(user, 1, now))
        assertEquals("2026-12-01", answers.previousDay(now).toString())
        assertEquals("2026-12-01", answers.clockDate(now).toString())
        assertNull(answers.result(user, 1, now))
        assertEquals("recorded", answers.state(user, 1, now).status)
        assertEquals("2026-12-01", answers.previousDay(now).toString())
        assertEquals("2026-12-02", answers.advanceDay(now).toString())
        assertEquals(11, answers.result(user, 1, now)!!.totalPoints)
    }

}
