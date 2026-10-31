package com.hatcast.api.advent

import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeMembershipService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.mock.env.MockEnvironment
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.server.ResponseStatusException
import java.nio.file.Files
import java.nio.file.Path
import java.util.Base64
import java.util.UUID

class AdventOfflinePortraitTest {
    @TempDir lateinit var rootPath: Path

    @Test fun `prepared local portrait is served only after member authorization`() {
        val troupe = UUID.randomUUID()
        val memberships = mock<TroupeMembershipService>()
        val game = mock<AdventMemberGame>()
        val clock = mock<AdventMemberClock>()
        val root = mock<AdventOfflineRoot>()
        whenever(root.worktreeRoot()).thenReturn(rootPath)
        val fixture = "portrait-fictif".toByteArray()
        val directory = Files.createDirectories(rootPath.resolve(".local/hatcast-avent-test"))
        Files.write(directory.resolve("fixture.png"), fixture)
        val session = UUID.randomUUID()
        val request = MockHttpServletRequest().apply { addHeader("X-Advent-Test-Session", session.toString()) }
        whenever(game.quiz(1, session)).thenReturn(AdventQuiz("Fictif existant", "fixture.png", listOf("A", "B", "C"), 0, null))
        val env = MockEnvironment().withProperty("hatcast.advent.troupe-id", troupe.toString()).apply { setActiveProfiles("offline") }
        val controller = AdventMemberController(env, memberships, game, clock, root)
        val principal = TestAuthSupport.testPrincipal()
        val response = controller.door(1, principal, request)
        verify(memberships).requireActiveMemberMembership(principal.userId, troupe)
        assertFalse(response.genericElf)
        assertArrayEquals(fixture, Base64.getDecoder().decode(response.portrait.substringAfter(',')))
        Files.createSymbolicLink(directory.resolve("link.png"), directory.resolve("fixture.png"))
        whenever(game.quiz(2, session)).thenReturn(AdventQuiz("Fictif", "link.png", listOf("A", "B", "C"), 0, null))
        assertTrue(controller.door(2, principal, request).genericElf)
        whenever(memberships.requireActiveMemberMembership(any(), any())).thenThrow(ResponseStatusException(HttpStatus.FORBIDDEN))
        assertThrows(ResponseStatusException::class.java) { controller.door(1, principal, request) }
    }
}
