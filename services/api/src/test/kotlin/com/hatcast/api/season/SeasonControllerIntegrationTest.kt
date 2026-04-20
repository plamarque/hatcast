package com.hatcast.api.season

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import java.time.Instant
import java.util.UUID

/**
 * CSRF requis sur mutations ; session obtenue comme [com.hatcast.api.auth.AuthControllerIntegrationTest].
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeasonControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")

    private fun sessionCookieFromGoogleSignIn(googleSub: String): jakarta.servlet.http.Cookie {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", "season@example.com")
                .claim("name", "Season Test")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)
        val result =
            mockMvc
                .perform(
                    post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        return result.response.getCookie("HATCAST_SESSION")!!
    }

    @Test
    fun ` seasons flow list create activate archive pagination`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-season-1")
        // GET /v1/troupes
        mockMvc
            .perform(
                get("/v1/troupes").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.[0].id").value(seedTroupeId.toString()))
            .andExpect(jsonPath("$.[0].slug").value("la-malice"))

        // list : saison seed Flyway V4 (La Malice 2026-2027) + aucune autre
        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons?page=0&size=10")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))

        // create
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Malice 2026-2027",
                              "description": "Saison test"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.slug").value("malice-2026-2027"))
                .andExpect(jsonPath("$.active").value(false))
                .andReturn()
        // extract id
        val body = createRes.response.contentAsString
        val id1 =
            com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(body)
                .get("id")
                .asText()
        val s1 = UUID.fromString(id1)

        // create second
        val id2Res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            { "title": "Malice 2025-2026" }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.slug").value("malice-2025-2026"))
                .andReturn()
        val id2Text =
            com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(id2Res.response.contentAsString)
                .get("id")
                .asText()
        val s2 = UUID.fromString(id2Text)

        // activate s2
        mockMvc
            .perform(
                post("/v1/seasons/$s2/actions/activate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.active").value(true))

        // s1 not active
        mockMvc
            .perform(
                get("/v1/seasons/$s1")
                    .cookie(cookie),
            ).andExpect(jsonPath("$.active").value(false))

        // activate s1; s2 deactivates
        mockMvc
            .perform(
                post("/v1/seasons/$s1/actions/activate")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(jsonPath("$.active").value(true))
        mockMvc
            .perform(
                get("/v1/seasons/$s2")
                    .cookie(cookie),
            ).andExpect(jsonPath("$.active").value(false))

        // pagination: size 1 page 0 => one result
        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons?page=0&size=1")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content.length()").value(1))
            .andExpect(jsonPath("$.totalElements").value(3))

        // archive s1
        mockMvc
            .perform(
                post("/v1/seasons/$s1/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(jsonPath("$.archived").value(true))
            .andExpect(jsonPath("$.active").value(false))
    }

    @Test
    fun `forbidden for non-seed troupe`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-season-2")
        val other = "00000000-0000-0000-0000-00000000feed"
        mockMvc
            .perform(
                get("/v1/troupes/$other/seasons")
                    .cookie(cookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `same title twice yields unique slugs a and a-2`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-season-3")
        val json =
            """
            { "title": "Saison jumelle" }
            """.trimIndent()
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("saison-jumelle"))
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/seasons")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(json)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("saison-jumelle-2"))
    }
}
