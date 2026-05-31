package com.hatcast.api.user

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.RoleKeys
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeMembershipRepository
import org.junit.jupiter.api.Assertions.assertEquals
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MeMemberPreferencesIntegrationTest {
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
    private val secondTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000002")

    @Test
    fun `get preferences returns resolved display name and default roles`() {
        val cookie = signInAndJoin("sub-me-pref-get", "me-pref-get@example.com", "Me Pref Get")

        mockMvc
            .perform(get("/v1/me/preferences").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.memberDisplayName").value("Me Pref Get"))
            .andExpect(jsonPath("$.preferredRoleKeys.length()").value(RoleKeys.ALL.size))
    }

    @Test
    fun `patch preferences updates account and syncs all active memberships`() {
        val cookie =
            signInAndJoinTwoTroupes(
                "sub-me-pref-sync",
                "me-pref-sync@example.com",
                "Old Name",
            )
        val user = userRepository.findByGoogleSub("sub-me-pref-sync")!!

        mockMvc
            .perform(
                patch("/v1/me/preferences")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"memberDisplayName":"Pseudo Global","preferredRoleKeys":["player","mc"]}""",
                    )
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.memberDisplayName").value("Pseudo Global"))
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'volunteer')]").exists())

        val refreshedUser = userRepository.findById(user.id).orElseThrow()
        assertEquals("Pseudo Global", refreshedUser.memberDisplayName)

        val memberships = membershipRepository.findActiveByUserId(user.id)
        org.junit.jupiter.api.Assertions.assertTrue(memberships.size >= 2)
        memberships.forEach { membership ->
            assertEquals("Pseudo Global", membership.displayName)
            org.junit.jupiter.api.Assertions.assertEquals(
                setOf("player", "mc", "volunteer"),
                membership.preferredRoleKeys.toSet(),
            )
        }
    }

    @Test
    fun `troupe preferred roles endpoint reads account preferences`() {
        val cookie = signInAndJoin("sub-me-pref-troupe-get", "me-pref-troupe@example.com", "Troupe Get")

        mockMvc
            .perform(
                patch("/v1/me/preferences")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["player","volunteer"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'player')]").exists())
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'volunteer')]").exists())
    }

    @Test
    fun `put troupe preferred roles updates account for all troupes`() {
        val cookie =
            signInAndJoinTwoTroupes(
                "sub-me-pref-troupe-put",
                "me-pref-troupe-put@example.com",
                "Put Roles",
            )
        val user = userRepository.findByGoogleSub("sub-me-pref-troupe-put")!!

        mockMvc
            .perform(
                put("/v1/troupes/$seedTroupeId/memberships/me/preferred-roles")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"preferredRoleKeys":["dj","volunteer"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.preferredRoleKeys[?(@ == 'dj')]").exists())

        membershipRepository.findActiveByUserId(user.id).forEach { membership ->
            assertEquals(listOf("dj", "volunteer"), membership.preferredRoleKeys.sorted())
        }
    }

    @Test
    fun `patch preferences requires csrf`() {
        val cookie = signInAndJoin("sub-me-pref-csrf", "me-pref-csrf@example.com", "CSRF")

        mockMvc
            .perform(
                patch("/v1/me/preferences")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"memberDisplayName":"X"}"""),
            ).andExpect(status().isForbidden)
    }

    private fun signInAndJoin(
        googleSub: String,
        email: String,
        name: String,
    ) = signIn(googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
    }

    private fun signInAndJoinTwoTroupes(
        googleSub: String,
        email: String,
        name: String,
    ) = signIn(googleSub, email, name).also { cookie ->
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, secondTroupeId)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub, email, name)
}
