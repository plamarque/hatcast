package com.hatcast.api.notification

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
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
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MeNotificationPreferencesIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    @Test
    fun `get notification preferences returns all categories enabled by default`() {
        val cookie = signInAndJoin("sub-notif-pref-get", "notif-pref-get@example.com", "Notif Pref Get")

        mockMvc
            .perform(get("/v1/me/notification-preferences").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$.categories.length()").value(
                    NotificationCategory.entries.size - HIDDEN_NOTIFICATION_PREFERENCE_CATEGORIES.size,
                ),
            )
            .andExpect(jsonPath("$.categories[?(@.key == 'COMPOSITION_SHARED')]").isEmpty)
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].label").exists())
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].pushEnabled").value(true))
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].emailEnabled").value(true))
            .andExpect(jsonPath("$.categories[?(@.key == 'REMINDER_1_DAY')].pushEnabled").value(true))
            .andExpect(jsonPath("$.categories[?(@.key == 'REMINDER_1_DAY')].emailEnabled").value(true))
            .andExpect(jsonPath("$.categories[?(@.key == 'ORG_ASSIGNEE_DECLINED')].pushEnabled").value(false))
            .andExpect(jsonPath("$.categories[?(@.key == 'ORG_ASSIGNEE_DECLINED')].emailEnabled").value(false))
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].pushEnabled").value(true))
    }

    @Test
    fun `organizer scope is true for troupe admin`() {
        val googleSub = "sub-notif-pref-orga-scope"
        val cookie = signInAndJoin(googleSub, "notif-pref-orga-scope@example.com", "Orga Scope")
        val user = userRepository.findByGoogleSub(googleSub)!!
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)!!
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)

        mockMvc
            .perform(get("/v1/me/notification-preferences").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.hasOrganizerScope").value(true))
    }

    @Test
    fun `patch notification preferences merges partial category update`() {
        val cookie = signInAndJoin("sub-notif-pref-patch", "notif-pref-patch@example.com", "Notif Pref Patch")
        val user = userRepository.findByGoogleSub("sub-notif-pref-patch")!!

        mockMvc
            .perform(
                patch("/v1/me/notification-preferences")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferences":{"AVAILABILITY_REQUEST":{"push":false}}}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].pushEnabled").value(false))
            .andExpect(jsonPath("$.categories[?(@.key == 'AVAILABILITY_REQUEST')].emailEnabled").value(true))
            .andExpect(jsonPath("$.categories[?(@.key == 'CONFIRMATION_REQUEST')].pushEnabled").value(true))

        val refreshed = userRepository.findById(user.id).orElseThrow()
        assertFalse(refreshed.notificationPreferences[NotificationCategory.AVAILABILITY_REQUEST]?.push ?: true)
        assertTrue(refreshed.notificationPreferences[NotificationCategory.AVAILABILITY_REQUEST]?.email ?: true)
    }

    @Test
    fun `patch notification preferences rejects unknown category`() {
        val cookie = signInAndJoin("sub-notif-pref-invalid", "notif-pref-invalid@example.com", "Notif Pref Invalid")

        mockMvc
            .perform(
                patch("/v1/me/notification-preferences")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferences":{"BOGUS":{"push":false}}}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `get notification preferences requires authentication`() {
        mockMvc
            .perform(get("/v1/me/notification-preferences"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `patch notification preferences requires authentication`() {
        mockMvc
            .perform(
                patch("/v1/me/notification-preferences")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferences":{"AVAILABILITY_REQUEST":{"push":false}}}""")
                    .with(csrf()),
            ).andExpect(status().isUnauthorized)
    }

    private fun signInAndJoin(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
    }
}
