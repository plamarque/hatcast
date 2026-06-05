package com.hatcast.api.memberprofile

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.RoleKeys
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertTrue
import java.time.Instant
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MemberProfileIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")

    @Test
    fun `preferred roles default returns all role keys when never saved`() {
        val cookie = signInAndJoin("sub-profile-pref-default", "profile-pref-default@example.com", "Pref Default")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.preferredRoleKeys.length()").value(RoleKeys.ALL.size))
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'volunteer')]").exists())
    }

    @Test
    fun `put preferred roles persists and enforces volunteer`() {
        val cookie = signInAndJoin("sub-profile-pref-put", "profile-pref-put@example.com", "Pref Put")

        mockMvc
            .perform(
                put("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["player","mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'player')]").exists())
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'mc')]").exists())
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'volunteer')]").exists())

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'volunteer')]").exists())
    }

    @Test
    fun `invalid preferred role key returns 400`() {
        val cookie = signInAndJoin("sub-profile-pref-invalid", "profile-pref-invalid@example.com", "Pref Invalid")

        mockMvc
            .perform(
                put("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["player","not_a_role","volunteer"]}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `non member cannot get or put preferred roles`() {
        val cookie = signIn("sub-profile-pref-forbidden", "profile-pref-forbidden@example.com", "Pref Forbidden")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                put("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["player","volunteer"]}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `put preferred roles requires csrf`() {
        val cookie = signInAndJoin("sub-profile-pref-csrf", "profile-pref-csrf@example.com", "Pref CSRF")

        mockMvc
            .perform(
                put("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["player","volunteer"]}"""),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `member profile summary returns identity and empty stats for self`() {
        val cookie = signInAndJoin("sub-profile-summary-self", "profile-summary-self@example.com", "Summary Self")
        val userId = userRepository.findByGoogleSub("sub-profile-summary-self")!!.id

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/member-profile/$userId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.userId").value(userId.toString()))
            .andExpect(jsonPath("$.displayName").exists())
            .andExpect(jsonPath("$.isSelf").value(true))
            .andExpect(jsonPath("$.stats").doesNotExist())
            .andExpect(jsonPath("$.monthlyChart").isArray)
            .andExpect(jsonPath("$.monthlyChart.length()").value(0))
            .andExpect(jsonPath("$.favoriteRoleCounts.length()").value(0))
            .andExpect(jsonPath("$.preferredRoleKeys").isArray)
    }

    @Test
    fun `member can view another troupe member profile without preferred roles`() {
        val viewerCookie = signInAndJoin("sub-profile-viewer", "profile-viewer@example.com", "Viewer")
        val targetCookie = signInAndJoin("sub-profile-target", "profile-target@example.com", "Target")
        val targetUserId = userRepository.findByGoogleSub("sub-profile-target")!!.id

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/member-profile/$targetUserId").cookie(viewerCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.userId").value(targetUserId.toString()))
            .andExpect(jsonPath("$.isSelf").value(false))
            .andExpect(jsonPath("$.preferredRoleKeys").doesNotExist())

        assertTrue(targetCookie.name.isNotEmpty())
    }

    @Test
    fun `member profile summary omits avatarUrl when avatar bytes missing`() {
        val cookie = signInAndJoin("sub-profile-avatar-guard", "profile-avatar-guard@example.com", "Avatar Guard")
        val user = userRepository.findByGoogleSub("sub-profile-avatar-guard")!!
        user.avatarUpdatedAt = Instant.now()
        userRepository.save(user)

         mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/member-profile/${user.id}").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.avatarUrl").isEmpty)
    }

    @Test
    fun `non member cannot load member profile summary`() {
        val cookie = signIn("sub-profile-summary-forbidden", "profile-summary-forbidden@example.com", "Forbidden")
        val randomUserId = UUID.randomUUID()

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/member-profile/$randomUserId").cookie(cookie))
            .andExpect(status().isForbidden)
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
