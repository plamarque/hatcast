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

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

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
    fun `member can list seasons after join`() {
        val cookie = TestAuthSupport.sessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, "sub-membership-3")
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons?page=0&size=5").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
    }
}
