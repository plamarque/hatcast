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
    private val keys = listOf(0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2, 0, 1, 2, 0, 1, 2, 1, 0, 2)

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
        if (state.status != "available") return state
        val generation = UUID.randomUUID()
        if (jdbc.update("UPDATE advent_test_generations SET generation = ? WHERE user_id = ? AND quiz_day = ?", generation, user, day) == 0)
            jdbc.update("INSERT INTO advent_test_generations (user_id, quiz_day, generation) VALUES (?, ?, ?)", user, day, generation)
        return AnswerState("available", generation)
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
        if (AdventParisTime.isClosed(day, now)) return AnswerState("closed")
        if (today.isBefore(date)) {
            val advanced = now.atZone(paris).withYear(2026).withMonth(12).withDayOfMonth(day).toInstant()
            val offset = advanced.epochSecond - maxOf(receipt, Instant.now()).epochSecond
            jdbc.update("UPDATE advent_test_clock SET offset_seconds = ?, observed_at = ? WHERE id = 1", offset, Timestamp.from(advanced))
            jdbc.update("INSERT INTO advent_test_clock_advances (received_at, offset_seconds) VALUES (?, ?)", Timestamp.from(receipt), offset)
            // A late lock acquisition must not move a later clock transition backwards.
            jdbc.update("UPDATE advent_test_clock_advances SET offset_seconds = ? WHERE received_at > ? AND offset_seconds < ?", offset, Timestamp.from(receipt), offset)
            now = advanced
        }
        val correct = choice == keys[day - 1]
        val reveal = date.plusDays(1).atStartOfDay(paris).toInstant()
        jdbc.update("INSERT INTO advent_test_answers (user_id, quiz_day, choice, correct_choice, response_points, participation_points, bonus_points, received_at, reveal_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            user, day, choice, keys[day - 1], if (correct) 10 else 0, 1, 0, Timestamp.from(now), Timestamp.from(reveal))
        // Reconcile a late-locking earlier quiz under the same global lock. Choice and
        // correctness are immutable; bonus follows quiz order, including missed days.
        val scored = jdbc.query("SELECT quiz_day, choice, correct_choice FROM advent_test_answers WHERE user_id = ? ORDER BY quiz_day", { rs, _ -> Triple(rs.getInt(1), rs.getInt(2), rs.getInt(3)) }, user)
        var streak = 0
        for ((quizDay, selected, correctChoice) in scored) {
            streak = if (selected == correctChoice) streak + 1 else 0
            val bonus = if (streak > 0 && streak % 3 == 0) 2 else 0
            jdbc.update("UPDATE advent_test_answers SET bonus_points = ? WHERE user_id = ? AND quiz_day = ?", bonus, user, quizDay)
        }
        val updated = jdbc.update("UPDATE advent_test_member_state SET correct_streak = ? WHERE user_id = ?", streak, user)
        if (updated == 0) jdbc.update("INSERT INTO advent_test_member_state (user_id, correct_streak) VALUES (?, ?)", user, streak)
        return AnswerState("recorded")
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
        val count = jdbc.queryForObject("SELECT COUNT(*) FROM advent_test_answers WHERE user_id = ? AND quiz_day = ?", Long::class.java, user, day) ?: 0
        if (count > 0) return AnswerState("recorded")
        return AnswerState(if (AdventParisTime.isClosed(day, now)) "closed" else "available")
    }
    private fun validateDay(day: Int) { if (day !in 1..24) throw ResponseStatusException(HttpStatus.NOT_FOUND) }
}

data class AnswerState(val status: String, val generation: UUID? = null)
data class ConfirmAnswer(val choice: Int?, val attemptId: UUID?)
data class AnswerAttempt(val attemptId: UUID?, val generation: UUID?)

/** Date-only rule takes the caller's authoritative instant, with no simulated-clock dependency. */
object AdventParisTime {
    private val paris: ZoneId = ZoneId.of("Europe/Paris")
    fun isClosed(day: Int, instant: Instant): Boolean =
        !instant.isBefore(LocalDate.of(2026, 12, day).plusDays(1).atStartOfDay(paris).toInstant())
}
