package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeUpdateIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    @Test
    fun `PATCH name and description as troupe admin updates identity and keeps slug`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-troupe-update-admin",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        promoteSeedMemberToAdmin("sub-troupe-update-admin")

        val seedSlug = troupeRepository.findById(seedTroupeId).orElseThrow().slug

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"  Nouveau Nom Troupe  ","description":"  Description courte  "}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Nouveau Nom Troupe"))
            .andExpect(jsonPath("$.description").value("Description courte"))
            .andExpect(jsonPath("$.slug").value(seedSlug))
            .andExpect(jsonPath("$.membership.baselineRole").value("TROUPE_ADMIN"))

        val persisted = troupeRepository.findById(seedTroupeId).orElseThrow()
        assert(persisted.name == "Nouveau Nom Troupe")
        assert(persisted.description == "Description courte")
        assert(persisted.slug == seedSlug)
    }

    @Test
    fun `PATCH name rejects non-admin member`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-troupe-update-member",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Tentative"}"""),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `PATCH rejects blank name`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-troupe-update-blank",
            )
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        promoteSeedMemberToAdmin("sub-troupe-update-blank")

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"   "}"""),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `PATCH name as platform admin updates name without membership`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-platform-troupe-nav",
                email = "platform-members-admin@hatcast.test",
                name = "Platform Troupe Update",
            )
        val seedSlug = troupeRepository.findById(seedTroupeId).orElseThrow().slug

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId")
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"name":"Nom plateforme"}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Nom plateforme"))
            .andExpect(jsonPath("$.slug").value(seedSlug))
            .andExpect(jsonPath("$.membership.displayName").value("Administration plateforme"))
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }
}
