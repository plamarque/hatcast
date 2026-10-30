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
    @Test fun `personal replay invalidates old attempts and recomputes past scores`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val other = UUID.randomUUID()
        jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", other, "advent-$other", "advent-$other")
        val old = UUID.randomUUID()
        val generation = answers.reconcile(user, 1, now).generation!!
        answers.reserve(user, 1, old, generation, now)
        answers.confirm(user, 1, 0, now)
        answers.confirm(other, 1, 0, now)
        answers.confirm(user, 2, 1, now)
        answers.confirm(user, 3, 2, now)
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 3", Int::class.java, user))
        val clock = jdbc.queryForObject("SELECT offset_seconds FROM advent_test_clock WHERE id = 1", Long::class.java)
        val erasedToken = answers.state(user, 1, now).replayToken!!
        assertEquals("available", answers.replay(user, 1, erasedToken, now).status)
        assertEquals(clock, jdbc.queryForObject("SELECT offset_seconds FROM advent_test_clock WHERE id = 1", Long::class.java))
        assertEquals(0, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 3", Int::class.java, user))
        assertEquals("recorded", answers.state(other, 1, now).status)
        assertEquals("available", answers.confirmReserved(user, 1, 0, old, now).status)
        val fresh = answers.reconcile(user, 1, now).generation!!
        val attempt = UUID.randomUUID()
        answers.reserve(user, 1, attempt, fresh, now)
        assertEquals("recorded", answers.confirmReserved(user, 1, 0, attempt, now).status)
        assertEquals(2, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ? AND quiz_day = 3", Int::class.java, user))
        assertEquals("recorded", answers.replay(user, 1, erasedToken, now).status)
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ? AND quiz_day = 1", Int::class.java, user))
    }
    @Test fun `replay serializes and cancels a confirmation waiting on the lock`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val attempt = UUID.randomUUID()
        val generation = answers.reconcile(user, 1, now).generation!!
        answers.reserve(user, 1, attempt, generation, now)
        answers.confirm(user, 1, 0, now)
        val erased = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val replay = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    answers.replay(user, 1, answers.state(user, 1, now).replayToken!!, now)
                    erased.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(erased.await(10, TimeUnit.SECONDS))
            val confirmation = pool.submit(Callable { answers.confirmReserved(user, 1, 0, attempt, now) })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { confirmation.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            replay.get(10, TimeUnit.SECONDS)
            assertEquals("available", confirmation.get(10, TimeUnit.SECONDS).status)
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
        } finally { release.countDown(); pool.shutdownNow() }
    }
    @Test fun `reconcile revokes replay before or after replay executes`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val old = answers.confirm(user, 1, 0, now).replayToken!!
        val refreshed = answers.reconcile(user, 1, now).replayToken!!
        assertNotEquals(old, refreshed)
        assertEquals("recorded", answers.replay(user, 1, old, now).status)
        assertEquals("available", answers.replay(user, 1, refreshed, now).status)
        assertEquals("available", answers.reconcile(user, 1, now).status)
    }
    @Test fun `reset clears test state and fences old operations with atomic rollback`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val old = answers.session()
        answers.confirm(user, 3, 2, now)
        val originalOffset = jdbc.queryForObject("SELECT offset_seconds FROM advent_test_clock WHERE id = 1", Long::class.java)
        assertThrows(IllegalStateException::class.java) {
            TransactionTemplate(txManager).executeWithoutResult {
                answers.reset(old)
                throw IllegalStateException("rollback")
            }
        }
        assertEquals(old, answers.session())
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
        assertEquals(originalOffset, jdbc.queryForObject("SELECT offset_seconds FROM advent_test_clock WHERE id = 1", Long::class.java))
        answers.reset(old)
        assertNotEquals(old, answers.session())
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers", Int::class.java))
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_member_state", Int::class.java))
        assertNull(jdbc.queryForObject("SELECT offset_seconds FROM advent_test_clock WHERE id = 1", Long::class.java))
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE id = ?", Int::class.java, user))
        assertThrows(org.springframework.web.server.ResponseStatusException::class.java) { answers.requireSession(old) }
        assertEquals("recorded", answers.confirm(user, 1, 0, now).status)
        assertEquals(0, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
    }

    @Test fun `reset orders against a transaction that already holds the session lock`() {
        val old = answers.session()
        val locked = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    answers.requireSession(old)
                    locked.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                    answers.confirm(user, 1, 0, Instant.parse("2026-12-01T12:00:00Z"))
                }
            }
            assertTrue(locked.await(10, TimeUnit.SECONDS))
            val reset = pool.submit { answers.reset(old) }
            assertThrows(java.util.concurrent.TimeoutException::class.java) { reset.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            writer.get(10, TimeUnit.SECONDS)
            reset.get(10, TimeUnit.SECONDS)
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
            assertThrows(org.springframework.web.server.ResponseStatusException::class.java) { answers.requireSession(old) }
        } finally { release.countDown(); pool.shutdownNow() }
    }
    @Test fun `all reset state rolls back together and reset clears it before fresh play`() {
        val now = Instant.parse("2026-12-01T12:00:00Z")
        val id = answers.session()
        answers.confirm(user, 3, 2, now)
        val generation = answers.reconcile(user, 4, now).generation!!
        answers.reserve(user, 4, UUID.randomUUID(), generation, now)
        jdbc.update("INSERT INTO advent_test_replays (user_id, quiz_day) VALUES (?, ?)", user, 2)
        val tables = listOf("advent_test_answers", "advent_test_member_state", "advent_test_attempts", "advent_test_generations", "advent_test_replays", "advent_test_clock_advances")
        val counts = tables.associateWith { jdbc.queryForObject("SELECT COUNT(*) FROM $it", Int::class.java)!! }
        assertTrue(counts.values.all { it > 0 })
        val clock = jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1")
        assertThrows(IllegalStateException::class.java) {
            TransactionTemplate(txManager).executeWithoutResult { answers.reset(id); throw IllegalStateException("rollback") }
        }
        assertEquals(counts, tables.associateWith { jdbc.queryForObject("SELECT COUNT(*) FROM $it", Int::class.java)!! })
        assertEquals(clock, jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1"))
        answers.reset(id)
        tables.forEach { assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM $it", Int::class.java), it) }
        val resetClock = jdbc.queryForMap("SELECT offset_seconds, observed_at, session_id FROM advent_test_clock WHERE id = 1")
        assertNull(resetClock["offset_seconds"])
        assertNull(resetClock["observed_at"])
        assertNotEquals(id.toString(), resetClock["session_id"].toString())
        assertEquals("recorded", answers.confirm(user, 1, 0, now).status)
        assertEquals(1, jdbc.queryForObject("SELECT correct_streak FROM advent_test_member_state WHERE user_id = ?", Int::class.java, user))
        assertEquals(0, jdbc.queryForObject("SELECT bonus_points FROM advent_test_answers WHERE user_id = ?", Int::class.java, user))
    }

    @Test fun `reset holding lock first fences waiting old session operation`() {
        val old = answers.session()
        val resetHeld = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val reset = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    answers.reset(old)
                    resetHeld.countDown()
                    check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(resetHeld.await(10, TimeUnit.SECONDS))
            val stale = pool.submit(Callable {
                TransactionTemplate(txManager).executeWithoutResult {
                    answers.requireSession(old)
                    answers.reconcile(user, 1, Instant.parse("2026-12-01T12:00:00Z"))
                }
            })
            assertThrows(java.util.concurrent.TimeoutException::class.java) { stale.get(100, TimeUnit.MILLISECONDS) }
            release.countDown()
            reset.get(10, TimeUnit.SECONDS)
            val ex = assertThrows(java.util.concurrent.ExecutionException::class.java) { stale.get(10, TimeUnit.SECONDS) }
            assertTrue(ex.cause is org.springframework.web.server.ResponseStatusException)
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_generations WHERE user_id = ?", Int::class.java, user))
        } finally { release.countDown(); pool.shutdownNow() }
    }
}
