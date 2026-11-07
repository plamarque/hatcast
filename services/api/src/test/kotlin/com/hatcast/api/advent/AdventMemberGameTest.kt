package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.mock.env.MockEnvironment
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.util.UUID
import java.util.concurrent.Callable
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

@SpringBootTest
@ActiveProfiles("test")
class AdventMemberGameTest {
    @Autowired lateinit var game: AdventMemberGame
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var testGame: AdventTestAnswers
    @Autowired lateinit var txManager: PlatformTransactionManager
    @MockBean lateinit var clock: AdventMemberClock
    private val troupe = UUID.randomUUID()
    private val member = UUID.randomUUID()
    private val other = UUID.randomUUID()
    private val excluded = setOf(UUID.randomUUID(), UUID.randomUUID())
    private fun at(value: String) { `when`(clock.instant()).thenReturn(Instant.parse(value)) }
    @BeforeEach fun prepare() {
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)", troupe, "Troupe fictive", "advent-$troupe")
        for (id in excluded + setOf(member, other)) {
            jdbc.update("INSERT INTO users (id, google_sub, slug, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", id, "advent-$id", "advent-$id")
            jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, id, "Fictif $id")
        }
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 1")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (1, 'Personnage fictif', 'A', 'B', 'C', 0)")
        at("2026-12-01T12:00:00Z")
    }
    @Test fun `isolated future gift waits for its reveal without changing the clock`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 2")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (2, 'Fictif', 'A', 'B', 'C', 0)")
        jdbc.update("UPDATE advent_quizzes SET story_0 = ?, story_2 = ? WHERE quiz_day = 2", "Première\n\nDeuxième", "Fin")
        val before = game.clockProjection().date
        assertEquals("locked", game.calendar(member).days!![1].state)
        assertThrows(ResponseStatusException::class.java) { game.quiz(2) }
        assertEquals(listOf("Première\n\nDeuxième", null, "Fin"), game.quiz(2, testFuture = true)!!.stories)
        assertEquals("today", game.calendar(member, testFuture = true).days!![1].state)
        assertEquals("christmas", game.calendar(member, testFuture = true).days!![24].state)
        assertEquals("locked", game.calendar(member).days!![24].state)
        assertEquals("locked", game.calendar(member, preview = true).days!![24].state)
        val generation = game.reconcile(member, 2, operator = true, testFuture = true).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 2, attempt, generation, operator = true, testFuture = true).status)
        val answer = game.confirm(member, 2, 0, attempt, operator = true, testFuture = true)
        assertEquals("recorded", answer.status)
        assertNull(game.result(member, 2))
        assertNull(game.result(other, 2, testFuture = true))
        assertNull(game.result(member, 2, testFuture = true))
        assertEquals("pending", game.calendar(member, testFuture = true).days!![1].outcome)
        assertThrows(ResponseStatusException::class.java) { game.acknowledge(member, 2, answer.replayToken!!, testFuture = true) }
        assertThrows(ResponseStatusException::class.java) { game.history(member, 2, testFuture = true) }
        val previewResult = game.result(member, 2, preview = true)!!
        assertTrue(previewResult.correct)
        assertEquals(listOf("Première\n\nDeuxième", null, "Fin"), previewResult.stories)
        assertEquals(before, game.clockProjection().date)
        assertEquals("available", game.replay(member, 2, answer.replayToken!!, game.session(), testFuture = true).status)
    }
    @Test fun `previously acknowledged future answer remains seen and accessible only after reveal`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 2")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (2, 'Fictif', 'A', 'B', 'C', 0)")
        val answerId = UUID.randomUUID()
        val seenAt = Instant.parse("2026-12-01T12:01:00Z")
        val revealAt = Instant.parse("2026-12-02T23:00:00Z")
        jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at, late) VALUES (?, 2, ?, 0, 0, ?, ?, ?, FALSE)", member, answerId, Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(revealAt), Timestamp.from(seenAt))

        at("2026-12-02T22:59:59Z")
        assertNull(game.result(member, 2, testFuture = true))
        assertNull(game.latestUnseen(member))
        assertThrows(ResponseStatusException::class.java) { game.history(member, 2, testFuture = true) }
        assertEquals("pending", game.calendar(member, testFuture = true).days!![1].outcome)

        at("2026-12-02T23:00:00Z")
        assertNull(game.latestUnseen(member))
        val history = game.history(member, 2).history!!
        assertEquals(answerId.toString(), history.result!!.answerId)
        assertTrue(history.result!!.seen)
        assertTrue(history.result!!.correct)
        assertEquals(seenAt, jdbc.queryForObject("SELECT seen_at FROM advent_member_answers WHERE user_id = ? AND quiz_day = 2", Timestamp::class.java, member)!!.toInstant())
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 2", Int::class.java, member))
    }
    @Test fun `future test access preserves missing content and other members ranking`() {
        val operator = excluded.first()
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day IN (2, 3)")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (2, 'Fictif', 'A', 'B', 'C', 0)")
        val beforeRanking = game.ranking(other, troupe, excluded, operator = true).ranking
        val beforeOther = game.calendar(other).days
        val calendar = game.calendar(operator, testFuture = true).days!!
        assertEquals("missing", calendar[2].state)
        assertEquals("christmas", calendar[24].state)
        assertNull(game.quiz(3, testFuture = true))
        assertEquals("unavailable", game.state(operator, 3, testFuture = true).status)
        assertThrows(ResponseStatusException::class.java) { game.quiz(25, testFuture = true) }
        val generation = game.reconcile(operator, 2, operator = true, testFuture = true).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(operator, 2, attempt, generation, operator = true, testFuture = true)
        game.confirm(operator, 2, 0, attempt, operator = true, testFuture = true)
        assertEquals(beforeOther, game.calendar(other).days)
        assertEquals(beforeRanking, game.ranking(other, troupe, excluded, operator = true).ranking)
        assertNull(game.result(other, 2, testFuture = true))
        assertEquals("played", game.calendar(operator, testFuture = true).days!![1].state)
        assertNull(game.result(operator, 2, testFuture = true))
    }
    @Test fun `future score omits pending today and changes only after reveal`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        for (day in 2..3) {
            jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = ?", day)
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (?, 'Fictif', 'A', 'B', 'C', 0)", day)
        }
        for (day in 1..3) {
            val generation = game.reconcile(member, day, operator = true, testFuture = true).generation!!
            val attempt = UUID.randomUUID()
            assertEquals("available", game.reserve(member, day, attempt, generation, operator = true, testFuture = true).status)
            assertEquals("recorded", game.confirm(member, day, 0, attempt, operator = true, testFuture = true).status)
        }
        assertNull(game.result(member, 3, testFuture = true))
        assertNull(game.result(member, 1, testFuture = true))
        val dayTwo = LocalDate.of(2026, 12, 2)
        assertNull(game.result(member, 2, simulated = dayTwo, testFuture = true))
        val revealedDayOne = game.result(member, 1, simulated = dayTwo)!!
        game.acknowledge(member, 1, UUID.fromString(revealedDayOne.answerId), simulated = dayTwo)
        assertEquals("pending", game.calendar(member, simulated = dayTwo, testFuture = true).days!![1].outcome)
        assertNull(game.result(member, 3, simulated = dayTwo, testFuture = true))
        val dayThree = LocalDate.of(2026, 12, 3)
        assertNull(game.result(member, 3, simulated = dayThree, testFuture = true))
        val revealed = game.result(member, 3, simulated = LocalDate.of(2026, 12, 4), testFuture = true)!!
        assertEquals(35, revealed.totalPoints)
        assertEquals(2, revealed.bonusPoints)
    }
    @Test fun `opening replay clears only the ordinary day for the current member`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        game.confirm(member, 1, 0, reserve())
        game.dismiss(member)
        game.dismiss(other)
        val otherGeneration = game.reconcile(other, 1).generation!!
        val otherAttempt = UUID.randomUUID()
        game.reserve(other, 1, otherAttempt, otherGeneration)
        game.confirm(other, 1, 1, otherAttempt)
        val preparation = game.prepareOpeningReplay(session)
        assertEquals(LocalDate.of(2026, 12, 1), preparation.date)
        assertTrue(preparation.eligible)
        assertThrows(ResponseStatusException::class.java) { game.replayOpening(member, session, preparation.date.plusDays(1)) }
        assertThrows(ResponseStatusException::class.java) { game.replayOpening(member, UUID.randomUUID(), preparation.date) }
        assertFalse(game.entry(member).autoOpen)
        game.replayOpening(member, session, preparation.date)
        assertTrue(game.entry(member).autoOpen)
        assertFalse(game.entry(other).autoOpen)
        assertEquals("recorded", game.state(other, 1).status)
        game.replayOpening(member, session, preparation.date)
        assertTrue(game.entry(member).autoOpen)
        `when`(clock.isolatedControlsAllowed()).thenReturn(false)
        assertThrows(ResponseStatusException::class.java) { game.replayOpening(member, session, preparation.date) }
    }

    @Test fun `opening replay invalidates a reserved attempt`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val attempt = reserve()
        game.replayOpening(member, session, LocalDate.of(2026, 12, 1))
        assertEquals("stale", game.confirm(member, 1, 0, attempt).status)
        assertEquals("available", game.state(member, 1).status)
    }
    @Test fun `opening replay preserves earlier unseen results and discovery`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val discovery = game.discovery(member, session).attemptId!!
        game.discover(member, discovery, session)
        game.confirm(member, 1, 0, reserve())
        at("2026-12-02T12:00:00Z")
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 2")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (2, 'Fictif', 'A', 'B', 'C', 0)")
        val unseen = game.latestUnseen(member)!!
        game.replayOpening(member, session, LocalDate.of(2026, 12, 2))
        assertEquals(unseen.answerId, game.latestUnseen(member)!!.answerId)
        assertTrue(game.discovery(member, session).discovered)
        assertTrue(game.entry(member).autoOpen)
    }
    @Test fun `opening replay rejects missing content and dates outside the quiz period`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 1")
        assertEquals("missing-quiz", game.prepareOpeningReplay(session).reason)
        assertThrows(ResponseStatusException::class.java) { game.replayOpening(member, session, LocalDate.of(2026, 12, 1)) }
        at("2026-11-01T12:00:00Z")
        assertEquals("outside-period", game.prepareOpeningReplay(session).reason)
        assertThrows(ResponseStatusException::class.java) { game.replayOpening(member, session, LocalDate.of(2026, 11, 1)) }
    }
    @Test fun `clock projection samples Paris midnight coherently in real and simulated modes`() {
        at("2026-12-24T22:59:59Z")
        val before = game.clockProjection()
        assertEquals(LocalDate.of(2026, 12, 24), before.date)
        assertEquals(Instant.parse("2026-12-24T22:59:59Z"), before.effectiveInstant)
        assertEquals(Instant.parse("2026-12-24T23:00:00Z"), before.nextMidnight)
        assertFalse(before.simulated)
        at("2026-12-24T23:00:00Z")
        val after = game.clockProjection()
        assertEquals(LocalDate.of(2026, 12, 25), after.date)
        assertEquals(Instant.parse("2026-12-25T23:00:00Z"), after.nextMidnight)
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val simulated = game.clockProjection(session, LocalDate.of(2026, 12, 2))
        assertEquals(Instant.parse("2026-12-01T23:00:00Z"), simulated.effectiveInstant)
        assertEquals(Instant.parse("2026-12-02T23:00:00Z"), simulated.nextMidnight)
        assertTrue(simulated.simulated)
        `when`(clock.isolatedControlsAllowed()).thenReturn(false)
        assertThrows(ResponseStatusException::class.java) { game.clockProjection(session, LocalDate.of(2026, 12, 2)) }
    }
    private fun reserve(day: Int = 1): UUID {
        val generation = game.reconcile(member, day).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, day, attempt, generation).status)
        return attempt
    }
    @Test fun `concurrent welcomes remain idempotent and ordinary requests preserve priority`() {
        val session = game.session()
        val first = game.discovery(member, session)
        val second = game.discovery(member, session)
        assertFalse(first.discovered); assertFalse(second.discovered)
        assertNotEquals(first.attemptId, second.attemptId)
        assertFalse(game.discovery(other, session).discovered)
        assertNull(game.discover(other, first.attemptId!!, session))
        game.confirm(member, 1, 0, reserve())
        at("2026-12-01T23:00:00Z")
        val answer = game.latestUnseen(member)!!
        val tx = TransactionTemplate(txManager)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val calls = listOf(first.attemptId!!, second.attemptId!!).map { attempt ->
                pool.submit(Callable { tx.execute { game.discover(member, attempt, session) }!! })
            }
            calls.forEach { assertNotNull(it.get(10, TimeUnit.SECONDS).days) }
        } finally { pool.shutdownNow() }
        assertTrue(game.discovery(member, session).discovered)
        assertNotNull(game.discover(member, first.attemptId!!, session)!!.days)
        assertNotNull(game.discover(member, second.attemptId!!, session)!!.days)
        assertEquals(answer.answerId, game.discover(member, UUID.randomUUID(), session)!!.priorityResult!!.answerId)
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_discoveries WHERE user_id = ?", Int::class.java, member))
        assertEquals(answer.answerId, game.latestUnseen(member)!!.answerId)
        assertEquals(answer.answerId, game.calendar(member).priorityResult!!.answerId)
    }
    @Test fun `welcome attempts expire after 24 hours and are cleaned up`() {
        val session = game.session()
        val first = game.discovery(member, session).attemptId!!
        val second = game.discovery(member, session).attemptId!!
        val expiredOther = game.discovery(other, session).attemptId!!
        game.confirm(member, 1, 0, reserve())
        at("2026-12-02T11:59:59Z")
        assertNotNull(game.discover(member, first, session)!!.days)
        assertNotNull(game.discover(member, second, session)!!.days)
        assertNotNull(game.discover(member, first, session)!!.days)
        at("2026-12-02T12:00:00Z")
        assertNotNull(game.discover(member, first, session)!!.priorityResult)
        assertNull(game.discover(other, expiredOther, session))
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_discovery_attempts WHERE user_id IN (?, ?)", Int::class.java, member, other))
        val fresh = game.discovery(other, session).attemptId!!
        assertNotNull(game.discover(other, fresh, session)!!.days)
    }
    @Test fun `attempt lifetime follows real clock not simulated date`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val attempt = game.discovery(member, session, LocalDate.of(2026, 12, 5)).attemptId!!
        assertNotNull(game.discover(member, attempt, session, LocalDate.of(2026, 12, 10))!!.days)
    }
    @Test fun `entry and dismissal are shared per member and Paris day`() {
        assertTrue(game.entry(member).autoOpen)
        game.dismiss(member)
        game.dismiss(member)
        assertFalse(game.entry(member).autoOpen)
        assertTrue(game.entry(other).autoOpen)
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_dismissals WHERE user_id = ?", Int::class.java, member))
        at("2026-12-01T23:00:00Z")
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 2")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (2, 'Fictif', 'A', 'B', 'C', 0)")
        assertTrue(game.entry(member).autoOpen)
    }

    @Test fun `absent quiz does not consume entry and an answer prevents opening`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 1")
        assertFalse(game.entry(member).autoOpen)
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_dismissals WHERE user_id = ?", Int::class.java, member))
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (1, 'Fictif', 'A', 'B', 'C', 0)")
        assertTrue(game.entry(member).autoOpen)
        game.confirm(member, 1, 0, reserve())
        assertFalse(game.entry(member).autoOpen)
        at("2026-11-30T22:59:59Z")
        assertThrows(ResponseStatusException::class.java) { game.entry(member) }
        at("2027-01-15T23:00:00Z")
        assertThrows(ResponseStatusException::class.java) { game.entry(member) }
    }

    @Test fun `calendar and history respect Paris dates personal answers and priority revelation`() {
        val attempt = reserve()
        game.confirm(member, 1, 0, attempt)
        val pending = game.calendar(member).days!!
        assertEquals(25, pending.size)
        assertEquals("played", pending[0].state)
        assertEquals("pending", pending[0].outcome)
        assertNull(game.calendar(other).days!![0].outcome)
        assertEquals("locked", pending[1].state)
        assertEquals("today", game.calendar(other).days!![0].state)
        assertEquals(404, assertThrows(ResponseStatusException::class.java) { game.history(member, 1) }.statusCode.value())
        at("2026-12-01T23:00:00Z")
        val priority = game.calendar(member).priorityResult!!
        assertEquals(priority.answerId, game.history(member, 1).priorityResult!!.answerId)
        game.acknowledge(member, 1, UUID.fromString(priority.answerId))
        assertEquals("played", game.calendar(member).days!![0].state)
        assertEquals(if (priority.correct) "correct" else "incorrect", game.calendar(member).days!![0].outcome)
        assertEquals("past-unplayed", game.calendar(other).days!![0].state)
        assertNull(game.history(other, 1).history!!.falseChoice)
        assertNull(game.history(other, 1).history!!.result)
        assertEquals(priority.answerId, game.history(member, 1).history!!.result!!.answerId)
        assertEquals("available", game.state(other, 1).status)
        at("2027-01-15T22:59:59Z")
        assertEquals("christmas", game.calendar(other).days!![24].state)
        at("2027-01-15T23:00:00Z")
        assertThrows(ResponseStatusException::class.java) { game.calendar(other) }
    }

    @Test fun `calendar rolls revealed results back to neutral at the server boundary`() {
        val attempt = reserve()
        game.confirm(member, 1, 1, attempt)
        at("2026-12-01T22:59:59Z")
        assertEquals("pending", game.calendar(member).days!![0].outcome)
        at("2026-12-01T23:00:00Z")
        val priority = game.calendar(member).priorityResult!!
        assertFalse(priority.correct)
        game.acknowledge(member, 1, UUID.fromString(priority.answerId))
        assertEquals("incorrect", game.calendar(member).days!![0].outcome)
        assertNull(game.calendar(other).days!![0].outcome)
        at("2026-12-01T22:59:59Z")
        assertEquals("pending", game.calendar(member).days!![0].outcome)
    }

    @Test fun `out of order preview recalculates only the owners provisional streak bonus`() {
        at("2026-12-01T12:00:00Z")
        for (day in 2..3) {
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT ?, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = ?)", day, day)
            jdbc.update("UPDATE advent_quizzes SET false_choice = 0 WHERE quiz_day = ?", day)
        }
        val owner = excluded.first()
        val before = game.ranking(other, troupe, excluded).ranking!!
        fun answer(day: Int) {
            val generation = game.reconcile(owner, day, preview = true).generation!!
            val attempt = UUID.randomUUID()
            assertEquals("available", game.reserve(owner, day, attempt, generation, preview = true).status)
            assertEquals("recorded", game.confirm(owner, day, 0, attempt, preview = true).status)
        }
        answer(3)
        assertEquals(0, game.result(owner, 3, preview = true)!!.bonusPoints)
        answer(2); answer(1)
        assertEquals(2, game.result(owner, 3, preview = true)!!.bonusPoints)
        assertNull(game.result(other, 3, preview = true))
        val after = game.ranking(other, troupe, excluded).ranking!!
        assertEquals(before.score, after.score)
        assertEquals(before.rank, after.rank)
    }

    @Test fun `explicit late answer persists without affecting ranking participation or streak`() {
        val stories = listOf("Premier\n\nÉté", null, "Troisième")
        jdbc.update("UPDATE advent_quizzes SET story_0 = ?, story_2 = ? WHERE quiz_day = 1", stories[0], stories[2])
        at("2026-12-02T12:00:00Z")
        assertEquals("closed", game.reconcile(member, 1).status)
        assertNull(game.history(member, 1).history!!.falseChoice)
        val generation = game.reconcile(member, 1, lateAccess = true).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 1, attempt, generation).status)
        val answer = game.confirm(member, 1, 1, attempt)
        assertEquals("recorded", answer.status)
        assertTrue(answer.late)
        assertTrue(game.confirm(member, 1, 0, attempt).late)
        val result = game.result(member, 1)!!
        assertTrue(result.late)
        assertEquals(stories, result.stories)
        assertEquals(stories, game.history(member, 1).history!!.result!!.stories)
        assertEquals("incorrect", game.calendar(member).days!![0].outcome)
        assertFalse(result.correct)
        assertEquals(0, result.responsePoints + result.participationPoints + result.bonusPoints)
        assertNull(game.latestUnseen(member))
        assertNull(game.result(other, 1))
        for (day in 2..4) {
            jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT ?, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = ?)", day, day)
            jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at) VALUES (?, ?, ?, 0, 0, ?, ?, ?)", member, day, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-02T00:00:00Z")), Timestamp.from(Instant.parse("2026-12-02T00:00:00Z")))
        }
        at("2026-12-05T12:00:00Z")
        assertEquals(35, game.ranking(member, troupe, excluded).ranking!!.score)
        assertEquals(2, game.result(member, 4)!!.bonusPoints)
        assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.score)
        assertEquals(result.answerId, game.history(member, 1).history!!.result!!.answerId)
    }

    @Test fun `simultaneous late confirmation records only one answer`() {
        at("2026-12-02T12:00:00Z")
        val generation = game.reconcile(member, 1, lateAccess = true).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(member, 1, attempt, generation)
        val start = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val reads = (0..1).map { choice -> pool.submit(Callable { start.await(); game.confirm(member, 1, choice, attempt) }) }
            start.countDown()
            assertTrue(reads.all { it.get(10, TimeUnit.SECONDS).late })
            assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = 1", Int::class.java, member))
        } finally { pool.shutdownNow() }
    }

    @Test fun `operator replay cannot turn a late answer into scored participation`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        at("2026-12-02T12:00:00Z")
        val session = game.session()
        val generation = game.reconcile(member, 1, true, session, lateAccess = true).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(member, 1, attempt, generation, true, session)
        val recorded = game.confirm(member, 1, 0, attempt, true, session)
        assertEquals("available", game.replay(member, 1, recorded.replayToken!!, session).status)
        assertEquals("closed", game.reconcile(member, 1, true, session).status)
        val lateGeneration = game.reconcile(member, 1, true, session, lateAccess = true).generation!!
        val replayAttempt = UUID.randomUUID()
        game.reserve(member, 1, replayAttempt, lateGeneration, true, session)
        assertTrue(game.confirm(member, 1, 0, replayAttempt, true, session).late)
        assertEquals(0, game.ranking(member, troupe, excluded, true, session).ranking!!.score)
    }

    @Test fun `late replay on its simulated day remains unscored and hidden until reveal`() {
        val stories = listOf("Premier\n\nÉté", null, "Troisième")
        jdbc.update("UPDATE advent_quizzes SET story_0 = ?, story_2 = ? WHERE quiz_day = 1", stories[0], stories[2])
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        at("2026-12-02T12:00:00Z")
        val session = game.session()
        val later = LocalDate.of(2026, 12, 2)
        val today = LocalDate.of(2026, 12, 1)
        val generation = game.reconcile(member, 1, true, session, later, true).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(member, 1, attempt, generation, true, session, later)
        val recorded = game.confirm(member, 1, 0, attempt, true, session, later)
        assertEquals("available", game.replay(member, 1, recorded.replayToken!!, session, today).status)
        val replayState = game.reconcile(member, 1, true, session, today)
        assertTrue(replayState.late)
        val replayGeneration = replayState.generation!!
        val replayAttempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 1, replayAttempt, replayGeneration, true, session, today).status)
        assertTrue(game.confirm(member, 1, 0, replayAttempt, true, session, today).late)
        assertNull(game.result(member, 1, session, today))
        assertEquals(0, game.ranking(member, troupe, excluded, true, session, today).ranking!!.score)
        assertTrue(game.result(member, 1, session, later)!!.late)
        val priority = game.latestUnseen(member, session, later)!!
        assertEquals(1, priority.day)
        assertEquals(stories, priority.stories)
    }

    @Test fun `late reservations are fenced by generation and simulation date`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val lateDay = LocalDate.of(2026, 12, 2)
        val first = game.reconcile(member, 1, true, session, lateDay, true).generation!!
        val second = game.reconcile(member, 1, true, session, lateDay, true).generation!!
        assertEquals("stale", game.reserve(member, 1, UUID.randomUUID(), first, true, session, lateDay).status)
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 1, attempt, second, true, session, lateDay).status)
        assertEquals("closed", game.confirm(member, 1, 0, attempt, true, session, LocalDate.of(2026, 12, 1)).status)
        assertTrue(game.confirm(member, 1, 0, attempt, true, session, lateDay).late)
        assertNull(game.result(member, 1, session, LocalDate.of(2026, 12, 1)))
    }

    @Test fun `closing today restores normal play and rejects stale sessions`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val recorded = game.confirm(member, 1, 0, reserve(), true, session)
        assertEquals("cleared", game.replay(member, 1, recorded.replayToken!!, session, closeOnly = true).status)
        assertEquals("available", game.reconcile(member, 1, true, session).status)
        game.reset(session)
        assertThrows(ResponseStatusException::class.java) { game.replay(member, 1, recorded.replayToken!!, session, closeOnly = true) }
    }

    @Test fun `closing an operator case clears only own answer and never grants scored replay`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val attempt = reserve()
        val recorded = game.confirm(member, 1, 0, attempt, true, session)
        val otherGen = game.reconcile(other, 1).generation!!
        val otherAttempt = UUID.randomUUID()
        game.reserve(other, 1, otherAttempt, otherGen)
        game.confirm(other, 1, 0, otherAttempt)
        at("2026-12-02T12:00:00Z")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
        val nextGen = game.reconcile(member, 2, true, session).generation!!
        val nextAttempt = UUID.randomUUID()
        game.reserve(member, 2, nextAttempt, nextGen, true, session)
        game.confirm(member, 2, 0, nextAttempt, true, session)
        val reveal = game.latestUnseen(member)!!
        assertEquals("priority", game.replay(member, 1, recorded.replayToken!!, session, closeOnly = true).status)
        assertNotNull(game.result(member, 1))
        game.acknowledge(member, 1, UUID.fromString(reveal.answerId), session)
        assertEquals("stale", game.replay(member, 1, UUID.randomUUID(), session, closeOnly = true).status)
        assertEquals("cleared", game.replay(member, 1, recorded.replayToken!!, session, closeOnly = true).status)
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_replays WHERE user_id = ? AND quiz_day = 1", Int::class.java, member))
        assertNull(game.result(member, 1, session))
        assertEquals("recorded", game.state(member, 2, true, session).status)
        assertNotNull(game.result(other, 1, session))
        assertEquals("closed", game.reconcile(member, 1, true, session).status)
        val lateGen = game.reconcile(member, 1, true, session, lateAccess = true).generation!!
        val lateAttempt = UUID.randomUUID()
        game.reserve(member, 1, lateAttempt, lateGen, true, session)
        assertTrue(game.confirm(member, 1, 0, lateAttempt, true, session).late)
        assertEquals(0, game.result(member, 1, session)!!.participationPoints)
    }

    @Test fun `quiz published during its Paris day becomes normally playable until midnight`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 17")
        at("2026-12-17T12:00:00Z")
        assertEquals("missing", game.calendar(member).days!![16].state)
        assertNull(game.quiz(17))
        assertEquals("unavailable", game.state(member, 17).status)
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (17, 'Fictif', 'A', 'B', 'C', 0)")
        at("2026-12-17T22:59:59Z")
        assertEquals("today", game.calendar(member).days!![16].state)
        val generation = game.reconcile(member, 17).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 17, attempt, generation).status)
        val recorded = game.confirm(member, 17, 0, attempt)
        assertEquals("recorded", recorded.status)
        assertFalse(recorded.late)
        assertNull(game.result(member, 17))
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        at("2026-12-17T23:00:00Z")
        val result = game.result(member, 17)!!
        assertEquals(10, result.responsePoints)
        assertEquals(1, result.participationPoints)
        assertFalse(result.late)
    }

    @Test fun `quiz published after its Paris day becomes explicit zero point late discovery`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 18")
        at("2026-12-19T12:00:00Z")
        assertEquals("missing", game.calendar(member).days!![17].state)
        assertNull(game.history(member, 18).history)
        assertEquals("unavailable", game.state(member, 18).status)
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (18, 'Fictif', 'A', 'B', 'C', 0)")
        assertEquals("past-unplayed", game.calendar(member).days!![17].state)
        assertNull(game.history(member, 18).history!!.falseChoice)
        assertEquals("closed", game.reconcile(member, 18).status)
        val generation = game.reconcile(member, 18, lateAccess = true).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 18, attempt, generation).status)
        assertTrue(game.confirm(member, 18, 0, attempt).late)
        val result = game.result(member, 18)!!
        assertTrue(result.correct)
        assertTrue(result.late)
        assertEquals(0, result.responsePoints + result.participationPoints + result.bonusPoints)
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        assertNull(game.result(other, 18))
        assertEquals(result.answerId, game.history(member, 18).history!!.result!!.answerId)
    }

    @Test fun `zero answer member sees Christmas and final ranking through Paris January 15`() {
        for (instant in listOf("2026-12-25T00:00:00Z", "2027-01-15T22:59:59Z")) {
            at(instant)
            assertEquals("christmas", game.calendar(other).days!![24].state)
            assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.score)
            assertNull(game.latestUnseen(other))
        }
        at("2027-01-15T23:00:00Z")
        assertEquals(404, assertThrows(ResponseStatusException::class.java) { game.calendar(other) }.statusCode.value())
        assertEquals(404, assertThrows(ResponseStatusException::class.java) { game.ranking(other, troupe, excluded) }.statusCode.value())
    }

    @Test fun `offline game reads the prepared catalogue instead of a demo replacement`() {
        `when`(clock.isOfflineDatabase()).thenReturn(true)
        jdbc.update("DELETE FROM advent_member_demo_quizzes WHERE quiz_day = 1")
        jdbc.update("INSERT INTO advent_member_demo_quizzes VALUES (1, 'Ancien fictif', 'X', 'Y', 'Z', 2)")
        val offline = AdventMemberGame(jdbc, clock, testGame, MockEnvironment().apply { setActiveProfiles("offline") })
        assertEquals("Personnage fictif", offline.quiz(1)!!.name)
        assertEquals(listOf("A", "B", "C"), offline.quiz(1)!!.statements)
    }
    @Test fun `ambiguous historical content blocks offline quiz and ranking`() {
        `when`(clock.isOfflineDatabase()).thenReturn(true)
        val offline = AdventMemberGame(jdbc, clock, testGame, MockEnvironment().apply { setActiveProfiles("offline") })
        jdbc.update("INSERT INTO advent_offline_content_conflicts (quiz_day) VALUES (1)")
        try {
            assertEquals(423, assertThrows(ResponseStatusException::class.java) { offline.quiz(1) }.statusCode.value())
            assertEquals(423, assertThrows(ResponseStatusException::class.java) { offline.ranking(member, troupe, excluded) }.statusCode.value())
        } finally { jdbc.update("DELETE FROM advent_offline_content_conflicts WHERE quiz_day = 1") }
    }
    @Test fun `reservation retries are idempotent only for the same account and day`() {
        val generation = game.reconcile(member, 1).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 1, attempt, generation).status)
        assertEquals("available", game.reserve(member, 1, attempt, generation).status)
        val otherGeneration = game.reconcile(other, 1).generation!!
        assertEquals("stale", game.reserve(other, 1, attempt, otherGeneration).status)
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
        at("2026-12-02T12:00:00Z")
        val dayTwoGeneration = game.reconcile(member, 2).generation!!
        assertEquals("stale", game.reserve(member, 2, attempt, dayTwoGeneration).status)
    }
    @Test fun `unseen selection skips ambiguous days without including their scores`() {
        `when`(clock.isOfflineDatabase()).thenReturn(true)
        at("2026-12-03T12:00:00Z")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
        for (day in 1..2) jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at) VALUES (?, ?, ?, 0, 0, ?, ?)", member, day, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-02T00:00:00Z")))
        jdbc.update("INSERT INTO advent_offline_content_conflicts (quiz_day) VALUES (2)")
        val offline = AdventMemberGame(jdbc, clock, testGame, MockEnvironment().apply { setActiveProfiles("offline") })
        try {
            val result = offline.latestUnseen(member)!!
            assertEquals(1, result.day)
            assertEquals(11, result.totalPoints)
            assertEquals(423, assertThrows(ResponseStatusException::class.java) { offline.ranking(member, troupe, excluded) }.statusCode.value())
            assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ?", Int::class.java, member))
        } finally { jdbc.update("DELETE FROM advent_offline_content_conflicts WHERE quiz_day = 2") }
    }
    @Test fun `pending answer is durable and reveals no points in ranking`() {
        val attempt = reserve()
        assertEquals("recorded", game.confirm(member, 1, 0, attempt).status)
        assertEquals("recorded", game.confirm(member, 1, 1, UUID.randomUUID()).status)
        assertNull(game.result(member, 1))
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.score)
        assertThrows(ResponseStatusException::class.java) { game.quiz(2) }
        at("2026-12-01T23:00:00Z")
        val reveal = game.latestUnseen(member)!!
        assertTrue(reveal.correct)
        assertEquals(11, reveal.responsePoints + reveal.participationPoints + reveal.bonusPoints)
        assertNotNull(game.ranking(member, troupe, excluded).priorityResult)
        game.acknowledge(member, 1, UUID.fromString(reveal.answerId))
        assertEquals(11, game.ranking(member, troupe, excluded).ranking!!.score)
        assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.score)
        assertNull(game.result(other, 1))
    }
    @Test fun `reconciliation invalidates delayed attempt and test reset preserves member answer`() {
        val stale = reserve()
        val next = game.reconcile(member, 1).generation!!
        assertEquals("stale", game.confirm(member, 1, 0, stale).status)
        val valid = UUID.randomUUID()
        assertEquals("available", game.reserve(member, 1, valid, next).status)
        assertEquals("recorded", game.confirm(member, 1, 0, valid).status)
        val session = testGame.session()
        testGame.reset(session)
        assertEquals("recorded", game.state(member, 1).status)
    }
    @Test fun `last answer becomes final at Paris midnight on Christmas`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 24")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (24, 'Fictif', 'A', 'B', 'C', 0)")
        at("2026-12-24T22:59:59Z")
        val attempt = reserve(24)
        assertEquals("recorded", game.confirm(member, 24, 0, attempt).status)
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        at("2026-12-24T23:00:00Z")
        val reveal = game.latestUnseen(member)!!
        game.acknowledge(member, 24, UUID.fromString(reveal.answerId))
        assertEquals(11, game.ranking(member, troupe, excluded).ranking!!.score)
        at("2027-01-15T22:59:59Z")
        assertEquals(11, game.ranking(member, troupe, excluded).ranking!!.score)
    }
    @Test fun `real date access limits and closed past answer`() {
        at("2026-11-30T22:59:59Z")
        assertThrows(ResponseStatusException::class.java) { game.today() }
        at("2026-12-01T23:00:00Z")
        assertEquals("stale", game.confirm(member, 1, 0, UUID.randomUUID()).status)
        at("2027-01-15T22:59:59Z")
        assertEquals("2027-01-15", game.today().toString())
        at("2027-01-15T23:00:00Z")
        assertThrows(ResponseStatusException::class.java) { game.today() }
    }
    @Test fun `operator simulation stays local while answers and reset remain shared`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        val session = game.session()
        val generation = game.reconcile(member, 1, true, session).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(member, 1, attempt, generation, true, session)
        val recorded = game.confirm(member, 1, 0, attempt, true, session)
        assertNotNull(recorded.replayToken)
        assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.entries.first { it.mine }.score)
        assertEquals(11, game.ranking(member, troupe, excluded, true, session).ranking!!.score)
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        val simulated = LocalDate.of(2026, 12, 2)
        assertEquals("2026-12-02", game.today(session, simulated).toString())
        assertEquals("2026-12-01", game.today().toString())
        val reveal = game.latestUnseen(member, session, simulated)!!
        game.acknowledge(member, 1, UUID.fromString(reveal.answerId), session, simulated)
        assertEquals(Instant.parse("2026-12-01T12:00:00Z"), jdbc.queryForObject("SELECT seen_at FROM advent_member_answers WHERE user_id = ? AND quiz_day = 1", Timestamp::class.java, member)!!.toInstant())
        assertEquals(0, game.ranking(member, troupe, excluded).ranking!!.score)
        assertEquals(11, game.ranking(member, troupe, excluded, true, session, simulated).ranking!!.score)
        at("2026-12-02T12:00:00Z")
        assertEquals(11, game.ranking(member, troupe, excluded).ranking!!.score)
        at("2026-12-01T12:00:00Z")
        assertEquals("available", game.replay(member, 1, recorded.replayToken!!, session, simulated).status)
        assertEquals("2026-12-01", game.today().toString())
        assertEquals("available", game.state(member, 1, true, session, simulated).status)
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at) VALUES (?, 1, 0, 0, 10, 1, 0, ?, ?)", member, Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")))
        jdbc.update("INSERT INTO advent_offline_content_conflicts (quiz_day) VALUES (1)")
        game.reset(session)
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM advent_offline_content_conflicts", Int::class.java))
        assertEquals(1, jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ?", Int::class.java, member))
        assertThrows(ResponseStatusException::class.java) { game.today(session) }
        assertEquals("available", game.state(member, 1).status)
    }
    @Test fun `simulated date is not persisted as answer timestamp`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(true)
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) SELECT 2, 'Fictif', 'A', 'B', 'C', 0 WHERE NOT EXISTS (SELECT 1 FROM advent_quizzes WHERE quiz_day = 2)")
        val session = game.session()
        val simulated = LocalDate.of(2026, 12, 2)
        val generation = game.reconcile(member, 2, true, session, simulated).generation!!
        val attempt = UUID.randomUUID()
        game.reserve(member, 2, attempt, generation, true, session, simulated)
        assertEquals("recorded", game.confirm(member, 2, 0, attempt, true, session, simulated).status)
        assertEquals(Instant.parse("2026-12-01T12:00:00Z"), jdbc.queryForObject("SELECT answered_at FROM advent_member_answers WHERE user_id = ? AND quiz_day = 2", Timestamp::class.java, member)!!.toInstant())
        assertEquals("2026-12-01", game.today(session).toString())
    }
    @Test fun `production rejects a simulated date and ignores persisted development clock offset`() {
        `when`(clock.isolatedControlsAllowed()).thenReturn(false)
        jdbc.update("UPDATE advent_member_lock SET test_offset_seconds = 86400 WHERE id = 1")
        try {
            assertEquals("2026-12-01", game.today().toString())
            assertThrows(ResponseStatusException::class.java) { game.today(null, LocalDate.of(2026, 12, 2)) }
        }
        finally { jdbc.update("UPDATE advent_member_lock SET test_offset_seconds = 0 WHERE id = 1") }
    }
    @Test fun `waiting confirmation samples time after the lock`() {
        val attempt = reserve()
        val held = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult {
                    jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
                    held.countDown(); check(release.await(10, TimeUnit.SECONDS))
                }
            }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val confirmation = pool.submit(Callable { game.confirm(member, 1, 0, attempt) })
            assertThrows(TimeoutException::class.java) { confirmation.get(100, TimeUnit.MILLISECONDS) }
            at("2026-12-01T23:00:00Z")
            release.countDown(); writer.get(10, TimeUnit.SECONDS)
            assertEquals("closed", confirmation.get(10, TimeUnit.SECONDS).status)
        } finally { release.countDown(); pool.shutdownNow() }
    }
    @Test fun `member read waits for transaction and ignores rollback`() {
        val held = CountDownLatch(1)
        val release = CountDownLatch(1)
        val pool = Executors.newFixedThreadPool(2)
        try {
            val writer = pool.submit {
                TransactionTemplate(txManager).executeWithoutResult { status ->
                    jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
                    jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at) VALUES (?, 1, ?, 0, 0, ?, ?)", member, UUID.randomUUID(), Timestamp.from(Instant.parse("2026-12-01T12:00:00Z")), Timestamp.from(Instant.parse("2026-12-01T23:00:00Z")))
                    held.countDown(); check(release.await(10, TimeUnit.SECONDS)); status.setRollbackOnly()
                }
            }
            assertTrue(held.await(10, TimeUnit.SECONDS))
            val read = pool.submit(Callable { game.ranking(member, troupe, excluded) })
            assertThrows(TimeoutException::class.java) { read.get(100, TimeUnit.MILLISECONDS) }
            release.countDown(); writer.get(10, TimeUnit.SECONDS)
            assertEquals(0, read.get(10, TimeUnit.SECONDS).ranking!!.score)
        } finally { release.countDown(); pool.shutdownNow() }
    }
    @Test fun `member and isolated ranking sources use their reference clocks for final ties`() {
        val received = Instant.parse("2026-12-01T12:00:00Z")
        val revealed = Instant.parse("2026-12-01T23:00:00Z")
        for ((id, delta) in listOf(member to 0L, other to 30L)) {
            val stamp = Timestamp.from(received.plusSeconds(delta))
            jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at, late) VALUES (?, 1, ?, 0, 0, ?, ?, ?, FALSE)", id, UUID.randomUUID(), stamp, Timestamp.from(revealed), stamp)
            jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at) VALUES (?, 1, 0, 0, 10, 1, 0, ?, ?)", id, stamp, Timestamp.from(revealed))
        }
        val late = Timestamp.from(Instant.parse("2026-12-04T12:00:00Z"))
        jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at, late) VALUES (?, 2, ?, 0, 0, ?, ?, ?, TRUE)", other, UUID.randomUUID(), late, late, late)
        val before = Instant.parse("2026-12-24T22:59:59Z")
        val after = Instant.parse("2026-12-24T23:00:00Z")
        at(before.toString())
        val memberCurrent = game.ranking(member, troupe, excluded).ranking!!
        val isolatedCurrent = testGame.testRevealableRanking(member, troupe, before, excluded)
        assertEquals(listOf(2, 2), memberCurrent.entries.map { it.rank })
        assertEquals(listOf(2, 2), isolatedCurrent.entries.map { it.rank })
        assertTrue(memberCurrent.entries.all { it.tieReason == null })
        assertTrue(isolatedCurrent.entries.all { it.tieReason == null })
        at(after.toString())
        val memberFinal = game.ranking(member, troupe, excluded).ranking!!
        val isolatedFinal = testGame.testRevealableRanking(member, troupe, after, excluded)
        for (board in listOf(memberFinal, isolatedFinal)) {
            assertEquals(listOf(1, 2), board.entries.map { it.rank })
            assertEquals(listOf(11, 11), board.entries.map { it.score })
            assertTrue(board.entries.first().mine)
            assertEquals(AdventTieReason.ATTAINMENT, board.entries.first().tieReason)
        }
    }
    @Test fun `isolated rankings retain recorded unrevealed scores even at Christmas`() {
        val answered = Timestamp.from(Instant.parse("2026-12-01T12:00:00Z"))
        // Artificial future reveal exercises the exception independently of the ordinary 1-24 calendar.
        val reveal = Timestamp.from(Instant.parse("2027-01-01T00:00:00Z"))
        jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at, seen_at, late) VALUES (?, 1, ?, 0, 0, ?, ?, NULL, FALSE)", member, UUID.randomUUID(), answered, reveal)
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at) VALUES (?, 1, 0, 0, 10, 1, 0, ?, ?)", member, answered, reveal)
        for (instant in listOf(Instant.parse("2026-12-24T22:59:59Z"), Instant.parse("2026-12-24T23:00:00Z"))) {
            at(instant.toString())
            assertEquals(0, game.ranking(other, troupe, excluded).ranking!!.entries.first { it.name == jdbc.queryForObject("SELECT display_name FROM troupe_memberships WHERE troupe_id = ? AND user_id = ?", String::class.java, troupe, member) }.score)
            assertEquals(11, game.ranking(other, troupe, excluded, operator = true).ranking!!.entries.first { it.score == 11 }.score)
            jdbc.update("UPDATE advent_test_clock SET offset_seconds = 0, observed_at = NULL WHERE id = 1")
            assertEquals(11, testGame.testRanking(other, troupe, instant, excluded).entries.first { it.score == 11 }.score)
            assertTrue(testGame.testRevealableRanking(other, troupe, instant, excluded).entries.all { it.score == 0 })
        }
    }
}
