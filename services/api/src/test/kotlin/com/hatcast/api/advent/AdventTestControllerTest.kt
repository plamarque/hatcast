package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.troupe.TroupeMembershipService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.io.TempDir
import org.mockito.kotlin.*
import org.springframework.core.env.Environment
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.Path
import java.sql.Connection
import java.sql.DatabaseMetaData
import java.util.UUID
import javax.sql.DataSource

class AdventTestControllerTest {
    private val env = mock<Environment>()
    private val dataSource = mock<DataSource>()
    private val connection = mock<Connection>()
    private val metadata = mock<DatabaseMetaData>()
    private val memberships = mock<TroupeMembershipService>()
    private val troupe = UUID.randomUUID()
    private val user = SessionUserPrincipal(UUID.randomUUID(), "sub", null, null)
    private val offlineRoot = mock<AdventOfflineRoot>()
    private val controller = AdventTestController(env, dataSource, memberships, offlineRoot)

    @TempDir lateinit var tempDir: Path
    @BeforeEach fun createIsolatedDatabase() {
        Files.createDirectories(tempDir.resolve(".local/hatcast-offline"))
        Files.createFile(tempDir.resolve(".local/hatcast-offline/hatcast.mv.db"))
        whenever(offlineRoot.worktreeRoot()).thenReturn(tempDir)
    }

    private fun isolated() {
        whenever(env.activeProfiles).thenReturn(arrayOf("dev", "offline"))
        whenever(env.getProperty("hatcast.advent-test.enabled")).thenReturn("true")
        whenever(env.getProperty("hatcast.advent-test.troupe-id")).thenReturn(troupe.toString())
        whenever(dataSource.connection).thenReturn(connection)
        whenever(connection.metaData).thenReturn(metadata)
        val path = tempDir.resolve(".local/hatcast-offline/hatcast").toAbsolutePath().normalize()
        whenever(metadata.url).thenReturn("jdbc:h2:file:$path")
    }

    @Test fun `only configured active member receives fictional content`() {
        isolated()
        val quiz = controller.door(1, user)
        verify(memberships).requireActiveMemberMembership(user.userId, troupe)
        assertEquals(3, quiz.statements.size)
        assertTrue(quiz.statements.all { it.contains("Camille") })
        assertEquals("Sacha Givre", controller.door(12, user).name)
        assertTrue(quiz.portrait.startsWith("data:image/png;base64,"))
        assertThrows(ResponseStatusException::class.java) { controller.door(2, user) }
    }
    @Test fun `membership denial also denies platform administrators`() {
        isolated()
        whenever(memberships.requireActiveMemberMembership(user.userId, troupe))
            .thenThrow(ResponseStatusException(HttpStatus.FORBIDDEN))
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }.statusCode)
    }
    @Test fun `disabled or absent flag and another H2 file fail closed`() {
        isolated()
        whenever(env.getProperty("hatcast.advent-test.enabled")).thenReturn(null)
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        whenever(env.getProperty("hatcast.advent-test.enabled")).thenReturn("false")
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        whenever(env.getProperty("hatcast.advent-test.enabled")).thenReturn("true")
        whenever(metadata.url).thenReturn("jdbc:h2:file:${tempDir}/other/hatcast")
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        verifyNoInteractions(memberships)
    }
    @Test fun `symlinked database and parent directory fail closed`() {
        isolated()
        val offline = tempDir.resolve(".local/hatcast-offline")
        val db = offline.resolve("hatcast.mv.db")
        val outside = Files.createFile(tempDir.resolve("outside.mv.db"))
        Files.delete(db)
        Files.createSymbolicLink(db, outside)
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        Files.delete(db)
        Files.delete(offline)
        val externalDir = Files.createDirectories(tempDir.resolve("outside-dir"))
        Files.createFile(externalDir.resolve("hatcast.mv.db"))
        Files.createSymbolicLink(offline, externalDir)
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        verifyNoInteractions(memberships)
    }
    @Test fun `missing configuration and unsafe profiles fail closed`() {
        isolated()
        whenever(env.getProperty("hatcast.advent-test.troupe-id")).thenReturn("invalid")
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }.statusCode)
        isolated()
        whenever(env.activeProfiles).thenReturn(arrayOf("dev"))
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        whenever(env.activeProfiles).thenReturn(arrayOf("dev", "offline", "prod"))
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        whenever(env.activeProfiles).thenReturn(arrayOf("dev", "offline"))
        whenever(metadata.url).thenReturn("jdbc:postgresql://example/production")
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }
        verifyNoInteractions(memberships)
    }
}
