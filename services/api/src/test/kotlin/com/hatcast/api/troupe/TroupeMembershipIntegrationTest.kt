package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
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

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val seedSeasonSlug = "la-malice-2026-2027"

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
}
