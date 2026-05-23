package com.hatcast.api.availability

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
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
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvailabilityControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Availability Test",
            )
        promoteSeedMemberToAdmin(googleSub)
        return cookie
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id) ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun signInOnly(googleSub: String): jakarta.servlet.http.Cookie {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", "$googleSub@example.com")
                .claim("name", "Outsider")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)
        val result =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        return result.response.getCookie("HATCAST_SESSION")!!
    }

    private fun createSeasonAndEvent(cookie: jakarta.servlet.http.Cookie): Pair<UUID, UUID> {
        val createSeason =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Saison dispos"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId = UUID.fromString(mapper.readTree(createSeason.response.contentAsString).get("id").asText())

        val future = Instant.parse("2031-03-20T19:00:00Z")
        val createEvent =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Spectacle dispo",
                              "startsAt": "$future"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(createEvent.response.contentAsString).get("id").asText())
        return seasonId to eventId
    }

    @Test
    fun `availability three states persist and list includes myAvailabilityStatus`() {
        val cookie = memberCookie("sub-avail-1")
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.updatedAt").exists())

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=all&size=20")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$eventId')].myAvailabilityStatus").value("available"))

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unavailable"))

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unknown"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events?scope=all&size=20")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$eventId')].myAvailabilityStatus").value("unknown"))
    }

    @Test
    fun `non member cannot read or write availability`() {
        val member = memberCookie("sub-avail-member")
        val outsider = signInOnly("sub-avail-outsider")
        val (seasonId, eventId) = createSeasonAndEvent(member)
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(get(base).cookie(outsider))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                put(base)
                    .cookie(outsider)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }
}
