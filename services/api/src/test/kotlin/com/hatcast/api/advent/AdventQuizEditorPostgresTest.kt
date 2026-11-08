package com.hatcast.api.advent

import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceTransactionManager
import org.springframework.jdbc.datasource.DriverManagerDataSource
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.time.Duration
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException
import java.util.concurrent.atomic.AtomicReference

@EnabledIfEnvironmentVariable(named = "ADVENT_TEST_POSTGRES_URL", matches = ".+")
class AdventQuizEditorPostgresTest {
    @Test fun `concurrent editors serialize and waiting past midnight cannot write`() {
        val url = System.getenv("ADVENT_TEST_POSTGRES_URL")
        require(url.startsWith("jdbc:postgresql://127.0.0.1:"))
        val user = System.getenv("ADVENT_TEST_POSTGRES_USER"); val password = System.getenv("ADVENT_TEST_POSTGRES_PASSWORD")
        val root = JdbcTemplate(DriverManagerDataSource(url, user, password))
        val schema = "advent_edit_" + UUID.randomUUID().toString().replace("-", "")
        root.execute("CREATE SCHEMA $schema")
        val pool = Executors.newFixedThreadPool(2)
        try {
            val ds = DriverManagerDataSource(url + (if (url.contains('?')) "&" else "?") + "currentSchema=$schema", user, password)
            val jdbc = JdbcTemplate(ds)
            jdbc.execute("CREATE TABLE advent_member_lock (id INTEGER PRIMARY KEY)")
            jdbc.execute("INSERT INTO advent_member_lock VALUES (1)")
            jdbc.execute("CREATE TABLE advent_quizzes (quiz_day INTEGER PRIMARY KEY, display_name TEXT, statement_0 TEXT, statement_1 TEXT, statement_2 TEXT, story_0 TEXT, story_1 TEXT, story_2 TEXT, false_choice INTEGER, explanation TEXT, content_revision BIGINT NOT NULL DEFAULT 0)")
            jdbc.execute("INSERT INTO advent_quizzes (quiz_day,display_name,statement_0,statement_1,statement_2,false_choice) VALUES (24,'Fictif','A','B','C',0)")
            val now = AtomicReference(Instant.parse("2026-12-23T22:59:59Z"))
            val clock = mock(AdventRealClock::class.java)
            `when`(clock.instant()).thenAnswer { now.get() }
            val databaseClock = mock(AdventDatabaseClock::class.java)
            val offset = Duration.between(Instant.now(), Instant.parse("2026-12-23T22:59:00Z")).seconds
            `when`(databaseClock.expression).thenReturn("clock_timestamp() + interval '$offset seconds'")
            val editor = AdventQuizEditor(jdbc, clock, ObjectMapper(), databaseClock)
            fun <T> transaction(action: () -> T): T = TransactionTemplate(DataSourceTransactionManager(ds)).execute { action() }!!
            val original = transaction { editor.read(24) }
            val content1 = original.content.copy(statements = listOf("Premier", "B", "C"))
            val content2 = original.content.copy(statements = listOf("Second", "B", "C"))
            val first = pool.submit<String> { try { transaction { editor.save(24, AdventQuizEditRequest(original.version, content1)) }; "saved" } catch (e: ResponseStatusException) { e.statusCode.toString() } }
            val second = pool.submit<String> { try { transaction { editor.save(24, AdventQuizEditRequest(original.version, content2)) }; "saved" } catch (e: ResponseStatusException) { e.statusCode.toString() } }
            assertEquals(setOf("saved", HttpStatus.CONFLICT.toString()), setOf(first.get(10, TimeUnit.SECONDS), second.get(10, TimeUnit.SECONDS)))
            val current = transaction { editor.read(24) }
            val futureDatabaseClock = mock(AdventDatabaseClock::class.java)
            `when`(futureDatabaseClock.expression).thenReturn("TIMESTAMP WITH TIME ZONE '2026-12-23 23:00:00+00'")
            val lateEditor = AdventQuizEditor(jdbc, clock, ObjectMapper(), futureDatabaseClock)
            val rejected = assertThrows(ResponseStatusException::class.java) {
                transaction { lateEditor.save(24, AdventQuizEditRequest(current.version, current.content.copy(statements = listOf("Trop tard", "B", "C")))) }
            }
            assertEquals(HttpStatus.GONE, rejected.statusCode)
            assertEquals(current.content.statements[0], jdbc.queryForObject("SELECT statement_0 FROM advent_quizzes WHERE quiz_day = 24", String::class.java))
            ds.connection.use { lock ->
                lock.autoCommit = false
                lock.createStatement().use { it.executeQuery("SELECT id FROM advent_member_lock WHERE id = 1 FOR UPDATE").close() }
                val blocked = pool.submit<String> { try { transaction { editor.save(24, AdventQuizEditRequest(current.version, current.content.copy(statements = listOf("Trop tard", "B", "C")))) }; "saved" } catch (e: ResponseStatusException) { e.statusCode.toString() } }
                assertThrows(TimeoutException::class.java) { blocked.get(300, TimeUnit.MILLISECONDS) }
                now.set(Instant.parse("2026-12-23T23:00:00Z"))
                lock.commit()
                assertEquals(HttpStatus.GONE.toString(), blocked.get(10, TimeUnit.SECONDS))
            }
            assertEquals(current.content.statements[0], jdbc.queryForObject("SELECT statement_0 FROM advent_quizzes WHERE quiz_day = 24", String::class.java))
        } finally { pool.shutdownNow(); root.execute("DROP SCHEMA $schema CASCADE") }
    }
}
