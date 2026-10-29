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
    private val user = SessionUserPrincipal(UUID.randomUUID(), "sub", null, "test@example.com")
    private val offlineRoot = mock<AdventOfflineRoot>()
    private val cloudImages = mock<AdventPreviewImages>()
    private val controller = AdventTestController(env, dataSource, memberships, offlineRoot, cloudImages)

    @TempDir lateinit var tempDir: Path
    @BeforeEach fun createIsolatedDatabase() {
        Files.createDirectories(tempDir.resolve(".local/hatcast-offline"))
        Files.createFile(tempDir.resolve(".local/hatcast-offline/hatcast.mv.db"))
        whenever(offlineRoot.worktreeRoot()).thenReturn(tempDir)
    }

    private fun isolated() {
        whenever(env.activeProfiles).thenReturn(arrayOf("dev", "offline"))
        whenever(env.getProperty("hatcast.advent-test.enabled")).thenReturn("true")
        whenever(env.getProperty("hatcast.advent-test.allowed-emails", "")).thenReturn("test@example.com")
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
        assertEquals("Camille", controller.door(3, user).name)
        assertTrue(quiz.portrait.startsWith("data:image/png;base64,"))
        assertThrows(ResponseStatusException::class.java) { controller.door(25, user) }
    }
    @Test fun `all 24 test days contain distinct fictional quizzes`() {
        isolated()
        val quizzes = (1..24).map { controller.door(it, user) }
        assertEquals(listOf("Patrice", "Will", "Camille", "Angie"), quizzes.take(4).map { it.name })
        assertTrue(quizzes.drop(4).all { it.name == "Lutin de Noël" && it.genericElf })
        assertTrue(quizzes.all { it.statements.size == 3 && it.statements.all(String::isNotBlank) })
        assertEquals(24, quizzes.map { it.statements }.toSet().size)
        assertThrows(ResponseStatusException::class.java) { controller.door(0, user) }
        assertThrows(ResponseStatusException::class.java) { controller.door(25, user) }
    }
    @Test fun `only explicitly listed emails can see test content`() {
        isolated()
        whenever(env.getProperty("hatcast.advent-test.allowed-emails", "")).thenReturn(" TEST@example.com , other@example.com ")
        assertEquals(1, controller.door(1, user).day)
        val outsider = SessionUserPrincipal(UUID.randomUUID(), "other", null, "outsider@example.com")
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException::class.java) { controller.door(1, outsider) }.statusCode)
        whenever(env.getProperty("hatcast.advent-test.allowed-emails", "")).thenReturn("")
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException::class.java) { controller.door(1, user) }.statusCode)
    }
    @Test fun `cloud preview requires the development service and Neon branch`() {
        isolated()
        whenever(env.activeProfiles).thenReturn(arrayOf("cloud"))
        whenever(env.getProperty("K_SERVICE")).thenReturn("hatcast-v2-dev")
        whenever(env.getProperty("GOOGLE_CLOUD_PROJECT")).thenReturn("impro-selector")
        whenever(metadata.url).thenReturn("jdbc:postgresql://ep-weathered-fog-al1law06.c-3.eu-central-1.aws.neon.tech/neondb")
        val request = org.springframework.mock.web.MockHttpServletRequest()
        request.getSession(true)!!.setAttribute("hatcast.auth.verified-email", true)
        val patrice = SessionUserPrincipal(UUID.randomUUID(), "sub", null, "patrice.lamarque@gmail.com")
        whenever(cloudImages.read("patrice-net.png")).thenReturn(byteArrayOf(1, 2, 3))
        val quiz = controller.door(1, patrice, request)
        assertEquals(1, quiz.day)
        assertEquals("data:image/png;base64,AQID", quiz.portrait)
        assertFalse(quiz.genericElf)
        val unverified = SessionUserPrincipal(UUID.randomUUID(), "sub", null, "patrice.lamarque@gmail.com")
        assertEquals(HttpStatus.FORBIDDEN, assertThrows(ResponseStatusException::class.java) { controller.door(1, unverified) }.statusCode)
        val antoine = SessionUserPrincipal(UUID.randomUUID(), "sub", null, "brousseau.ant@gmail.com")
        assertEquals(1, controller.door(1, antoine, request).day)
        assertThrows(ResponseStatusException::class.java) { controller.door(1, user, request) }
        whenever(env.getProperty("GOOGLE_CLOUD_PROJECT")).thenReturn("wrong-project")
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { controller.door(1, patrice, request) }.statusCode)
        whenever(env.getProperty("GOOGLE_CLOUD_PROJECT")).thenReturn("impro-selector")
        whenever(env.getProperty("K_SERVICE")).thenReturn("hatcast-v2")
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { controller.door(1, patrice, request) }.statusCode)
        whenever(env.getProperty("K_SERVICE")).thenReturn("hatcast-v2-dev")
        whenever(metadata.url).thenReturn("jdbc:postgresql://production.example/neondb")
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException::class.java) { controller.door(1, patrice, request) }.statusCode)
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
