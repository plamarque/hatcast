package com.hatcast.api.advent

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.notification.*
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MapPropertySource
import org.springframework.http.MediaType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest(properties = ["hatcast.advent.troupe-id=a0000001-0000-4000-8000-000000000001"])
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdventTestReminderHttpTest {
    @Autowired lateinit var mvc: MockMvc
    @Autowired lateinit var jdbc: JdbcTemplate
    @Autowired lateinit var json: ObjectMapper
    @Autowired lateinit var environment: ConfigurableEnvironment
    @MockBean lateinit var google: GoogleIdTokenService
    @MockBean lateinit var idp: IdpIdTokenVerifier
    @MockBean lateinit var clock: AdventMemberClock
    @MockBean lateinit var sender: WebPushNotificationSender

    @Test fun `HTTP test sends once and leaves daily reservations unchanged`() {
        val troupe = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        jdbc.update("INSERT INTO troupes (id, name, slug, created_at) SELECT ?, 'Fictif', 'reminder-http', CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM troupes WHERE id = ?)", troupe, troupe)
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "test-reminder-http", "reminder-operator@example.test", emailVerified = true)
        val user = jdbc.queryForObject("SELECT id FROM users WHERE google_sub = ?", UUID::class.java, "test-reminder-http")!!
        jdbc.update("INSERT INTO troupe_memberships (id, troupe_id, user_id, status, baseline_role, display_name, created_at, updated_at) VALUES (?, ?, ?, 'ACTIVE', 'MEMBER', 'Fictif', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", UUID.randomUUID(), troupe, user)
        environment.propertySources.addFirst(MapPropertySource("test-reminder-http", mapOf(
            "hatcast.advent.excluded-user-ids" to "$user,${UUID.randomUUID()}",
            "hatcast.advent-test.allowed-emails" to "reminder-operator@example.test,second@example.test",
        )))
        try {
            whenever(clock.isolatedControlsAllowed()).thenReturn(true)
            whenever(clock.instant()).thenReturn(Instant.parse("2026-12-05T12:00:00Z"))
            whenever(sender.sendTestAdventPush(eq(user), any(), any())).thenReturn(NotificationDeliveryResult(NotificationChannel.PUSH, NotificationDeliveryStatus.SENT))
            val session = json.readTree(mvc.perform(get("/v1/advent/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString)["sessionId"].asText()
            val body = """{"endpoint":"https://push.example.test/http-$user","keys":{"p256dh":"key","auth":"auth"}}"""
            val before = jdbc.queryForObject("SELECT COUNT(*) FROM advent_reminder_attempts", Int::class.java)
            mvc.perform(put("/v1/advent/test-reminder-device").cookie(cookie).with(csrf()).header("X-Advent-Test-Mode", "true").header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-05").header("X-Advent-User", user).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk)
            mvc.perform(post("/v1/advent/test-reminder").cookie(cookie).with(csrf()).header("X-Advent-Test-Mode", "true").header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-05").header("X-Advent-User", user).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk)
            assertEquals(before, jdbc.queryForObject("SELECT COUNT(*) FROM advent_reminder_attempts", Int::class.java))
            val payload = argumentCaptor<NotificationPayload>()
            verify(sender, times(1)).sendTestAdventPush(eq(user), any(), payload.capture())
            assertEquals("/avent?jour=5&test=1", payload.firstValue.url)
            mvc.perform(post("/v1/advent/test-reminder").cookie(cookie).with(csrf()).header("X-Advent-Test-Mode", "true").header("X-Advent-Test-Session", UUID.randomUUID()).header("X-Advent-Simulated-Date", "2026-12-05").header("X-Advent-User", user).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict)
            mvc.perform(post("/v1/advent/test-reminder").cookie(cookie).with(csrf()).header("X-Advent-Test-Mode", "true").header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-05").header("X-Advent-User", UUID.randomUUID()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict)
            whenever(clock.isolatedControlsAllowed()).thenReturn(false)
            mvc.perform(post("/v1/advent/test-reminder").cookie(cookie).with(csrf()).header("X-Advent-Test-Mode", "true").header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-05").header("X-Advent-User", user).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isNotFound)
            mvc.perform(post("/v1/advent/test-reminder").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isUnauthorized)
            verify(sender, times(1)).sendTestAdventPush(eq(user), any(), any())
        } finally { environment.propertySources.remove("test-reminder-http") }
    }
}
