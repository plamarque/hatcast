package com.hatcast.api.advent

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.security.MessageDigest
import java.sql.Timestamp
import java.time.LocalDate
import java.time.Duration
import java.time.ZoneId

data class AdventQuizEditContent(val statements: List<String>, val stories: List<String?>, val falseChoice: Int, val explanation: String?)
data class AdventQuizEditRequest(val version: String, val content: AdventQuizEditContent)
data class AdventQuizEditView(val day: Int, val name: String, val version: String, val content: AdventQuizEditContent)

/** Content is locked together with game operations; simulated game clocks are never used here. */
@Service
class AdventQuizEditor(private val jdbc: JdbcTemplate, private val realClock: AdventRealClock, private val mapper: ObjectMapper, private val databaseClock: AdventDatabaseClock) {
    private val paris = ZoneId.of("Europe/Paris")

    private fun requireFuture(day: Int) {
        if (!realClock.instant().isBefore(LocalDate.of(2026, 12, day).atStartOfDay(paris).toInstant())) throw ResponseStatusException(HttpStatus.GONE)
    }

    @Transactional
    fun editableDays(): List<Int> {
        jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
        val days = jdbc.query("SELECT quiz_day FROM advent_quizzes ORDER BY quiz_day") { rs, _ -> rs.getInt(1) }
        val now = realClock.instant()
        return days.filter { now.isBefore(LocalDate.of(2026, 12, it).atStartOfDay(paris).toInstant()) }
    }

    fun refreshDelayMillis(days: List<Int>): Long {
        val now = realClock.instant()
        val first = days.minOrNull() ?: return 21_600_000L
        return Duration.between(now, LocalDate.of(2026, 12, first).atStartOfDay(paris).toInstant()).toMillis().coerceIn(1L, 21_600_000L)
    }

    private fun lock(day: Int): AdventQuizEditView {
        if (day !in 1..24) throw ResponseStatusException(HttpStatus.NOT_FOUND)
        jdbc.queryForObject("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE", Int::class.java)
        val view = jdbc.query("SELECT display_name, statement_0, statement_1, statement_2, story_0, story_1, story_2, false_choice, explanation, content_revision FROM advent_quizzes WHERE quiz_day = ? FOR UPDATE", { rs, _ ->
            val content = AdventQuizEditContent(listOf(rs.getString(2), rs.getString(3), rs.getString(4)), listOf(rs.getString(5), rs.getString(6), rs.getString(7)), rs.getInt(8), rs.getString(9))
            AdventQuizEditView(day, rs.getString(1), version(content, rs.getLong(10)), content)
        }, day).singleOrNull() ?: throw ResponseStatusException(HttpStatus.NOT_FOUND)
        requireFuture(day)
        return view
    }

    private fun version(content: AdventQuizEditContent, revision: Long): String = "$revision:" + MessageDigest.getInstance("SHA-256")
        .digest(mapper.writeValueAsBytes(content)).joinToString("") { "%02x".format(it) }

    @Transactional
    fun read(day: Int): AdventQuizEditView = lock(day)

    @Transactional
    fun save(day: Int, request: AdventQuizEditRequest): AdventQuizEditView {
        val current = lock(day)
        if (current.version != request.version) throw ResponseStatusException(HttpStatus.CONFLICT)
        val content = request.content
        if (content.statements.size != 3 || content.statements.any { it.isBlank() || it.length > 5000 } ||
            content.stories.size != 3 || content.stories.any { it != null && (it.isBlank() || it.length > 20000) } ||
            content.falseChoice !in 0..2 || (content.explanation != null && (content.explanation.isBlank() || content.explanation.length > 20000)))
            throw ResponseStatusException(HttpStatus.BAD_REQUEST)
        requireFuture(day)
        val deadline = Timestamp.from(LocalDate.of(2026, 12, day).atStartOfDay(paris).toInstant())
        val updated = jdbc.update("UPDATE advent_quizzes SET statement_0 = ?, statement_1 = ?, statement_2 = ?, story_0 = ?, story_1 = ?, story_2 = ?, false_choice = ?, explanation = ?, content_revision = content_revision + 1 WHERE quiz_day = ? AND ${databaseClock.expression} < ? AND ? < ?",
            content.statements[0], content.statements[1], content.statements[2], content.stories[0], content.stories[1], content.stories[2], content.falseChoice, content.explanation, day,
            deadline, Timestamp.from(realClock.instant()), deadline)
        if (updated != 1) throw ResponseStatusException(HttpStatus.GONE)
        return AdventQuizEditView(day, current.name, version(content, current.version.substringBefore(":").toLong() + 1), content)
    }
}
