package com.hatcast.api.troupe

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import jakarta.servlet.http.Cookie
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformAdminDemoCompositionIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val platformAdminEmail = "platform-demo-compose@hatcast.test"
    private val demoTroupeId = "a0000001-0000-4000-8000-000000000099"
    private val demoSeasonId = "b0000001-0000-4000-8000-000000000099"
    private val demoPreparingEventId = "c0000004-0000-4000-8000-000000000099"

    @Test
    fun `platform admin with demo member membership can open availability`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(
                post("/v1/troupes/$demoTroupeId/memberships/me")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))

        mockMvc
            .perform(
                post("/v1/seasons/$demoSeasonId/events/$demoPreparingEventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.availabilityOpenedAt").exists())
    }

    private fun platformAdminCookie(): Cookie =
        TestAuthSupport.sessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            "sub-platform-demo-compose",
            email = platformAdminEmail,
            name = "Platform Demo Compose",
        )
}
