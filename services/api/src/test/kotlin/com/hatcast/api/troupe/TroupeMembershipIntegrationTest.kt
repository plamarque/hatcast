package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeMembershipIntegrationTest {
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
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val seedSeasonSlug = "la-malice-2026-2027"
    private val mapper = ObjectMapper()

    @Test
    fun `join seed troupe is idempotent and lists membership troupes only`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-1")

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
            .andExpect(jsonPath("$.displayName").exists())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$.[0].id").value(seedTroupeId.toString()))
            .andExpect(jsonPath("$.[0].slug").value("la-malice"))
            .andExpect(jsonPath("$.[0].membership.status").value("ACTIVE"))
            .andExpect(jsonPath("$.[0].membership.baselineRole").value("MEMBER"))
    }

    @Test
    fun `non member cannot list seasons for troupe`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-2")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `non member cannot access member only season event and permission routes`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-4")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons/by-slug/$seedSeasonSlug").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/events").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/permissions/me").cookie(cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `membership lookup returns not found for non member`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-5")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/memberships/me").cookie(cookie))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `direct join is limited to seed troupe`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-6")
        val otherTroupeId = UUID.randomUUID()
        troupeRepository.save(
            TroupeEntity(
                id = otherTroupeId,
                name = "Private ${otherTroupeId.toString().take(8)}",
                slug = "private-${otherTroupeId.toString().take(8)}",
            ),
        )

        mockMvc
            .perform(
                post("/v1/troupes/$otherTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `join seed troupe requires csrf`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-7")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/memberships/me")
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `member can list seasons after join`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-3")
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons?page=0&size=5").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
    }

    @Test
    fun `troupe admin can list add update and deactivate members`() {
        val adminCookie = signInAndJoin("sub-admin-members-1", "admin-members-1@example.com", "Admin Members")
        promoteSeedMemberToAdmin("sub-admin-members-1")
        signIn("sub-target-members-1", "target-members-1@example.com", "Target Member")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(adminCookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "email": " TARGET-MEMBERS-1@example.com ",
                              "displayName": "Pseudo cible"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.email").value("target-members-1@example.com"))
                .andExpect(jsonPath("$.displayName").value("Pseudo cible"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
                .andReturn()

        val membershipId = UUID.fromString(mapper.readTree(addResult.response.contentAsString).path("id").asText())

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.email == 'target-members-1@example.com')]").exists())

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Pseudo modifié","baselineRole":"TROUPE_ADMIN"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Pseudo modifié"))
            .andExpect(jsonPath("$.baselineRole").value("TROUPE_ADMIN"))

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members?page=0&size=100").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$membershipId')].status").value("INACTIVE"))
    }

    @Test
    fun `non admin member cannot manage members or create seasons`() {
        val cookie = signInAndJoin("sub-ordinary-members-1", "ordinary-members-1@example.com", "Ordinary Member")

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/members").cookie(cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"title":"Forbidden season"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `last active troupe admin cannot be demoted or deactivated`() {
        val troupeId = UUID.randomUUID()
        val cookie = signIn("sub-last-admin-1", "last-admin-1@example.com", "Last Admin")
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Guard ${troupeId.toString().take(8)}",
                    slug = "guard-${troupeId.toString().take(8)}",
                ),
            )
        val user = userRepository.findByGoogleSub("sub-last-admin-1")!!
        val membership =
            membershipRepository.save(
                TroupeMembershipEntity(
                    troupe = troupe,
                    user = user,
                    status = TroupeMembershipStatus.ACTIVE,
                    baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                    displayName = "Last Admin",
                ),
            )

        mockMvc
            .perform(
                patch("/v1/troupes/$troupeId/members/${membership.id}")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"baselineRole":"MEMBER"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                delete("/v1/troupes/$troupeId/members/${membership.id}")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `last active troupe admin cannot be demoted via add member`() {
        val troupeId = UUID.randomUUID()
        val cookie = signIn("sub-last-admin-add-1", "last-admin-add-1@example.com", "Last Admin Add")
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Guard Add ${troupeId.toString().take(8)}",
                    slug = "guard-add-${troupeId.toString().take(8)}",
                ),
            )
        val user = userRepository.findByGoogleSub("sub-last-admin-add-1")!!
        membershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                baselineRole = TroupeBaselineRole.TROUPE_ADMIN,
                displayName = "Last Admin Add",
            ),
        )

        mockMvc
            .perform(
                post("/v1/troupes/$troupeId/members")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"last-admin-add-1@example.com","baselineRole":"MEMBER"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `troupe admin can reactivate inactive member via add`() {
        val adminCookie = signInAndJoin("sub-reactivate-admin-1", "reactivate-admin-1@example.com", "Reactivate Admin")
        promoteSeedMemberToAdmin("sub-reactivate-admin-1")
        signIn("sub-reactivate-target-1", "reactivate-target-1@example.com", "Reactivate Target")
        val targetUser = userRepository.findByGoogleSub("sub-reactivate-target-1")!!
        val inactiveMembership =
            membershipRepository.save(
                TroupeMembershipEntity(
                    troupe = troupeRepository.findById(seedTroupeId).orElseThrow(),
                    user = targetUser,
                    status = TroupeMembershipStatus.INACTIVE,
                    baselineRole = TroupeBaselineRole.MEMBER,
                    displayName = "Inactive Target",
                ),
            )

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"reactivate-target-1@example.com","displayName":"Reactivated"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(inactiveMembership.id.toString()))
            .andExpect(jsonPath("$.status").value("ACTIVE"))
            .andExpect(jsonPath("$.displayName").value("Reactivated"))
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))
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

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id) ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }
}
