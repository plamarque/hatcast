package com.hatcast.api.availability

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Tag
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

/**
 * FR17 / story 5.5 — proxy availability is limited to orga/admin (`canManageComposition`).
 * Uses Les Improbots seed (Cabaret de rentrée) without promoting members to troupe admin.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AvailabilityProxyAccessSeedIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    private val seedSeasonId: UUID = UUID.fromString("b0000001-0000-4000-8000-000000000001")
    private val cabaretEventId: UUID = UUID.fromString("c0000001-0000-4000-8000-000000000001")
    private val patriceParticipantId: UUID = UUID.fromString("f0000001-0000-4000-8000-000000000022")

    @Test
    @Tag("FR17")
    fun `seed member Nicolas has no composition rights on Cabaret de rentrée event page`() {
        val cookie = seedMemberCookie("seed-improbots-20", "nicolas-n@seed.improbots.test", "Nicolas N.")

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$cabaretEventId/page")
                    .param("tab", "dispos")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.permissions.isTroupeAdmin").value(false))
            .andExpect(jsonPath("$.permissions.isSeasonOrganizer").value(false))
            .andExpect(jsonPath("$.permissions.eventOrganizerFor").isEmpty)
    }

    @Test
    @Tag("FR17")
    fun `seed member cannot proxy availability for another participant on Cabaret de rentrée`() {
        val cookie = seedMemberCookie("seed-improbots-20", "nicolas-n@seed.improbots.test", "Nicolas N.")
        val proxyPath =
            "/v1/seasons/$seedSeasonId/events/$cabaretEventId/availability/participants/$patriceParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["mc"]}"""),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR17")
    fun `seed troupe admin Patrice can proxy availability on Cabaret de rentrée`() {
        val cookie = seedMemberCookie("seed-improbots-22", "patrice@seed.improbots.test", "Patrice")
        val nicolasParticipantId = UUID.fromString("f0000001-0000-4000-8000-000000000020")
        val proxyPath =
            "/v1/seasons/$seedSeasonId/events/$cabaretEventId/availability/participants/$nicolasParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(cookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player","mc"]}"""),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
    }

    private fun seedMemberCookie(
        googleSub: String,
        email: String,
        name: String,
    ) = TestAuthSupport.sessionCookieFromGoogleSignIn(
        mockMvc = mockMvc,
        googleIdTokenService = googleIdTokenService,
        googleSub = googleSub,
        email = email,
        name = name,
    )
}
