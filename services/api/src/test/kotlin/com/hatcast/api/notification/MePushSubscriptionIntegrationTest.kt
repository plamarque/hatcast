package com.hatcast.api.notification

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.hamcrest.Matchers.nullValue
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(
    properties = [
        "hatcast.web-push.vapid-public-key=",
        "hatcast.web-push.vapid-private-key=",
    ],
)
class MePushSubscriptionIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var subscriptionRepository: UserPushSubscriptionRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    private fun registerBodyFor(endpoint: String) =
        """
        {
          "endpoint": "$endpoint",
          "keys": {
            "p256dh": "BNcRdreALRFXkOQiC5lIq62d3uN4UqD2V0uF20jEj1W0",
            "auth": "tBHItJI5svbpez7KI4CCXg"
          }
        }
        """.trimIndent()

    @Test
    fun `get push status requires authentication`() {
        mockMvc
            .perform(get("/v1/me/push"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `register subscription enables push and persists endpoint`() {
        val cookie = signInAndJoin("sub-push-reg", "push-reg@example.com", "Push Reg")
        val user = userRepository.findByGoogleSub("sub-push-reg")!!
        val endpoint = "https://fcm.googleapis.com/fcm/send/test-reg-${user.id}"

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerBodyFor(endpoint))
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(true))
            .andExpect(jsonPath("$.subscriptionCount").value(1))

        val refreshed = userRepository.findById(user.id).orElseThrow()
        assertTrue(refreshed.pushNotificationsEnabled)
        assertEquals(1, subscriptionRepository.findByUserId(user.id).size)
    }

    @Test
    fun `register same endpoint is idempotent`() {
        val cookie = signInAndJoin("sub-push-idem", "push-idem@example.com", "Push Idem")
        val endpoint = "https://fcm.googleapis.com/fcm/send/test-idem-${userRepository.findByGoogleSub("sub-push-idem")!!.id}"
        val body = registerBodyFor(endpoint)

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.subscriptionCount").value(1))
    }

    @Test
    fun `register same endpoint under another account reassigns subscription`() {
        val firstCookie = signInAndJoin("sub-push-owner-a", "push-owner-a@example.com", "Push Owner A")
        val secondCookie = signInAndJoin("sub-push-owner-b", "push-owner-b@example.com", "Push Owner B")
        val firstUser = userRepository.findByGoogleSub("sub-push-owner-a")!!
        val secondUser = userRepository.findByGoogleSub("sub-push-owner-b")!!
        val endpoint = "https://fcm.googleapis.com/fcm/send/shared-browser-endpoint"
        val body = registerBodyFor(endpoint)

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(firstCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(true))
            .andExpect(jsonPath("$.subscriptionCount").value(1))

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(secondCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(true))
            .andExpect(jsonPath("$.subscriptionCount").value(1))

        assertEquals(0, subscriptionRepository.findByUserId(firstUser.id).size)
        assertEquals(1, subscriptionRepository.findByUserId(secondUser.id).size)
        assertFalse(userRepository.findById(firstUser.id).orElseThrow().pushNotificationsEnabled)
        assertTrue(userRepository.findById(secondUser.id).orElseThrow().pushNotificationsEnabled)
    }

    @Test
    fun `get push status reflects enabled after register`() {
        val cookie = signInAndJoin("sub-push-get", "push-get@example.com", "Push Get")
        val endpoint = "https://fcm.googleapis.com/fcm/send/test-get-${userRepository.findByGoogleSub("sub-push-get")!!.id}"

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerBodyFor(endpoint))
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/me/push").cookie(cookie).param("browserPermission", "granted"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(true))
            .andExpect(jsonPath("$.browserPermission").value("granted"))
            .andExpect(jsonPath("$.subscriptionCount").value(1))
    }

    @Test
    fun `delete subscription by endpoint disables when last removed`() {
        val cookie = signInAndJoin("sub-push-del", "push-del@example.com", "Push Del")
        val user = userRepository.findByGoogleSub("sub-push-del")!!
        val endpoint = "https://fcm.googleapis.com/fcm/send/test-del-${user.id}"

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerBodyFor(endpoint))
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                delete("/v1/me/push/subscription")
                    .cookie(cookie)
                    .param("endpoint", endpoint)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(false))
            .andExpect(jsonPath("$.subscriptionCount").value(0))

        val refreshed = userRepository.findById(user.id).orElseThrow()
        assertFalse(refreshed.pushNotificationsEnabled)
    }

    @Test
    fun `patch enabled false removes all subscriptions`() {
        val cookie = signInAndJoin("sub-push-patch", "push-patch@example.com", "Push Patch")
        val user = userRepository.findByGoogleSub("sub-push-patch")!!
        val endpoint1 = "https://fcm.googleapis.com/fcm/send/test-patch-a-${user.id}"
        val endpoint2 = "https://fcm.googleapis.com/fcm/send/test-patch-b-${user.id}"

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerBodyFor(endpoint1))
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/me/push/subscription")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(registerBodyFor(endpoint2))
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.subscriptionCount").value(2))

        mockMvc
            .perform(
                patch("/v1/me/push")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"enabled": false}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.enabled").value(false))
            .andExpect(jsonPath("$.subscriptionCount").value(0))

        assertEquals(0, subscriptionRepository.findByUserId(user.id).size)
        assertFalse(userRepository.findById(user.id).orElseThrow().pushNotificationsEnabled)
    }

    @Test
    fun `public config returns vapid public key field`() {
        mockMvc
            .perform(get("/v1/config/public"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.webPushVapidPublicKey").value(nullValue()))
    }

    private fun signInAndJoin(
        googleSub: String,
        email: String,
        name: String,
    ) = signIn(googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name)
}
