package com.hatcast.api.advent

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.mock.env.MockEnvironment
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.nio.file.Files
import java.nio.file.Path
import java.sql.Connection
import java.sql.DatabaseMetaData
import javax.sql.DataSource

class AdventMemberClockTest {
    private val source = mock(DataSource::class.java)
    private val root = mock(AdventOfflineRoot::class.java)
    @Test fun `production ignores even invalid configured offsets`() {
        val env = MockEnvironment().withProperty("K_SERVICE", "hatcast-v2").withProperty("hatcast.advent.clock-offset-seconds", "invalid")
        env.setActiveProfiles("cloud")
        val before = Instant.now()
        val now = AdventMemberClock(env, source, root).instant()
        assertFalse(now.isBefore(before))
        assertFalse(now.isAfter(Instant.now()))
    }
    @Test fun `verified offline database may apply operator offset`(@TempDir worktree: Path) {
        val dir = Files.createDirectories(worktree.resolve(".local/hatcast-offline"))
        Files.createFile(dir.resolve("hatcast.mv.db"))
        val connection = mock(Connection::class.java)
        val metadata = mock(DatabaseMetaData::class.java)
        `when`(source.connection).thenReturn(connection)
        `when`(connection.metaData).thenReturn(metadata)
        `when`(metadata.url).thenReturn("jdbc:h2:file:${dir.resolve("hatcast")}")
        `when`(root.worktreeRoot()).thenReturn(worktree)
        val env = MockEnvironment().withProperty("hatcast.advent.clock-offset-seconds", "3600")
        env.setActiveProfiles("offline", "dev")
        val before = Instant.now().plusSeconds(3600)
        val result = AdventMemberClock(env, source, root).instant()
        assertFalse(result.isBefore(before))
        assertFalse(result.isAfter(Instant.now().plusSeconds(3600)))
    }
    @Test fun `unknown environment cannot activate offset`() {
        val env = MockEnvironment().withProperty("hatcast.advent.clock-offset-seconds", "100")
        env.setActiveProfiles("dev")
        assertThrows(ResponseStatusException::class.java) { AdventMemberClock(env, source, root).instant() }
    }
}
