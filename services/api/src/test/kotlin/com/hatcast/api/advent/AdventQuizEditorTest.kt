package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.doReturn
import org.springframework.boot.test.mock.mockito.SpyBean
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.server.ResponseStatusException
import java.time.Instant

@SpringBootTest
@ActiveProfiles("test")
class AdventQuizEditorTest {
    @Autowired lateinit var editor: AdventQuizEditor
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var txManager: PlatformTransactionManager
    @MockBean lateinit var realClock: AdventRealClock
    @SpyBean lateinit var databaseClock: AdventDatabaseClock
    @BeforeEach fun prepare() {
        doReturn("TIMESTAMP WITH TIME ZONE '2026-12-23 22:59:59+00'").`when`(databaseClock).expression
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 24")
        jdbc.update("INSERT INTO advent_quizzes (quiz_day, display_name, statement_0, statement_1, statement_2, false_choice) VALUES (24, 'Fictif', 'A', 'B', 'C', 0)")
        `when`(realClock.instant()).thenReturn(Instant.parse("2026-12-23T22:59:59Z"))
    }
    @Test fun `save preserves associations and rejects stale version`() {
        val first = editor.read(24)
        val content = AdventQuizEditContent(listOf("Un", "Deux", "Trois"), listOf("Premier\n\nSuite", null, "Troisième"), 2, "Explication")
        val saved = editor.save(24, AdventQuizEditRequest(first.version, content))
        assertEquals(content, editor.read(24).content)
        assertNotEquals(first.version, saved.version)
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException::class.java) { editor.save(24, AdventQuizEditRequest(first.version, first.content)) }.statusCode)
        assertEquals(content, editor.read(24).content)
    }
    @Test fun `real Paris midnight closes reads and stale writes`() {
        val view = editor.read(24)
        `when`(realClock.instant()).thenReturn(Instant.parse("2026-12-23T23:00:00Z"))
        assertEquals(HttpStatus.GONE, assertThrows(ResponseStatusException::class.java) { editor.save(24, AdventQuizEditRequest(view.version, view.content)) }.statusCode)
        assertEquals(HttpStatus.GONE, assertThrows(ResponseStatusException::class.java) { editor.read(24) }.statusCode)
    }
    @Test fun `H2 database clock returns current wall time`() {
        val before = Instant.now().minusSeconds(1)
        val actual = jdbc.queryForObject("SELECT ADVENT_WALL_TIME()", java.time.OffsetDateTime::class.java)!!.toInstant()
        assertTrue(!actual.isBefore(before) && actual.isBefore(Instant.now().plusSeconds(1)))
    }
    @Test fun `database wall clock at the update prevents a late write`() {
        val view = editor.read(24)
        val databaseClock = mock(AdventDatabaseClock::class.java)
        `when`(databaseClock.expression).thenReturn("TIMESTAMP WITH TIME ZONE '2026-12-23 23:00:00+00'")
        val target = AdventQuizEditor(jdbc, realClock, ObjectMapper(), databaseClock)
        val changed = view.content.copy(statements = listOf("Trop tard", "B", "C"))
        val error = assertThrows(ResponseStatusException::class.java) {
            TransactionTemplate(txManager).execute { target.save(24, AdventQuizEditRequest(view.version, changed)) }
        }
        assertEquals(HttpStatus.GONE, error.statusCode)
        assertEquals("A", jdbc.queryForObject("SELECT statement_0 FROM advent_quizzes WHERE quiz_day = 24", String::class.java))
    }
    @Test fun `clock is checked again after validation and before update`() {
        val view = editor.read(24)
        `when`(realClock.instant()).thenReturn(Instant.parse("2026-12-23T22:59:59Z"), Instant.parse("2026-12-23T23:00:00Z"))
        val changed = view.content.copy(statements = listOf("Nouveau", "B", "C"))
        assertEquals(HttpStatus.GONE, assertThrows(ResponseStatusException::class.java) { editor.save(24, AdventQuizEditRequest(view.version, changed)) }.statusCode)
        assertEquals("A", jdbc.queryForObject("SELECT statement_0 FROM advent_quizzes WHERE quiz_day = 24", String::class.java))
    }
    @Test fun `editable days use real Paris boundary and existing content`() {
        jdbc.update("DELETE FROM advent_quizzes WHERE quiz_day = 23")
        assertTrue(editor.editableDays().contains(24))
        assertEquals(1000L, editor.refreshDelayMillis(listOf(24)))
        assertFalse(editor.editableDays().contains(23))
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { editor.read(23) }.statusCode)
        `when`(realClock.instant()).thenReturn(Instant.parse("2026-12-23T23:00:00Z"))
        assertFalse(editor.editableDays().contains(24))
    }
    @Test fun `missing and invalid quiz are refused`() {
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { editor.read(25) }.statusCode)
        val view = editor.read(24)
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException::class.java) { editor.save(24, AdventQuizEditRequest(view.version, view.content.copy(statements = listOf("")))) }.statusCode)
    }
}
