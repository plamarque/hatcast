package com.hatcast.api.event

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val seedSeasonSlug = "la-malice-2026-2027"

    private val mapper = ObjectMapper()

    private fun sessionCookieFromGoogleSignIn(googleSub: String): jakarta.servlet.http.Cookie {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", "event@example.com")
                .claim("name", "Event Test")
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

    private fun createSeasonForEventsTests(cookie: jakarta.servlet.http.Cookie): UUID {
        val createRes =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Saison events tests"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val id = mapper.readTree(createRes.response.contentAsString).get("id").asText()
        return UUID.fromString(id)
    }

    @Test
    fun `season by slug and events crud list scopes`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-event-1")

        mockMvc
            .perform(
                get("/v1/troupes/$seedTroupeId/seasons/by-slug/$seedSeasonSlug").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(seedSeasonId.toString()))
            .andExpect(jsonPath("$.slug").value(seedSeasonSlug))

        val seasonId = createSeasonForEventsTests(cookie)

        val future = Instant.parse("2030-06-15T18:00:00Z")
        val past = Instant.parse("2020-01-10T18:00:00Z")

        val createFuture =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Match futur",
                              "startsAt": "${future}",
                              "description": "Détail",
                              "location": "Salle A"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.title").value("Match futur"))
                .andExpect(jsonPath("$.archived").value(false))
                .andReturn()
        val eventFutureId =
            mapper.readTree(createFuture.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "title": "Vieux spectacle",
                          "startsAt": "${past}"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?page=0&size=10&scope=all").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(2))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?page=0&size=10&scope=upcoming").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].title").value("Match futur"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventFutureId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.archived").value(true))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=upcoming").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.totalElements").value(0))
    }

    @Test
    fun `patch clears optional fields with explicit null`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-event-3")
        val seasonId = createSeasonForEventsTests(cookie)
        val future = Instant.parse("2030-06-15T18:00:00Z")

        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Avec détails",
                              "startsAt": "${future}",
                              "description": "Texte",
                              "location": "Salle B"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = mapper.readTree(createRes.response.contentAsString).get("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "description": null,
                          "location": null
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.description").doesNotExist())
            .andExpect(jsonPath("$.location").doesNotExist())
    }

    @Test
    fun `invalid scope returns 400`() {
        val cookie = sessionCookieFromGoogleSignIn("sub-event-2")
        val seasonId = createSeasonForEventsTests(cookie)
        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=wrong").cookie(cookie),
            ).andExpect(status().isBadRequest)
    }
}
