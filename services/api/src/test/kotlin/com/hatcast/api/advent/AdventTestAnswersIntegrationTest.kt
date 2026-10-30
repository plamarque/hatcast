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
class AdventTestAnswersIntegrationTest {
    @Autowired lateinit var answers: AdventTestAnswers
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var txManager: PlatformTransactionManager
    private val user = UUID.randomUUID()

    @BeforeEach fun prepare() {
        jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", user, "advent-$user", "advent-$user")
        jdbc.update("DELETE FROM advent_test_clock_advances")
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = 0, observed_at = NULL WHERE id = 1")
    }

    @Test fun `concurrent retries save one answer and one score`() {
        val gate = CountDownLatch(1)
        val executor = Executors.newFixedThreadPool(2)
        try {
            val tasks = (0..1).map { choice -> executor.submit(Callable {
                gate.await()
                answers.confirm(user, 1, choice, Instant.parse("2026-12-01T12:00:00Z"))
            }) }
            gate.countDown()
            tasks.forEach { assertEquals("recorded", it.get(10, TimeUnit.SECONDS).status) }
            assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
            assertEquals(1, jdbc.queryForObject("SELECT participation_points FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
        } finally { executor.shutdownNow() }
    }

    @Test fun `reconciliation cancels a delayed confirmation and isolates another member`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val other = UUID.randomUUID()
        jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", other, "advent-$other", "advent-$other")
        val attempt = UUID.randomUUID()
        val otherAttempt = UUID.randomUUID()
        assertEquals("available", answers.reserve(user, 1, attempt, answers.reconcile(user, 1, now).generation!!, now).status)
        assertEquals("available", answers.reserve(other, 1, otherAttempt, answers.reconcile(other, 1, now).generation!!, now).status)
        val gate = CountDownLatch(1)
        val pool = Executors.newSingleThreadExecutor()
        try {
            val delayed = pool.submit(Callable { gate.await(); answers.confirmReserved(user, 1, 0, attempt, now) })
            assertEquals("available", answers.reconcile(user, 1, now).status)
            gate.countDown()
            assertEquals("available", delayed.get(10, TimeUnit.SECONDS).status)
            assertEquals("recorded", answers.confirmReserved(other, 1, 1, otherAttempt, now).status)
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
        } finally { gate.countDown(); pool.shutdownNow() }
    }

    @Test fun `reconciliation rejects a delayed reservation from an older device`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val generation = answers.reconcile(user, 1, now).generation!!
        val attempt = UUID.randomUUID()
        val gate = CountDownLatch(1)
        val pool = Executors.newSingleThreadExecutor()
        try {
            val delayed = pool.submit(Callable { gate.await(); answers.reserve(user, 1, attempt, generation, now) })
            val current = answers.reconcile(user, 1, now).generation!!
            gate.countDown()
            assertEquals("stale", delayed.get(10, TimeUnit.SECONDS).status)
            assertEquals("available", answers.confirmReserved(user, 1, 0, attempt, now).status)
            val newAttempt = UUID.randomUUID()
            assertEquals("available", answers.reserve(user, 1, newAttempt, current, now).status)
            assertEquals("recorded", answers.confirmReserved(user, 1, 2, newAttempt, now).status)
        } finally { gate.countDown(); pool.shutdownNow() }
    }

    @Test fun `confirmation before reconciliation remains recorded`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val attempt = UUID.randomUUID()
        answers.reserve(user, 1, attempt, answers.reconcile(user, 1, now).generation!!, now)
        assertEquals("recorded", answers.confirmReserved(user, 1, 0, attempt, now).status)
        assertEquals("recorded", answers.reconcile(user, 1, now).status)
        assertEquals("recorded", answers.confirmReserved(user, 1, 2, attempt, now).status)
    }

    @Test fun `Paris midnight uses receipt instant`() {
        assertEquals("recorded", answers.confirm(user, 1, 0, Instant.parse("2026-12-01T22:59:59.999Z")).status)
        assertEquals("closed", answers.confirm(user, 2, 1, Instant.parse("2026-12-02T23:00:00Z")).status)
    }

    @Test fun `request remains admissible when lock wait ends before midnight`() {
        val locked = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val blocker = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    jdbc.queryForObject("SELECT id FROM advent_test_clock WHERE id = 1 FOR UPDATE", Int::class.java)
                    locked.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(locked.await(10, TimeUnit.SECONDS))
            val result = pool.submit(Callable { answers.confirm(user, 1, 0, Instant.parse("2026-12-01T22:59:59.999Z")) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { result.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            blocker.get(10, TimeUnit.SECONDS)
            assertEquals("recorded", result.get(10, TimeUnit.SECONDS).status)
        } finally { release.countDown(); pool.shutdownNow() }
    }

    @Test fun `confirmation waiting on the clock lock across midnight closes`() {
        val deadline = Instant.parse("2026-12-01T23:00:00Z")
        val boundary = Instant.now().epochSecond + 2
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = ?, observed_at = NULL WHERE id = 1", deadline.epochSecond - boundary)
        val locked = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val blocker = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    jdbc.queryForObject("SELECT id FROM advent_test_clock WHERE id = 1 FOR UPDATE", Int::class.java)
                    locked.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(locked.await(10, TimeUnit.SECONDS))
            val received = Instant.now()
            val result = pool.submit(Callable { answers.confirm(user, 1, 0, received) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { result.get(100, TimeUnit.MILLISECONDS) }
            while (Instant.now().epochSecond < boundary) Thread.sleep(20)
            release.countDown()
            blocker.get(10, TimeUnit.SECONDS)
            assertEquals("closed", result.get(10, TimeUnit.SECONDS).status)
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
        } finally { release.countDown(); pool.shutdownNow() }
    }

    @Test fun `state read waits for a confirmation transaction to commit`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val inserted = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    assertEquals("recorded", answers.confirm(user, 1, 0, now).status)
                    inserted.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(inserted.await(10, TimeUnit.SECONDS))
            val read = pool.submit(Callable { answers.state(user, 1, now) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            writer.get(10, TimeUnit.SECONDS)
            assertEquals("recorded", read.get(10, TimeUnit.SECONDS).status)
        } finally { release.countDown(); pool.shutdownNow() }
    }

    @Test fun `later future case closes an earlier received request`() {
        // The later request obtains the lock first; the earlier receipt was still on day 1.
        assertEquals("recorded", answers.confirm(user, 2, 1, Instant.parse("2026-12-01T12:00:01Z")).status)
        assertEquals("closed", answers.confirm(user, 1, 0, Instant.parse("2026-12-01T12:00:00Z")).status)
    }

    @Test fun `inverted lock order preserves chronological correct streak`() {
        // Day 2 is wrong, but commits before the earlier day 1 correct response.
        answers.confirm(user, 2, 0, Instant.parse("2026-12-01T12:00:01Z"))
        answers.confirm(user, 1, 0, Instant.parse("2026-12-01T12:00:00Z"))
        answers.confirm(user, 3, 2, Instant.parse("2026-12-02T12:00:02Z"))
        answers.confirm(user, 4, 1, Instant.parse("2026-12-03T12:00:03Z"))
        assertEquals(0, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 4", Int::class.java, user))
    }

    @Test fun `late reserved confirmation does not change a revealable bonus`() {
        val firstReceipt = Instant.parse("2026-12-01T12:00:00Z")
        val attempt = UUID.randomUUID()
        val generation = answers.reconcile(user, 1, firstReceipt).generation!!
        assertEquals("available", answers.reserve(user, 1, attempt, generation, firstReceipt).status)
        answers.confirm(user, 2, 1, Instant.parse("2026-12-02T12:00:00Z"))
        answers.confirm(user, 3, 2, Instant.parse("2026-12-03T12:00:00Z"))
        answers.confirm(user, 4, 1, Instant.parse("2026-12-04T12:00:00Z"))
        answers.state(user, 4, Instant.parse("2026-12-05T12:00:00Z"))
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 4", Int::class.java, user))
        assertEquals("closed", answers.confirmReserved(user, 1, 0, attempt, firstReceipt).status)
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 4", Int::class.java, user))
    }

    @Test fun `late persistence does not change a revealable bonus`() {
        answers.confirm(user, 2, 1, Instant.parse("2026-12-02T12:00:00Z"))
        answers.confirm(user, 3, 2, Instant.parse("2026-12-03T12:00:00Z"))
        answers.confirm(user, 4, 1, Instant.parse("2026-12-04T12:00:00Z"))
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 4", Int::class.java, user))
        // An old receipt persists only after the fourth quiz has become revealable.
        answers.state(user, 4, Instant.parse("2026-12-05T12:00:00Z"))
        answers.confirm(user, 1, 0, Instant.parse("2026-12-01T12:00:00Z"))
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 4", Int::class.java, user))
    }

    @Test fun `future case advances shared simulated clock and closes earlier cases`() {
        assertEquals("recorded", answers.confirm(user, 3, 2, Instant.parse("2026-12-01T12:00:00Z")).status)
        assertEquals("closed", answers.state(user, 1, Instant.parse("2026-12-01T12:00:01Z")).status)
        assertEquals("available", answers.state(user, 4, Instant.parse("2026-12-01T12:00:01Z")).status)
        assertEquals("closed", answers.state(user, 4, Instant.parse("2026-12-03T23:00:01Z")).status)
    }

    @Test fun `three correct answers earn bonus and a wrong answer resets streak`() {
        answers.confirm(user, 1, 0, Instant.parse("2026-12-01T12:00:00Z"))
        answers.confirm(user, 2, 1, Instant.parse("2026-12-02T12:00:00Z"))
        answers.confirm(user, 3, 2, Instant.parse("2026-12-03T12:00:00Z"))
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 3", Int::class.java, user))
        answers.confirm(user, 4, 0, Instant.parse("2026-12-04T12:00:00Z"))
        assertEquals(0, jdbc.queryForObject("SELECT correct_streak FROM advent_test_member_state WHERE user_id = ?", Int::class.java, user))
    }
}
