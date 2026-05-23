package com.hatcast.api.season

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.availability.EventAvailabilityRepository
import com.hatcast.api.event.EventRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SeasonDeleteIntegrationTest {
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

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()
    private val platformAdminEmail = "platform-admin@hatcast.test"

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
            )
        promoteSeedMemberToAdmin(googleSub)
        return cookie
    }

    private fun memberOnlyCookie(googleSub: String): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = "$googleSub@example.com",
        )

    private fun platformAdminMemberCookie(googleSub: String): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = platformAdminEmail,
        )

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id) ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie, title: String = "Saison à supprimer"): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"$title"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    @Test
    fun `troupe admin deletes season returns 204 and season is gone`() {
        val cookie = adminCookie("sub-delete-admin-1")
        val seasonId = createSeason(cookie, "Delete me admin")

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(cookie))
            .andExpect(status().isNotFound)

        assertFalse(seasonRepository.existsById(seasonId))
    }

    @Test
    fun `member without troupe admin cannot delete season`() {
        val cookie = memberOnlyCookie("sub-delete-member-1")
        val adminCookie = adminCookie("sub-delete-admin-helper")
        val seasonId = createSeason(adminCookie, "Protected season")

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        assertTrue(seasonRepository.existsById(seasonId))
    }

    @Test
    fun `platform admin deletes without troupe admin role`() {
        val cookie = platformAdminMemberCookie("sub-delete-platform-1")
        val adminCookie = adminCookie("sub-delete-admin-helper-2")
        val seasonId = createSeason(adminCookie, "Platform delete target")

        mockMvc
            .perform(get("/v1/auth/me").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.platformAdmin").value(true))

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(adminCookie))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `second delete returns 404`() {
        val cookie = adminCookie("sub-delete-idempotent")
        val seasonId = createSeason(cookie, "Idempotent delete")

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNotFound)
    }

    @Test
    fun `delete cascades events and availability`() {
        val cookie = adminCookie("sub-delete-cascade")
        val seasonId = createSeason(cookie, "Cascade season")
        val future = Instant.parse("2032-06-15T20:00:00Z")

        val eventRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Spectacle cascade",
                              "startsAt": "$future"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(eventRes.response.contentAsString).get("id").asText())

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        assertEquals(1, eventRepository.findBySeason_IdOrderByStartsAtAsc(seasonId, org.springframework.data.domain.PageRequest.of(0, 10)).totalElements)
        val user = userRepository.findByGoogleSub("sub-delete-cascade")!!
        assertTrue(availabilityRepository.findByEvent_IdAndUser_Id(eventId, user.id) != null)

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        assertFalse(eventRepository.existsById(eventId))
        assertFalse(availabilityRepository.findByEvent_IdAndUser_Id(eventId, user.id) != null)
    }
}
