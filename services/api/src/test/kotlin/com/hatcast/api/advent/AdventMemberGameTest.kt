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
    private fun reserve(day: Int = 1): UUID {
        val generation = game.reconcile(member, day).generation!!
        val attempt = UUID.randomUUID()
        assertEquals("available", game.reserve(member, day, attempt, generation).status)
        return attempt
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
        assertEquals("closed", game.confirm(member, 1, 0, UUID.randomUUID()).status)
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
}
