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
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlatformAdminTroupeNavigationIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val platformAdminEmail = "platform-members-admin@hatcast.test"
    private val seedTroupeId = "a0000001-0000-4000-8000-000000000001"
    private val seedSeasonId = "b0000001-0000-4000-8000-000000000001"
    private val seedSeasonSlug = "les-improbots-2026-2027"

    @Test
    fun `platform admin resolves troupe by slug without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/admin/troupes/by-slug/les-improbots").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(seedTroupeId))
            .andExpect(jsonPath("$.slug").value("les-improbots"))
            .andExpect(jsonPath("$.name").value("Les Improbots"))
    }

    @Test
    fun `non platform admin cannot resolve troupe by slug`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-non-platform-troupe-slug",
                email = "non-platform@hatcast.test",
                name = "Non Platform",
            )

        mockMvc
            .perform(get("/v1/admin/troupes/by-slug/les-improbots").cookie(cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `platform admin lists seasons without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons?page=0&size=10").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.content[0].slug").exists())
    }

    @Test
    fun `platform admin resolves season by slug without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/admin/seasons/by-slug/$seedSeasonSlug").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].troupe.slug").value("les-improbots"))
            .andExpect(jsonPath("$[0].season.slug").value(seedSeasonSlug))
    }

    @Test
    fun `platform admin gets season permissions without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/permissions/me").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.canManageSeasonParticipants").value(true))
            .andExpect(jsonPath("$.canManageMembers").value(true))
            .andExpect(jsonPath("$.isTroupeAdmin").value(true))
    }

    @Test
    fun `platform admin manages season participants without troupe membership`() {
        val cookie = platformAdminCookie()
        val operatorEmail = "platform-operator-participant@hatcast.test"

        mockMvc
            .perform(
                post("/v1/seasons/$seedSeasonId/participants")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Platform Operator","email":"$operatorEmail"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Platform Operator"))
            .andExpect(jsonPath("$.email").value(operatorEmail))

        mockMvc
            .perform(get("/v1/seasons/$seedSeasonId/participants").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == '$operatorEmail')].displayName").value("Platform Operator"))
    }

    @Test
    fun `platform admin lists demo troupe in discover without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/troupes/discover").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'demo')].name").value("Démo"))
    }

    @Test
    fun `platform admin my troupes excludes demo without membership`() {
        val cookie = platformAdminCookie()

        mockMvc
            .perform(get("/v1/troupes").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'demo')]").isEmpty)
    }

    @Test
    fun `authenticated member lists demo troupe in discover without membership`() {
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-member-demo-discover",
                email = "member-demo-discover@hatcast.test",
                name = "Member Demo Discover",
            )

        mockMvc
            .perform(get("/v1/troupes/discover").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'demo')].name").value("Démo"))
    }

    private fun platformAdminCookie(): Cookie =
        TestAuthSupport.sessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            "sub-platform-troupe-nav",
            email = platformAdminEmail,
            name = "Platform Nav",
        )
}
