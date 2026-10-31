package com.hatcast.api.advent

import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

/** All member operations serialize on one row; the clock is sampled only after the lock. */
@Service
class AdventMemberGame(private val jdbc: JdbcTemplate, private val clock: AdventMemberClock, private val quizzes: AdventTestAnswers, private val environment: Environment) {
    private val paris = ZoneId.of("Europe/Paris")

    private fun memberQuiz(day: Int): AdventQuiz? {
        if ("offline" in environment.activeProfiles) {
            if (!clock.isOfflineDatabase() || environment.activeProfiles.any { it != "offline" && it != "dev" }) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
            if (jdbc.queryForObject("SELECT COUNT(*) FROM advent_offline_content_conflicts WHERE quiz_day = ?", Int::class.java, day) != 0)
                throw ResponseStatusException(HttpStatus.LOCKED, "Offline content requires reconciliation")
        }
        return quizzes.quiz(day)
    }

    private fun now(expected: UUID? = null, simulated: LocalDate? = null): Instant {
        val session = jdbc.query("SELECT test_session_id FROM advent_member_lock WHERE id = 1 FOR UPDATE") { rs, _ -> rs.getString(1) }.single()
        if (expected != null && session != expected.toString()) throw ResponseStatusException(HttpStatus.CONFLICT)
        val actual = clock.instant()
        if (simulated != null && (!clock.isolatedControlsAllowed() || simulated.isBefore(LocalDate.of(2026, 12, 1)) || simulated.isAfter(LocalDate.of(2027, 1, 15))))
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
        val effective = if (simulated == null) actual else simulated.atTime(actual.atZone(paris).toLocalTime()).atZone(paris).toInstant()
        return effective.also {
            if (!AdventParisTime.memberAccessOpen(it)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        }
    }
    private fun date(now: Instant) = now.atZone(paris).toLocalDate()
    private fun checkDay(day: Int) { if (day !in 1..24) throw ResponseStatusException(HttpStatus.NOT_FOUND) }

    @Transactional
    fun today(expected: UUID? = null, simulated: LocalDate? = null): LocalDate = date(now(expected, simulated))

    @Transactional
    fun quiz(day: Int, expected: UUID? = null, simulated: LocalDate? = null): AdventQuiz? {
        checkDay(day)
        val today = date(now(expected, simulated))
        if (LocalDate.of(2026, 12, day).isAfter(today)) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        return memberQuiz(day)
    }

    @Transactional
    fun state(user: UUID, day: Int, operator: Boolean = false, expected: UUID? = null, simulated: LocalDate? = null): AnswerState {
        checkDay(day)
        return stateFor(user, day, now(expected, simulated), operator)
    }

    private fun stateFor(user: UUID, day: Int, time: Instant, operator: Boolean): AnswerState {
        val state = stateAt(user, day, time)
        if (!operator || state.status != "recorded") return state
        val id = jdbc.query("SELECT answer_id FROM advent_member_answers WHERE user_id = ? AND quiz_day = ?", { rs, _ -> UUID.fromString(rs.getString(1)) }, user, day).single()
        return AnswerState("recorded", replayToken = id)
    }

    private fun stateAt(user: UUID, day: Int, time: Instant): AnswerState {
        val target = LocalDate.of(2026, 12, day)
        if (target.isAfter(date(time))) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        if (memberQuiz(day) == null) return AnswerState("unavailable")
        val exists = jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_answers WHERE user_id = ? AND quiz_day = ?", Int::class.java, user, day) != 0
        val replay = clock.isolatedControlsAllowed() && jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_replays WHERE user_id = ? AND quiz_day = ?", Int::class.java, user, day) == 1
        return AnswerState(if (exists) "recorded" else if (target == date(time) || replay) "available" else "closed")
    }

    @Transactional
    fun reconcile(user: UUID, day: Int, operator: Boolean = false, expected: UUID? = null, simulated: LocalDate? = null): AnswerState {
        checkDay(day)
        val time = now(expected, simulated)
        jdbc.update("UPDATE advent_member_attempts SET cancelled = TRUE WHERE user_id = ? AND quiz_day = ? AND cancelled = FALSE", user, day)
        val state = stateAt(user, day, time)
        if (state.status != "available") return stateFor(user, day, time, operator)
        val generation = UUID.randomUUID()
        if (jdbc.update("UPDATE advent_member_generations SET generation = ? WHERE user_id = ? AND quiz_day = ?", generation, user, day) == 0)
            jdbc.update("INSERT INTO advent_member_generations (user_id, quiz_day, generation) VALUES (?, ?, ?)", user, day, generation)
        return AnswerState("available", generation)
    }

    @Transactional
    fun reserve(user: UUID, day: Int, id: UUID, generation: UUID, operator: Boolean = false, expected: UUID? = null, simulated: LocalDate? = null): AnswerState {
        checkDay(day)
        val time = now(expected, simulated)
        val state = stateAt(user, day, time)
        if (state.status != "available") return stateFor(user, day, time, operator)
        val current = jdbc.query("SELECT generation FROM advent_member_generations WHERE user_id = ? AND quiz_day = ?", { rs, _ -> UUID.fromString(rs.getString(1)) }, user, day).singleOrNull()
        if (current != generation) return AnswerState("stale")
        val prior = jdbc.query("SELECT user_id, quiz_day, cancelled FROM advent_member_attempts WHERE id = ?", { rs, _ -> Triple(UUID.fromString(rs.getString(1)), rs.getInt(2), rs.getBoolean(3)) }, id).singleOrNull()
        if (prior != null) return if (prior.first == user && prior.second == day && !prior.third) state else AnswerState("stale")
        jdbc.update("INSERT INTO advent_member_attempts (id, user_id, quiz_day) VALUES (?, ?, ?)", id, user, day)
        return state
    }

    @Transactional
    fun confirm(user: UUID, day: Int, choice: Int, attempt: UUID, operator: Boolean = false, expected: UUID? = null, simulated: LocalDate? = null): AnswerState {
        checkDay(day)
        if (choice !in 0..2) throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        val time = now(expected, simulated)
        val current = stateAt(user, day, time)
        if (current.status != "available") return stateFor(user, day, time, operator)
        val permitted = jdbc.queryForObject("SELECT COUNT(*) FROM advent_member_attempts WHERE id = ? AND user_id = ? AND quiz_day = ? AND cancelled = FALSE", Int::class.java, attempt, user, day) ?: 0
        if (permitted == 0) return AnswerState("stale")
        jdbc.update("UPDATE advent_member_attempts SET cancelled = TRUE WHERE id = ?", attempt)
        val quiz = memberQuiz(day) ?: return AnswerState("unavailable")
        val reveal = LocalDate.of(2026, 12, day).plusDays(1).atStartOfDay(paris).toInstant()
        jdbc.update("INSERT INTO advent_member_answers (user_id, quiz_day, answer_id, choice, correct_choice, answered_at, reveal_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            user, day, UUID.randomUUID(), choice, quiz.falseChoice, Timestamp.from(clock.instant()), Timestamp.from(reveal))
        jdbc.update("DELETE FROM advent_member_replays WHERE user_id = ? AND quiz_day = ?", user, day)
        return stateFor(user, day, time, operator)
    }

    @Transactional
    fun latestUnseen(user: UUID, expected: UUID? = null, simulated: LocalDate? = null): AdventResult? {
        val time = now(expected, simulated)
        val day = jdbc.query("SELECT quiz_day FROM advent_member_answers WHERE user_id = ? AND seen_at IS NULL AND reveal_at <= ? ORDER BY quiz_day DESC", { rs, _ -> rs.getInt(1) }, user, Timestamp.from(time)).firstOrNull { day ->
            val conflict = "offline" in environment.activeProfiles && jdbc.queryForObject("SELECT COUNT(*) FROM advent_offline_content_conflicts WHERE quiz_day = ?", Int::class.java, day) != 0
            !conflict && memberQuiz(day) != null
        } ?: return null
        return resultAt(user, day, time)
    }

    @Transactional
    fun result(user: UUID, day: Int, expected: UUID? = null, simulated: LocalDate? = null): AdventResult? {
        checkDay(day)
        return resultAt(user, day, now(expected, simulated))
    }

    private fun resultAt(user: UUID, day: Int, time: Instant): AdventResult? {
        val quiz = memberQuiz(day) ?: return null
        val conflictFilter = if ("offline" in environment.activeProfiles) " AND quiz_day NOT IN (SELECT quiz_day FROM advent_offline_content_conflicts)" else ""
        val rows = jdbc.query("SELECT quiz_day, answer_id, choice, correct_choice, seen_at FROM advent_member_answers WHERE user_id = ? AND reveal_at <= ?$conflictFilter ORDER BY quiz_day", { rs, _ ->
            MemberResultRow(rs.getInt(1), rs.getString(2), rs.getInt(3), rs.getInt(4), rs.getTimestamp(5) != null)
        }, user, Timestamp.from(time))
        val row = rows.firstOrNull { it.day == day } ?: return null
        var streak = 0
        var bonus = 0
        var total = 0
        for (r in rows) {
            streak = if (r.choice == r.correctChoice) streak + 1 else 0
            val currentBonus = if (streak > 0 && streak % 3 == 0) 2 else 0
            total += 1 + (if (r.choice == r.correctChoice) 10 else 0) + currentBonus
            if (r.day == day) bonus = currentBonus
        }
        return AdventResult(row.answerId, day, row.choice, row.correctChoice, row.choice == row.correctChoice,
            if (row.choice == row.correctChoice) 10 else 0, 1, bonus, total, row.seen, quiz.explanation)
    }

    @Transactional
    fun acknowledge(user: UUID, day: Int, answerId: UUID, expected: UUID? = null, simulated: LocalDate? = null) {
        checkDay(day)
        val time = now(expected, simulated)
        if (jdbc.update("UPDATE advent_member_answers SET seen_at = COALESCE(seen_at, ?) WHERE user_id = ? AND quiz_day = ? AND answer_id = ? AND reveal_at <= ?", Timestamp.from(clock.instant()), user, day, answerId, Timestamp.from(time)) == 0)
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @Transactional
    fun ranking(user: UUID, troupe: UUID, excludedIds: Set<UUID>, operator: Boolean = false, expected: UUID? = null, simulated: LocalDate? = null): AdventRankingResponse {
        val time = now(expected, simulated)
        if ("offline" in environment.activeProfiles && jdbc.queryForObject("SELECT COUNT(*) FROM advent_offline_content_conflicts", Int::class.java) != 0)
            throw ResponseStatusException(HttpStatus.LOCKED, "Offline content requires reconciliation")
        val unseenDay = jdbc.query("SELECT quiz_day FROM advent_member_answers WHERE user_id = ? AND seen_at IS NULL AND reveal_at <= ? ORDER BY quiz_day DESC", { rs, _ -> rs.getInt(1) }, user, Timestamp.from(time)).firstOrNull { memberQuiz(it) != null }
        if (unseenDay != null) return AdventRankingResponse(priorityResult = resultAt(user, unseenDay, time))
        if (excludedIds.size != 2 || excludedIds.any { id -> jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE id = ?", Int::class.java, id) != 1 }) throw ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE)
        val members = jdbc.query("SELECT m.user_id, m.display_name FROM troupe_memberships m JOIN users u ON u.id = m.user_id WHERE m.troupe_id = ? AND m.status = 'ACTIVE' AND m.baseline_role <> 'EXTERNE'", { rs, _ -> RankingMember(UUID.fromString(rs.getString(1)), rs.getString(2)) }, troupe)
        val answers = jdbc.query("SELECT user_id, quiz_day, choice, correct_choice, reveal_at FROM advent_member_answers", { rs, _ -> RankingAnswer(UUID.fromString(rs.getString(1)), rs.getInt(2), rs.getInt(3) == rs.getInt(4), rs.getTimestamp(5).toInstant()) })
        return AdventRankingResponse(ranking = AdventRankingCalculator.calculate(user, members, answers, if (operator) null else time, excludedIds))
    }
    /** Clock and reset use the same row lock as every member operation. */
    @Transactional
    fun session(): UUID {
        val value = jdbc.query("SELECT test_session_id FROM advent_member_lock WHERE id = 1 FOR UPDATE") { rs, _ -> rs.getString(1) }.single()
        if (value != null) return UUID.fromString(value)
        return UUID.randomUUID().also { jdbc.update("UPDATE advent_member_lock SET test_session_id = ? WHERE id = 1", it) }
    }

    private fun requireSession(expected: UUID) {
        if (session() != expected) throw ResponseStatusException(HttpStatus.CONFLICT)
    }

    @Transactional
    fun reset(expected: UUID) {
        requireSession(expected)
        listOf("advent_member_attempts", "advent_member_generations", "advent_member_replays", "advent_member_answers", "advent_offline_content_conflicts").forEach { jdbc.update("DELETE FROM $it") }
        jdbc.update("UPDATE advent_member_lock SET test_session_id = ? WHERE id = 1", UUID.randomUUID())
    }

    @Transactional
    fun replay(user: UUID, day: Int, token: UUID, expected: UUID, simulated: LocalDate? = null): AnswerState {
        checkDay(day)
        requireSession(expected)
        val time = now(expected, simulated)
        val current = stateFor(user, day, time, true)
        if (current.replayToken != token) return current
        jdbc.update("DELETE FROM advent_member_attempts WHERE user_id = ? AND quiz_day = ?", user, day)
        jdbc.update("DELETE FROM advent_member_generations WHERE user_id = ? AND quiz_day = ?", user, day)
        jdbc.update("DELETE FROM advent_member_answers WHERE user_id = ? AND quiz_day = ? AND answer_id = ?", user, day, token)
        jdbc.update("INSERT INTO advent_member_replays (user_id, quiz_day) VALUES (?, ?)", user, day)
        return AnswerState("available")
    }

}

private data class MemberResultRow(val day: Int, val answerId: String, val choice: Int, val correctChoice: Int, val seen: Boolean)
