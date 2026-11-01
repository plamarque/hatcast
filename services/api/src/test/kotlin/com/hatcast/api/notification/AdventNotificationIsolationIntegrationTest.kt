package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.advent.AdventMemberClock
import com.hatcast.api.advent.AdventRealClock
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.notification.dto.PatchNotificationPreferenceDto
import com.hatcast.api.notification.dto.PatchNotificationPreferencesRequest
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.kotlin.*
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.time.Instant
import java.util.Optional
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = ["hatcast.advent.troupe-id=a0000001-0000-4000-8000-000000000001"])
class AdventNotificationIsolationIntegrationTest {
    @Autowired private lateinit var mvc: MockMvc
    @Autowired private lateinit var users: UserRepository
    @Autowired private lateinit var subscriptions: UserPushSubscriptionRepository
    @Autowired private lateinit var adventDevices: AdventReminderDeviceRepository
    @Autowired private lateinit var pushService: UserPushSubscriptionService
    @Autowired private lateinit var preferences: UserNotificationPreferencesService
    @Autowired private lateinit var pushEligibility: PushNotificationEligibilityPort
    @Autowired private lateinit var preferenceEligibility: ObjectProvider<NotificationPreferenceEligibilityPort>
    @Autowired private lateinit var mapper: ObjectMapper
    @MockBean private lateinit var google: GoogleIdTokenService
    @MockBean private lateinit var idp: IdpIdTokenVerifier
    @MockBean private lateinit var gameClock: AdventMemberClock
    @MockBean private lateinit var realClock: AdventRealClock

    @Test
    fun `Advent opt in and out keep both devices and HatCast category dispatch intact`() {
        val now = Instant.parse("2026-12-03T11:00:00Z")
        whenever(gameClock.instant()).thenReturn(now)
        whenever(realClock.instant()).thenReturn(now)
        val troupeId = UUID.fromString("a0000001-0000-4000-8000-000000000001")
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mvc, google, "advent-isolation-member", "advent-isolation@example.com", "Membre fictif")
        TestAuthSupport.joinSeedTroupe(mvc, cookie, troupeId)
        val user = users.findByGoogleSub("advent-isolation-member")!!
        val session = mapper.readTree(mvc.perform(get("/v1/advent/session").cookie(cookie)).andExpect(status().isOk).andReturn().response.contentAsString).get("sessionId").asText()
        whenever(realClock.instant()).thenReturn(Instant.parse("2026-11-30T22:59:59Z"))
        mvc.perform(get("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session))
            .andExpect(status().isNotFound)
        whenever(realClock.instant()).thenReturn(now)
        val endpoints = listOf("https://push.example.test/${user.id}/device-a", "https://push.example.test/${user.id}/device-b")
        val unknownEndpoint = mapper.writeValueAsString(mapOf("enabled" to true, "endpoint" to "https://push.example.test/unknown"))
        mvc.perform(put("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session)
            .contentType(MediaType.APPLICATION_JSON).content(unknownEndpoint).with(csrf())).andExpect(status().isConflict)
        mvc.perform(put("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", UUID.randomUUID().toString()).header("X-Advent-Test-Session", session)
            .contentType(MediaType.APPLICATION_JSON).content(unknownEndpoint).with(csrf())).andExpect(status().isConflict)
        mvc.perform(put("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session).header("X-Advent-Simulated-Date", "2026-12-03")
            .contentType(MediaType.APPLICATION_JSON).content(unknownEndpoint).with(csrf())).andExpect(status().isNotFound)
        mvc.perform(get("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(jsonPath("$.enabled").value(false))
        for (endpoint in endpoints) {
            mvc.perform(put("/v1/advent/reminder-device").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session)
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(mapOf("endpoint" to endpoint, "keys" to mapOf("p256dh" to "key", "auth" to "auth")))).with(csrf()))
                .andExpect(status().isOk)
        }
        val validEndpoint = mapper.writeValueAsString(mapOf("enabled" to true, "endpoint" to endpoints.first()))
        mvc.perform(put("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", UUID.randomUUID().toString()).header("X-Advent-Test-Session", session)
            .contentType(MediaType.APPLICATION_JSON).content(validEndpoint).with(csrf())).andExpect(status().isConflict)
        mvc.perform(get("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session))
            .andExpect(status().isOk).andExpect(jsonPath("$.enabled").value(false))
        assertFalse(users.findById(user.id).orElseThrow().pushNotificationsEnabled)
        fun setAdvent(enabled: Boolean, endpoint: String? = null) {
            mvc.perform(put("/v1/advent/reminder-preference").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session)
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(mapOf("enabled" to enabled, "endpoint" to endpoint))).with(csrf()))
                .andExpect(status().isOk).andExpect(jsonPath("$.enabled").value(enabled))
        }
        val disabledCategories = preferences.getPreferences(user.id)
        setAdvent(true, endpoints.first())
        setAdvent(false)
        assertFalse(users.findById(user.id).orElseThrow().pushNotificationsEnabled)
        assertEquals(disabledCategories, preferences.getPreferences(user.id))
        assertTrue(subscriptions.findByUserId(user.id).isEmpty())
        assertEquals(endpoints.toSet(), adventDevices.findByUserId(user.id).map { it.endpoint }.toSet())
        assertFalse(pushEligibility.isPushAllowedForCategory(user.id, NotificationCategory.AVAILABILITY_REQUEST))
        assertFalse(pushEligibility.isPushAllowedForCategory(user.id, NotificationCategory.TEAM_CONFIRMED))
        pushService.registerSubscription(user.id, com.hatcast.api.notification.dto.RegisterPushSubscriptionRequest(
            endpoints.first(), com.hatcast.api.notification.dto.PushSubscriptionKeysDto("key", "auth")), null)
        for ((endpoint, owned) in listOf(endpoints.first() to true, endpoints.last() to false)) {
            mvc.perform(post("/v1/me/push/subscription/status").cookie(cookie)
                .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(mapOf("endpoint" to endpoint))).with(csrf()))
                .andExpect(status().isOk).andExpect(jsonPath("$.owned").value(owned))
        }
        pushService.setGlobalEnabled(user.id, true)
        preferences.patchPreferences(user.id, PatchNotificationPreferencesRequest(mapOf(
            "AVAILABILITY_REQUEST" to PatchNotificationPreferenceDto(push = false, email = true),
            "TEAM_CONFIRMED" to PatchNotificationPreferenceDto(push = true, email = false),
        )))
        val before = preferences.getPreferences(user.id)
        val beforeEndpoints = subscriptions.findByUserId(user.id).map { it.endpoint }.toSet()
        assertEquals(setOf(endpoints.first()), beforeEndpoints)
        val eventId = UUID.randomUUID(); val seasonId = UUID.randomUUID()
        val event = EventEntity(id = eventId, season = SeasonEntity(troupe = TroupeEntity(id = troupeId, name = "Fictif", slug = "fictif"), slug = "saison", title = "Saison"), title = "Spectacle fictif", slug = "spectacle", startsAt = now)
        val events: EventRepository = mock(); whenever(events.findById(eventId)).thenReturn(Optional.of(event))
        val resolver: NotificationRecipientResolver = mock()
        val recipient = listOf(NotificationRecipient(userId = user.id, displayName = "Membre fictif"))
        whenever(resolver.resolveConcernedRosterRecipients(seasonId, eventId)).thenReturn(recipient)
        whenever(resolver.resolveTeamCompleteMemberRecipients(eventId)).thenReturn(recipient)
        val sender: WebPushNotificationSender = mock()
        whenever(sender.sendPush(any(), any(), any(), any())).thenReturn(NotificationDeliveryResult(NotificationChannel.PUSH, NotificationDeliveryStatus.SENT))
        val email: EmailNotificationSender = mock()
        whenever(email.sendEmail(any(), any(), any(), any(), any(), any())).thenReturn(NotificationDeliveryResult(NotificationChannel.EMAIL, NotificationDeliveryStatus.SKIPPED))
        val builder = NotificationPayloadBuilder()
        val dispatcher = NotificationDispatcher(resolver, builder, NotificationEmailBodyBuilder(NotificationEmailProperties(), builder), sender, email, pushEligibility, preferenceEligibility, users, events, mock())
        fun dispatchBoth() {
            for (intent in listOf(NotificationIntent.AVAILABILITY_OPENED, NotificationIntent.TEAM_COMPLETE_MEMBER))
                dispatcher.dispatch(NotificationDispatchContext(intent = intent, eventId = eventId, seasonId = seasonId, troupeId = troupeId))
        }
        fun unchanged() {
            assertTrue(users.findById(user.id).orElseThrow().pushNotificationsEnabled)
            assertEquals(before, preferences.getPreferences(user.id))
            assertEquals(beforeEndpoints, subscriptions.findByUserId(user.id).map { it.endpoint }.toSet())
        }
        setAdvent(true, endpoints.first()); unchanged(); dispatchBoth()
        mvc.perform(post("/v1/advent/reminder-device/status").cookie(cookie).header("X-Advent-User", user.id.toString()).header("X-Advent-Test-Session", session)
            .contentType(MediaType.APPLICATION_JSON).content(mapper.writeValueAsString(mapOf("endpoint" to endpoints.last()))).with(csrf()))
            .andExpect(status().isOk).andExpect(jsonPath("$.owned").value(true))
        setAdvent(false); unchanged(); dispatchBoth()
        setAdvent(true, endpoints.last()); unchanged(); dispatchBoth()
        verify(sender, never()).sendPush(eq(user.id), any(), eq(NotificationIntent.AVAILABILITY_OPENED), any())
        verify(sender, times(3)).sendPush(eq(user.id), any(), eq(NotificationIntent.TEAM_COMPLETE_MEMBER), any())
    }
}
