package com.hatcast.api.advent

import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.notification.*
import com.hatcast.api.notification.dto.PushSubscriptionKeysDto
import com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest
import com.hatcast.api.troupe.TroupeMembershipService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.*
import org.springframework.http.HttpStatus
import org.springframework.mock.env.MockEnvironment
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

class AdventTestReminderControllerTest {
    private val user = UUID.randomUUID()
    private val other = UUID.randomUUID()
    private val session = UUID.randomUUID()
    private val principal = SessionUserPrincipal(user, "subject", null, "operator@example.test")
    private val clock = mock<AdventMemberClock>()
    private val game = mock<AdventMemberGame>()
    private val memberships = mock<TroupeMembershipService>()
    private val sender = mock<WebPushNotificationSender>()
    private val subscriptions = mock<UserPushSubscriptionService>()
    private val environment = MockEnvironment().withProperty("hatcast.advent.troupe-id", UUID.randomUUID().toString())
        .withProperty("hatcast.advent.excluded-user-ids", "$user,$other")
        .withProperty("hatcast.advent-test.allowed-emails", "operator@example.test,other@example.test")
        .apply { setActiveProfiles("dev") }
    private val controller = AdventMemberController(environment, memberships, game, clock, mock(), mock(), subscriptions, sender)
    private val device = RegisterPushSubscriptionRequest("https://push.example.test/device", PushSubscriptionKeysDto("key", "auth"))
    private fun request(): MockHttpServletRequest = MockHttpServletRequest().apply {
        getSession(true)!!.setAttribute("hatcast.auth.verified-email", true)
        addHeader("X-Advent-Test-Mode", "true")
        addHeader("X-Advent-Test-Session", this@AdventTestReminderControllerTest.session.toString())
        addHeader("X-Advent-Simulated-Date", "2026-12-05")
        addHeader("X-Advent-User", user.toString())
    }

    @Test fun `valid operator asks for one targeted delivery with simulated day`() {
        whenever(clock.isolatedControlsAllowed()).thenReturn(true)
        whenever(sender.sendTestAdventPush(eq(user), eq(device), any())).thenReturn(NotificationDeliveryResult(NotificationChannel.PUSH, NotificationDeliveryStatus.SENT))
        assertEquals("accepted", controller.sendTestReminder(device, principal, request())["status"])
        val payload = argumentCaptor<NotificationPayload>()
        verify(sender, times(1)).sendTestAdventPush(eq(user), eq(device), payload.capture())
        assertEquals("/avent?jour=5&test=1", payload.firstValue.url)
        assertEquals("advent", payload.firstValue.kind)
    }

    @Test fun `isolated environment identity and quiz date are mandatory`() {
        val req = request()
        assertEquals(HttpStatus.NOT_FOUND, assertThrows<ResponseStatusException> { controller.sendTestReminder(device, principal, req) }.statusCode)
        whenever(clock.isolatedControlsAllowed()).thenReturn(true)
        val foreign = SessionUserPrincipal(other, "subject", null, "intruder@example.test")
        assertEquals(HttpStatus.NOT_FOUND, assertThrows<ResponseStatusException> { controller.sendTestReminder(device, foreign, req) }.statusCode)
        req.removeHeader("X-Advent-Simulated-Date")
        req.addHeader("X-Advent-Simulated-Date", "2026-12-25")
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows<ResponseStatusException> { controller.sendTestReminder(device, principal, req) }.statusCode)
        verifyNoInteractions(sender)
    }
    @Test fun `inactive membership and stale session never dispatch`() {
        whenever(clock.isolatedControlsAllowed()).thenReturn(true)
        whenever(memberships.requireActiveMemberMembership(eq(user), any())).thenThrow(ResponseStatusException(HttpStatus.FORBIDDEN))
        assertEquals(HttpStatus.FORBIDDEN, assertThrows<ResponseStatusException> { controller.sendTestReminder(device, principal, request()) }.statusCode)
        reset(memberships)
        whenever(game.clockProjection(eq(session), any(), eq(false))).thenThrow(ResponseStatusException(HttpStatus.CONFLICT))
        assertEquals(HttpStatus.CONFLICT, assertThrows<ResponseStatusException> { controller.sendTestReminder(device, principal, request()) }.statusCode)
        verifyNoInteractions(sender)
    }

}
