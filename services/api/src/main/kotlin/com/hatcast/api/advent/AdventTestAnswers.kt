package com.hatcast.api.advent

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

/** Serialized by the singleton clock row; answers and streak update in the same transaction. */
@Service
class AdventTestAnswers(private val jdbc: JdbcTemplate) {
    private val paris = ZoneId.of("Europe/Paris")
    fun transitionRequired(): Boolean = jdbc.queryForObject("SELECT reset_required FROM advent_content_transition WHERE id = 1", Boolean::class.java) == true
    fun requireContentReady() { if (transitionRequired()) throw ResponseStatusException(HttpStatus.LOCKED) }

    fun quiz(day: Int): AdventQuiz? {
        if (day !in 1..24) return null
        return jdbc.query("SELECT display_name, portrait_ref, statement_0, statement_1, statement_2, false_choice, explanation FROM advent_quizzes WHERE quiz_day = ?", { rs, _ ->
            AdventQuiz(rs.getString(1), rs.getString(2), listOf(rs.getString(3), rs.getString(4), rs.getString(5)), rs.getInt(6), rs.getString(7))
        }, day).singleOrNull()?.takeIf { quiz ->
            quiz.name.isNotBlank() && quiz.statements.all { it.isNotBlank() } && quiz.falseChoice in 0..2 &&
                (quiz.portraitRef == null || quiz.portraitRef.matches(Regex("[A-Za-z0-9_-]+\\.png")))
        }
    }

    /** The clock row is the serialization point for every test-session operation. */
    @Transactional
    fun session(): UUID {
        val current = jdbc.query("SELECT session_id FROM advent_test_clock WHERE id = 1 FOR UPDATE") { rs, _ -> rs.getString(1) }.single()
        if (current != null) return UUID.fromString(current)
        val created = UUID.randomUUID()
        jdbc.update("UPDATE advent_test_clock SET session_id = ? WHERE id = 1", created)
        return created
    }

    @Transactional
    fun requireSession(expected: UUID) {
        if (session() != expected) throw ResponseStatusException(HttpStatus.CONFLICT, "Test session changed")
    }

    @Transactional
    fun reset(expected: UUID) {
        requireSession(expected)
        // These are exclusively the isolated test-game tables, not fixtures or real data.
        listOf("advent_test_attempts", "advent_test_generations", "advent_test_replays",
            "advent_test_answers", "advent_test_member_state", "advent_test_clock_advances")
            .forEach { jdbc.update("DELETE FROM $it") }
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = NULL, observed_at = NULL, session_id = ? WHERE id = 1", UUID.randomUUID())
        jdbc.update("UPDATE advent_content_transition SET reset_required = FALSE WHERE id = 1")
    }

    @Transactional
    fun state(user: UUID, day: Int, receipt: Instant): AnswerState {
        validateDay(day)
        val now = simulatedInstant(receipt)
        return stateAt(user, day, now)
    }

    @Transactional
    fun reserve(user: UUID, day: Int, id: UUID, generation: UUID, receipt: Instant): AnswerState {
        validateDay(day)
        val now = simulatedInstant(receipt)
        val state = stateAt(user, day, now)
        if (state.status != "available") return state
        val current = jdbc.query("SELECT generation FROM advent_test_generations WHERE user_id = ? AND quiz_day = ?", { rs, _ -> UUID.fromString(rs.getString(1)) }, user, day).singleOrNull()
        if (current != generation) return AnswerState("stale")
        jdbc.update("INSERT INTO advent_test_attempts (id, user_id, quiz_day) VALUES (?, ?, ?)", id, user, day)
        return state
    }

    @Transactional
    fun reconcile(user: UUID, day: Int, receipt: Instant): AnswerState {
        validateDay(day)
        val now = simulatedInstant(receipt)
        jdbc.update("UPDATE advent_test_attempts SET cancelled = TRUE WHERE user_id = ? AND quiz_day = ? AND cancelled = FALSE", user, day)
        val state = stateAt(user, day, now)
        if (state.status == "recorded") {
            val token = UUID.randomUUID()
            jdbc.update("UPDATE advent_test_answers SET replay_token = ? WHERE user_id = ? AND quiz_day = ?", token, user, day)
            return AnswerState("recorded", replayToken = token)
        }
        if (state.status != "available") return state
        val generation = UUID.randomUUID()
        if (jdbc.update("UPDATE advent_test_generations SET generation = ? WHERE user_id = ? AND quiz_day = ?", generation, user, day) == 0)
            jdbc.update("INSERT INTO advent_test_generations (user_id, quiz_day, generation) VALUES (?, ?, ?)", user, day, generation)
        return AnswerState("available", generation)
    }

    @Transactional
    fun replay(user: UUID, day: Int, token: UUID, receipt: Instant): AnswerState {
        validateDay(day)
        val now = simulatedInstant(receipt)
        val current = stateAt(user, day, now)
        if (current.status != "recorded" || current.replayToken != token) return current
        jdbc.update("UPDATE advent_test_attempts SET cancelled = TRUE WHERE user_id = ? AND quiz_day = ?", user, day)
        jdbc.update("DELETE FROM advent_test_generations WHERE user_id = ? AND quiz_day = ?", user, day)
        jdbc.update("DELETE FROM advent_test_answers WHERE user_id = ? AND quiz_day = ?", user, day)
        jdbc.update("INSERT INTO advent_test_replays (user_id, quiz_day) VALUES (?, ?)", user, day)
        recompute(user)
        return AnswerState("available")
    }

    @Transactional
    fun confirmReserved(user: UUID, day: Int, choice: Int, id: UUID, receipt: Instant): AnswerState {
        validateDay(day)
        val now = simulatedInstant(receipt)
        val permitted = jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_attempts WHERE id = ? AND user_id = ? AND quiz_day = ? AND cancelled = FALSE", Long::class.java, id, user, day) ?: 0
        if (permitted == 0L) return stateAt(user, day, now)
        jdbc.update("UPDATE advent_test_attempts SET cancelled = TRUE WHERE id = ?", id)
        return confirm(user, day, choice, receipt)
    }

    @Transactional
    fun confirm(user: UUID, day: Int, choice: Int, receipt: Instant): AnswerState {
        validateDay(day)
        if (choice !in 0..2) throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        var now = simulatedInstant(receipt)
        val existing = stateAt(user, day, now)
        if (existing.status == "recorded") return existing
        val date = LocalDate.of(2026, 12, day)
        val today = now.atZone(paris).toLocalDate()
        if (existing.status != "available") return existing
        val key = quiz(day)?.falseChoice ?: return AnswerState("unavailable")
        if (today.isBefore(date)) {
            val advanced = now.atZone(paris).withYear(2026).withMonth(12).withDayOfMonth(day).toInstant()
            val offset = advanced.epochSecond - maxOf(receipt, Instant.now()).epochSecond
            jdbc.update("UPDATE advent_test_clock SET offset_seconds = ?, observed_at = ? WHERE id = 1", offset, Timestamp.from(advanced))
            jdbc.update("INSERT INTO advent_test_clock_advances (received_at, offset_seconds) VALUES (?, ?)", Timestamp.from(receipt), offset)
            // A late lock acquisition must not move a later clock transition backwards.
            jdbc.update("UPDATE advent_test_clock_advances SET offset_seconds = ? WHERE received_at > ? AND offset_seconds < ?", offset, Timestamp.from(receipt), offset)
            now = advanced
        }
        val correct = choice == key
        val reveal = date.plusDays(1).atStartOfDay(paris).toInstant()
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at, answer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            user, day, choice, key, if (correct) 10 else 0, 1, 0, Timestamp.from(now), Timestamp.from(reveal), UUID.randomUUID())
        jdbc.update("DELETE FROM advent_test_replays WHERE user_id = ? AND quiz_day = ?", user, day)
        recompute(user)
        return stateAt(user, day, now)
    }

    /** All result reads share the clock lock with confirmations and replay. */
    @Transactional
    fun latestUnseen(user: UUID, receipt: Instant): AdventResult? {
        val now = simulatedInstant(receipt)
        val day = jdbc.query("SELECT quiz_day FROM advent_test_answers WHERE user_id = ? AND seen_at IS NULL AND reveal_at <= ? ORDER BY quiz_day DESC", { rs, _ -> rs.getInt(1) }, user, Timestamp.from(now)).firstOrNull { quiz(it) != null } ?: return null
        return resultAt(user, day, now)
    }

    @Transactional
    fun result(user: UUID, day: Int, receipt: Instant): AdventResult? {
        validateDay(day)
        return resultAt(user, day, simulatedInstant(receipt))
    }

    private fun resultAt(user: UUID, day: Int, now: Instant): AdventResult? {
        if (quiz(day) == null) return null
        val eligible = jdbc.query("SELECT answer_id FROM advent_test_answers WHERE user_id = ? AND quiz_day = ? AND reveal_at <= ?", { rs, _ -> rs.getString(1) ?: "" }, user, day, Timestamp.from(now)).singleOrNull() ?: return null
        val answerId = eligible.ifEmpty {
            UUID.randomUUID().toString().also { jdbc.update("UPDATE advent_test_answers SET answer_id = ? WHERE user_id = ? AND quiz_day = ?", UUID.fromString(it), user, day) }
        }
        val values = jdbc.query("SELECT choice, correct_choice, response_points, participation_points, bonus_points, seen_at FROM advent_test_answers WHERE user_id = ? AND quiz_day = ? AND reveal_at <= ?", { rs, _ ->
            listOf(rs.getInt(1), rs.getInt(2), rs.getInt(3), rs.getInt(4), rs.getInt(5), if (rs.getTimestamp(6) == null) 0 else 1)
        }, user, day, Timestamp.from(now)).singleOrNull() ?: return null
        val total = jdbc.queryForObject("SELECT COALESCE(SUM(response_points + participation_points + bonus_points), 0) FROM advent_test_answers WHERE user_id = ? AND reveal_at <= ?", Int::class.java, user, Timestamp.from(now)) ?: 0
        return AdventResult(answerId, day, values[0], values[1], values[0] == values[1], values[2], values[3], values[4], total, values[5] == 1, quiz(day)?.explanation)
    }

    @Transactional
    fun acknowledge(user: UUID, day: Int, answerId: UUID, receipt: Instant) {
        validateDay(day)
        val now = simulatedInstant(receipt)
        if (jdbc.update("UPDATE advent_test_answers SET seen_at = COALESCE(seen_at, ?) WHERE user_id = ? AND quiz_day = ? AND answer_id = ? AND reveal_at <= ?", Timestamp.from(now), user, day, answerId, Timestamp.from(now)) == 0)
            throw ResponseStatusException(HttpStatus.NOT_FOUND)
    }

    @Transactional
    fun clockDate(receipt: Instant): LocalDate = simulatedInstant(receipt).atZone(paris).toLocalDate()

    @Transactional
    fun advanceDay(receipt: Instant): LocalDate {
        val now = simulatedInstant(receipt)
        val next = now.atZone(paris).toLocalDate().plusDays(1).atStartOfDay(paris).toInstant()
        val processing = maxOf(receipt, Instant.now())
        val offset = next.epochSecond - processing.epochSecond
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = ?, observed_at = ? WHERE id = 1", offset, Timestamp.from(next))
        jdbc.update("INSERT INTO advent_test_clock_advances (received_at, offset_seconds) VALUES (?, ?)", Timestamp.from(receipt), offset)
        return next.atZone(paris).toLocalDate()
    }

    /** Development-only control: move the isolated shared clock back one Paris day without deleting answers. */
    @Transactional
    fun previousDay(receipt: Instant): LocalDate {
        val now = simulatedInstant(receipt)
        val current = now.atZone(paris).toLocalDate()
        val first = LocalDate.of(2026, 12, 1)
        if (!current.isAfter(first)) return current
        val previous = current.minusDays(1).atStartOfDay(paris).toInstant()
        val processing = maxOf(receipt, Instant.now())
        val offset = previous.epochSecond - processing.epochSecond
        jdbc.update("UPDATE advent_test_clock SET offset_seconds = ?, observed_at = ? WHERE id = 1", offset, Timestamp.from(previous))
        jdbc.update("INSERT INTO advent_test_clock_advances (received_at, offset_seconds) VALUES (?, ?)", Timestamp.from(receipt), offset)
        return previous.atZone(paris).toLocalDate()
    }

    private fun recompute(user: UUID) {
        val scored = jdbc.query("SELECT quiz_day, choice, correct_choice FROM advent_test_answers WHERE user_id = ? ORDER BY quiz_day", { rs, _ -> Triple(rs.getInt(1), rs.getInt(2), rs.getInt(3)) }, user)
        var streak = 0
        for ((quizDay, selected, correctChoice) in scored) {
            streak = if (selected == correctChoice) streak + 1 else 0
            val bonus = if (streak > 0 && streak % 3 == 0) 2 else 0
            jdbc.update("UPDATE advent_test_answers SET bonus_points = ? WHERE user_id = ? AND quiz_day = ?", bonus, user, quizDay)
        }
        val updated = jdbc.update("UPDATE advent_test_member_state SET correct_streak = ? WHERE user_id = ?", streak, user)
        if (updated == 0) jdbc.update("INSERT INTO advent_test_member_state (user_id, correct_streak) VALUES (?, ?)", user, streak)
    }

    private fun simulatedInstant(receipt: Instant): Instant {
        // Read the clock only after acquiring the serialization lock: a request that
        // waited across midnight must not insert an answer after the reveal.
        val row = jdbc.query("SELECT offset_seconds, observed_at FROM advent_test_clock WHERE id = 1 FOR UPDATE") { rs, _ ->
            Pair(rs.getObject(1)?.let { (it as Number).toLong() }, rs.getTimestamp(2)?.toInstant())
        }.single()
        val processing = maxOf(receipt, Instant.now())
        var offset = row.first
        if (offset == null) {
            val local = processing.atZone(paris)
            val initial = local.withYear(2026).withMonth(12).withDayOfMonth(1).toInstant()
            offset = initial.epochSecond - processing.epochSecond
            jdbc.update("UPDATE advent_test_clock SET offset_seconds = ? WHERE id = 1", offset)
        }
        val now = maxOf(processing.plusSeconds(offset), row.second ?: Instant.MIN)
        jdbc.update("UPDATE advent_test_clock SET observed_at = ? WHERE id = 1", Timestamp.from(now))
        return now
    }

    private fun stateAt(user: UUID, day: Int, now: Instant): AnswerState {
        if (quiz(day) == null) return AnswerState("unavailable")
        val count = jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ? AND quiz_day = ?", Long::class.java, user, day) ?: 0
        if (count > 0) {
            var token = jdbc.queryForObject("SELECT replay_token FROM advent_test_answers WHERE user_id = ? AND quiz_day = ?", UUID::class.java, user, day)
            if (token == null) {
                token = UUID.randomUUID()
                jdbc.update("UPDATE advent_test_answers SET replay_token = ? WHERE user_id = ? AND quiz_day = ?", token, user, day)
            }
            return AnswerState("recorded", replayToken = token)
        }
        val replay = jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_replays WHERE user_id = ? AND quiz_day = ?", Long::class.java, user, day) ?: 0
        return AnswerState(if (replay == 0L && AdventParisTime.isClosed(day, now)) "closed" else "available")
    }
    private fun validateDay(day: Int) { if (day !in 1..24) throw ResponseStatusException(HttpStatus.NOT_FOUND) }
}

data class AdventResult(val answerId: String, val day: Int, val selectedChoice: Int, val falseChoice: Int, val correct: Boolean, val responsePoints: Int, val participationPoints: Int, val bonusPoints: Int, val totalPoints: Int, val seen: Boolean, val explanation: String? = null)

data class AnswerState(val status: String, val generation: UUID? = null, val replayToken: UUID? = null)
data class ReplayAnswer(val replayToken: UUID?)
data class ConfirmAnswer(val choice: Int?, val attemptId: UUID?)
data class AnswerAttempt(val attemptId: UUID?, val generation: UUID?)

/** Date-only rule takes the caller's authoritative instant, with no simulated-clock dependency. */
object AdventParisTime {
    private val paris: ZoneId = ZoneId.of("Europe/Paris")
    fun isClosed(day: Int, instant: Instant): Boolean =
        !instant.isBefore(LocalDate.of(2026, 12, day).plusDays(1).atStartOfDay(paris).toInstant())
}

data class AdventQuiz(val name: String, val portraitRef: String?, val statements: List<String>, val falseChoice: Int, val explanation: String?)
