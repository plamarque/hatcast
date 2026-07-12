package com.hatcast.api.troupe

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipationMode
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.Cookie
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TroupeMembershipLifecycleIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var membershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @Test
    fun `member to externe preserves past MEMBER_SYNC and converts active season per choice`() {
        val adminCookie = signInAdmin("sub-lifecycle-admin", "lifecycle-admin@example.com", "Admin LC")
        val memberCookie = signIn("sub-lifecycle-member", "lifecycle-member@example.com", "Laetitia LC")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        assertEquals(TroupeBaselineRole.MEMBER, membership.baselineRole)

        val pastSeason = createSeason(adminCookie, "Past season LC")
        val activeSeason = createSeason(adminCookie, "Active season LC")
        activateSeason(pastSeason)
        activateSeason(activeSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(pastSeason).orElseThrow())
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(activeSeason).orElseThrow())

        archiveSeason(adminCookie, pastSeason)

        val pastRow =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(pastSeason, membership.id)!!
        assertEquals(SeasonParticipationMode.MEMBER_SYNC, pastRow.participationMode)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(activeSeason.toString()),
                                "seasonsToRemove" to emptyList<String>(),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.baselineRole").value("EXTERNE"))

        val updatedMembership = membershipRepository.findById(membership.id).orElseThrow()
        assertEquals(TroupeBaselineRole.EXTERNE, updatedMembership.baselineRole)

        val pastAfter =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(pastSeason, membership.id)!!
        assertEquals(SeasonParticipationMode.MEMBER_SYNC, pastAfter.participationMode)
        assertEquals(ParticipantStatus.ACTIVE, pastAfter.status)

        val activeAfter =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(activeSeason, membership.id)!!
        assertEquals(SeasonParticipationMode.GUEST_SEASON, activeAfter.participationMode)
        assertEquals(ParticipantStatus.ACTIVE, activeAfter.status)

        val newSeason = createSeason(adminCookie, "Future season LC")
        activateSeason(newSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(newSeason).orElseThrow())
        val futureRow = seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(newSeason, membership.id)
        assertEquals(null, futureRow)

        mockMvc
            .perform(get("/v1/seasons/$pastSeason").cookie(memberCookie))
            .andExpect(status().isOk)
    }

    @Test
    fun `externe to member resyncs active seasons as MEMBER_SYNC`() {
        val adminCookie = signInAdmin("sub-lifecycle-reint", "lifecycle-reint@example.com", "Admin Reint")
        signIn("sub-lifecycle-reint-member", "lifecycle-reint-member@example.com", "Guest Reint")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-reint-member")!!
        var membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val activeSeason = createSeason(adminCookie, "Reint season")
        activateSeason(activeSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(activeSeason).orElseThrow())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(activeSeason.toString()),
                                "seasonsToRemove" to emptyList<String>(),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)

        membership = membershipRepository.findById(membership.id).orElseThrow()
        assertEquals(TroupeBaselineRole.EXTERNE, membership.baselineRole)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-member")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.baselineRole").value("MEMBER"))

        val row =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(activeSeason, membership.id)
        assertNotNull(row)
        assertEquals(SeasonParticipationMode.MEMBER_SYNC, row!!.participationMode)
        assertEquals(ParticipantStatus.ACTIVE, row.status)
    }

    @Test
    fun `convert to externe can remove member from active season roster`() {
        val adminCookie = signInAdmin("sub-lifecycle-remove-admin", "lifecycle-remove-admin@example.com", "Admin Remove")
        signIn("sub-lifecycle-remove-member", "lifecycle-remove-member@example.com", "Remove Member")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-remove-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val guestSeason = createSeason(adminCookie, "Guest season remove")
        val removedSeason = createSeason(adminCookie, "Removed season")
        activateSeason(guestSeason)
        activateSeason(removedSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(guestSeason).orElseThrow())
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(removedSeason).orElseThrow())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(guestSeason.toString()),
                                "seasonsToRemove" to listOf(removedSeason.toString()),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)

        val guestRow =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(guestSeason, membership.id)!!
        assertEquals(SeasonParticipationMode.GUEST_SEASON, guestRow.participationMode)
        assertEquals(ParticipantStatus.ACTIVE, guestRow.status)

        val removedRow =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(removedSeason, membership.id)!!
        assertEquals(ParticipantStatus.REMOVED, removedRow.status)
        assertEquals(SeasonParticipantRemovalSource.SEASON_ADMIN, removedRow.removalSource)
    }

    @Test
    fun `downgraded externe GUEST_SEASON gets partial guest workspace and agenda only`() {
        val adminCookie = signInAdmin("sub-lifecycle-guest-admin", "lifecycle-guest-admin@example.com", "Admin Guest")
        val memberCookie = signIn("sub-lifecycle-guest-member", "lifecycle-guest-member@example.com", "Guest Member")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-guest-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val activeSeason = createSeason(adminCookie, "Guest workspace season")
        activateSeason(activeSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(activeSeason).orElseThrow())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(activeSeason.toString()),
                                "seasonsToRemove" to emptyList<String>(),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)

        val invitedEvent = createEvent(adminCookie, activeSeason, "Guest show", "2030-07-01T18:00:00Z")
        val siblingEvent = createEvent(adminCookie, activeSeason, "Sibling show", "2030-08-01T18:00:00Z")
        openAvailability(adminCookie, activeSeason, invitedEvent)
        openAvailability(adminCookie, activeSeason, siblingEvent)

        mockMvc
            .perform(get("/v1/seasons/$activeSeason").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("AGENDA_ONLY"))

        mockMvc
            .perform(get("/v1/me/agenda").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(2)))

        mockMvc
            .perform(
                put("/v1/seasons/$activeSeason/events/$invitedEvent/availability/me")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$activeSeason/statistics").cookie(memberCookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `downgraded externe sees invited seasons only in troupe hub list`() {
        val adminCookie = signInAdmin("sub-lifecycle-hub-admin", "lifecycle-hub-admin@example.com", "Admin Hub")
        val memberCookie = signIn("sub-lifecycle-hub-member", "lifecycle-hub-member@example.com", "Hub Member")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-hub-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val invitedSeason = createSeason(adminCookie, "Invited hub season")
        val removedSeason = createSeason(adminCookie, "Hidden hub season")
        activateSeason(invitedSeason)
        activateSeason(removedSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(invitedSeason).orElseThrow())
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(removedSeason).orElseThrow())

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(invitedSeason.toString()),
                                "seasonsToRemove" to listOf(removedSeason.toString()),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].id").value(invitedSeason.toString()))
            .andExpect(jsonPath("$.content[0].guestSeasonWorkspaceMode").value("AGENDA_ONLY"))

        mockMvc
            .perform(get("/v1/troupes/by-slug/les-improbots/context").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.membership.baselineRole").value("EXTERNE"))
    }

    @Test
    fun `downgraded member regression matches 325 guest matrix on past MEMBER_SYNC and active GUEST_SEASON`() {
        val adminCookie = signInAdmin("sub-lifecycle-325-admin", "lifecycle-325-admin@example.com", "Admin 325")
        val memberCookie = signIn("sub-lifecycle-325-member", "lifecycle-325-member@example.com", "Laetitia 325")
        val memberUser = userRepository.findByGoogleSub("sub-lifecycle-325-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)!!
        val pastSeason = createSeason(adminCookie, "Past 325 season")
        val activeSeason = createSeason(adminCookie, "Active 325 season")
        activateSeason(pastSeason)
        activateSeason(activeSeason)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(pastSeason).orElseThrow())
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(activeSeason).orElseThrow())
        archiveSeason(adminCookie, pastSeason)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members/${membership.id}/convert-to-externe")
                    .cookie(adminCookie)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        mapper.writeValueAsString(
                            mapOf(
                                "seasonsToGuestSeason" to listOf(activeSeason.toString()),
                                "seasonsToRemove" to emptyList<String>(),
                            ),
                        ),
                    ),
            ).andExpect(status().isOk)

        val pastEvent = createEvent(adminCookie, pastSeason, "Past show", "2029-06-01T18:00:00Z")
        openAvailability(adminCookie, pastSeason, pastEvent)
        val activeEvent = createEvent(adminCookie, activeSeason, "Active guest show", "2030-07-01T18:00:00Z")
        openAvailability(adminCookie, activeSeason, activeEvent)

        mockMvc
            .perform(get("/v1/seasons/$pastSeason").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("FULL"))

        mockMvc
            .perform(get("/v1/seasons/$activeSeason").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("AGENDA_ONLY"))

        mockMvc
            .perform(get("/v1/me/agenda").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.eventId == '$activeEvent')]", hasSize<Any>(1)))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].id").value(activeSeason.toString()))
    }

    private fun createEvent(
        cookie: Cookie,
        seasonId: UUID,
        title: String,
        startsAt: String = "2030-06-15T18:00:00Z",
    ): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "$title",
                              "startsAt": "$startsAt"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    private fun openAvailability(
        cookie: Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        displayName: String,
    ): Cookie {
        val jwt =
            Jwt
                .withTokenValue("token")
                .header("alg", "RS256")
                .claim("sub", googleSub)
                .claim("email", email)
                .claim("name", displayName)
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .issuer("https://accounts.google.com")
                .build()
        whenever(googleIdTokenService.validateAndParse(any())).thenReturn(jwt)
        val result =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        val cookie = result.response.getCookie("HATCAST_SESSION")!!
        TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
        return cookie
    }

    private fun signInAdmin(
        googleSub: String,
        email: String,
        displayName: String,
    ): Cookie {
        val cookie = signIn(googleSub, email, displayName)
        val user = userRepository.findByGoogleSub(googleSub)!!
        val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)!!
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun createSeason(
        cookie: Cookie,
        title: String,
    ): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"$title"}"""),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    private fun activateSeason(seasonId: UUID) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        season.isActive = true
        seasonRepository.save(season)
    }

    private fun archiveSeason(
        cookie: Cookie,
        seasonId: UUID,
    ) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        season.archived = true
        season.isActive = false
        seasonRepository.save(season)
    }
}
