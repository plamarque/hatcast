package com.hatcast.api.advent

import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeMembershipService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.mock.env.MockEnvironment
import org.springframework.mock.web.MockHttpServletRequest
import java.util.Base64
import java.util.UUID

class AdventCloudPortraitTest {
    @Test fun `authorized door reads prefixed cloud object and returns its bytes`() {
        val troupe = UUID.randomUUID()
        val session = UUID.randomUUID()
        val memberships = mock<TroupeMembershipService>()
        val game = mock<AdventMemberGame>()
        val storage = mock<AdventMemberPortraitStorage>()
        val bytes = byteArrayOf(1, 2, 3)
        whenever(storage.read("private-bucket", "portraits/example.png")).thenReturn(bytes)
        whenever(game.quiz(1, session)).thenReturn(AdventQuiz("Fictional", "example.png", listOf("A", "B", "C"), 0, null))
        val env = MockEnvironment().withProperty("hatcast.advent.troupe-id", troupe.toString()).withProperty("hatcast.advent.private-portrait-bucket", "private-bucket")
        val controller = AdventMemberController(env, memberships, game, mock(), mock(), storage)
        val principal = TestAuthSupport.testPrincipal()
        val request = MockHttpServletRequest().apply { addHeader("X-Advent-Test-Session", session.toString()) }
        val result = controller.door(1, principal, request)
        verify(memberships).requireActiveMemberMembership(principal.userId, troupe)
        verify(storage).read("private-bucket", "portraits/example.png")
        assertFalse(result.genericElf)
        assertArrayEquals(bytes, Base64.getDecoder().decode(result.portrait.substringAfter(',')))
    }
    @Test fun `authorized door uses shared bucket by default`() {
        val troupe = UUID.randomUUID()
        val session = UUID.randomUUID()
        val game = mock<AdventMemberGame>()
        val storage = mock<AdventMemberPortraitStorage>()
        whenever(storage.read("impro-selector-avent-content-private", "portraits/example.png")).thenReturn(byteArrayOf(1))
        whenever(game.quiz(1, session)).thenReturn(AdventQuiz("Fictional", "example.png", listOf("A", "B", "C"), 0, null))
        val env = MockEnvironment().withProperty("hatcast.advent.troupe-id", troupe.toString())
        val controller = AdventMemberController(env, mock(), game, mock(), mock(), storage)
        val request = MockHttpServletRequest().apply { addHeader("X-Advent-Test-Session", session.toString()) }
        assertFalse(controller.door(1, TestAuthSupport.testPrincipal(), request).genericElf)
        verify(storage).read("impro-selector-avent-content-private", "portraits/example.png")
    }

}
