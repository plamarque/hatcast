package com.hatcast.api.event

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventPageIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = TestAuthSupport.memberSessionCookieFromGoogleSignIn(mockMvc, googleIdTokenService, googleSub)
        promoteSeedMemberToAdmin(googleSub)
        return cookie
    }

    private fun promoteSeedMemberToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing test user $googleSub")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing seed membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    @Test
    fun `GET page tab infos aggregates event permissions selectors organizers and categories`() {
        val cookie = memberCookie("sub-event-page-infos-1")
        val eventId = createPublishedEvent(cookie, "event-page-infos")

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$eventId/page")
                    .param("tab", "infos")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.event.id").value(eventId))
            .andExpect(jsonPath("$.permissions.isTroupeAdmin").value(true))
            .andExpect(jsonPath("$.participantSelectors").isArray)
            .andExpect(jsonPath("$.organizers").isArray)
            .andExpect(jsonPath("$.categories").isArray)
            .andExpect(jsonPath("$.availabilitySummary").doesNotExist())
            .andExpect(jsonPath("$.composition").doesNotExist())
    }

    @Test
    fun `GET page tab dispos includes availability summary without composition`() {
        val cookie = memberCookie("sub-event-page-dispos-1")
        val eventId = createPublishedEvent(cookie, "event-page-dispos")

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$eventId/page")
                    .param("tab", "dispos")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.event.id").value(eventId))
            .andExpect(jsonPath("$.availabilitySummary.eventId").value(eventId))
            .andExpect(jsonPath("$.availabilitySummary.participants").isArray)
            .andExpect(jsonPath("$.organizers").doesNotExist())
            .andExpect(jsonPath("$.categories").doesNotExist())
            .andExpect(jsonPath("$.composition").doesNotExist())
    }

    @Test
    fun `GET page tab equipe includes composition`() {
        val cookie = memberCookie("sub-event-page-equipe-1")
        val eventId = createPublishedEvent(cookie, "event-page-equipe")

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$eventId/page")
                    .param("tab", "equipe")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.event.id").value(eventId))
            .andExpect(jsonPath("$.composition.visibility").exists())
            .andExpect(jsonPath("$.composition.slots").isArray)
            .andExpect(jsonPath("$.availabilitySummary").doesNotExist())
    }

    @Test
    fun `GET page by slug resolves event identifier`() {
        val cookie = memberCookie("sub-event-page-slug-1")
        val slug = "event-page-by-slug"
        createPublishedEvent(cookie, slug)

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/by-slug/$slug/page")
                    .param("tab", "infos")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.event.slug").value(slug))
    }

    @Test
    fun `GET page rejects unknown tab`() {
        val cookie = memberCookie("sub-event-page-bad-tab-1")
        val eventId = createPublishedEvent(cookie, "event-page-bad-tab")

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$eventId/page")
                    .param("tab", "activite")
                    .cookie(cookie),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `GET page returns 404 for unknown event`() {
        val cookie = memberCookie("sub-event-page-404-1")
        val missingEventId = "c0000099-0000-4000-8000-000000000099"

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$missingEventId/page")
                    .param("tab", "infos")
                    .cookie(cookie),
            ).andExpect(status().isNotFound)
    }

    private fun createPublishedEvent(
        cookie: jakarta.servlet.http.Cookie,
        slug: String,
    ): String {
        val createRes =
            mockMvc
                .perform(
                    post("/v1/seasons/$seedSeasonId/events")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Event page test $slug",
                              "startsAt": "2027-08-01T19:30:00Z",
                              "slug": "$slug"
                            }
                            """.trimIndent(),
                        ),
                ).andExpect(status().isOk)
                .andReturn()

        val eventId =
            com.fasterxml.jackson.databind
                .ObjectMapper()
                .readTree(createRes.response.contentAsString)
                .get("id")
                .asText()

        mockMvc
            .perform(
                post("/v1/seasons/$seedSeasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        return eventId
    }
}
