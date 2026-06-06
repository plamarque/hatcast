package com.hatcast.api.participant

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
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
import jakarta.servlet.http.Cookie

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ParticipantExterneCascadeIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var troupeMembershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var eventParticipantRepository: EventParticipantRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private data class SessionFixture(
        val cookie: Cookie,
        val userId: String,
    )

    private fun signIn(
        googleSub: String,
        email: String,
        displayName: String,
    ): SessionFixture {
        val jwt =
            Jwt
                .withTokenValue("header.payload.sig")
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
                    post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        val root = mapper.readTree(result.response.contentAsString)
        return SessionFixture(
            cookie =
                result.response.getCookie("HATCAST_SESSION")!!.also { cookie ->
                    TestAuthSupport.joinSeedTroupe(mockMvc, cookie, seedTroupeId)
                },
            userId = root.path("user").path("id").asText(),
        )
    }

    private fun signInAdmin(
        googleSub: String,
        email: String,
        displayName: String,
    ): SessionFixture =
        signIn(googleSub, email, displayName).also { fixture ->
            val membership =
                troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, UUID.fromString(fixture.userId))
                    ?: error("Missing seed membership")
            membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
            troupeMembershipRepository.save(membership)
        }

    private fun createSeason(cookie: Cookie): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Externe cascade"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    private fun createEvent(
        cookie: Cookie,
        seasonId: UUID,
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
                              "title": "Ruben show",
                              "startsAt": "2030-06-15T18:00:00Z"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    @Test
    fun `season guest name-only add upserts carnet and SEASON scope row`() {
        val admin = signInAdmin("ext-cascade-name", "ext-cascade-name@example.com", "Ext Cascade Name")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Laetitia"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.kind").value("EXTERNE"))
            .andExpect(jsonPath("$.invitationScope").value("SEASON"))
            .andExpect(jsonPath("$.troupeMembershipId").isNotEmpty)
            .andExpect(jsonPath("$.email").isEmpty)
    }

    @Test
    fun `season guest add upserts carnet and SEASON scope row`() {
        val admin = signInAdmin("ext-cascade-1", "ext-cascade-1@example.com", "Ext Cascade Admin")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Laetitia","email":"laetitia@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.kind").value("EXTERNE"))
            .andExpect(jsonPath("$.invitationScope").value("SEASON"))
            .andExpect(jsonPath("$.troupeMembershipId").isNotEmpty)
            .andExpect(jsonPath("$.removable").value(true))

        val memberships =
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                seedTroupeId,
                listOf(TroupeMembershipStatus.ACTIVE),
            )
        org.junit.jupiter.api.Assertions.assertTrue(
            memberships.any {
                it.baselineRole == TroupeBaselineRole.EXTERNE &&
                    it.displayName.equals("Laetitia", ignoreCase = true)
            },
        )
    }

    @Test
    fun `event guest add upserts carnet without season row by default`() {
        val admin = signInAdmin("ext-cascade-2", "ext-cascade-2@example.com", "Ext Cascade Admin 2")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Ruben"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Ruben"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.displayName == 'Ruben')]").isEmpty)

        val memberships =
            troupeMembershipRepository.findByTroupe_IdAndStatusIn(
                seedTroupeId,
                listOf(TroupeMembershipStatus.ACTIVE),
            )
        org.junit.jupiter.api.Assertions.assertTrue(
            memberships.any {
                it.baselineRole == TroupeBaselineRole.EXTERNE &&
                    it.displayName.equals("Ruben", ignoreCase = true)
            },
        )
    }

    @Test
    fun `duplicate active event guest add returns conflict`() {
        val admin = signInAdmin("ext-cascade-dup", "ext-cascade-dup@example.com", "Ext Cascade Dup")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Ruben Dup"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Ruben Dup"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `event guest with addToSeasonRoster creates EVENT scope season row`() {
        val admin = signInAdmin("ext-cascade-3", "ext-cascade-3@example.com", "Ext Cascade Admin 3")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"DJ Opt-in","addToSeasonRoster":true}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.displayName == 'DJ Opt-in')].invitationScope").value("EVENT"))
    }

    @Test
    fun `event add with addToSeasonRoster links event row to season row`() {
        val admin = signInAdmin("ext-cascade-link", "ext-cascade-link@example.com", "Ext Cascade Link")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Linked DJ","addToSeasonRoster":true}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventParticipantId =
            UUID.fromString(mapper.readTree(createResult.response.contentAsString).path("id").asText())
        val carnet =
            troupeMembershipRepository
                .findByTroupe_IdAndStatusIn(seedTroupeId, listOf(TroupeMembershipStatus.ACTIVE))
                .first {
                    it.baselineRole == TroupeBaselineRole.EXTERNE &&
                        it.displayName.equals("Linked DJ", ignoreCase = true)
                }
        val seasonRow =
            seasonParticipantRepository.findBySeason_IdAndStatusAndTroupeMembership_Id(
                seasonId,
                ParticipantStatus.ACTIVE,
                carnet.id,
            )
        val eventRow = eventParticipantRepository.findById(eventParticipantId).orElseThrow()
        org.junit.jupiter.api.Assertions.assertNotNull(seasonRow)
        org.junit.jupiter.api.Assertions.assertEquals(seasonRow?.id, eventRow.seasonParticipant?.id)
    }

    @Test
    fun `re-adding removed externe season participant reuses stable ids`() {
        val admin = signInAdmin("ext-cascade-4", "ext-cascade-4@example.com", "Ext Cascade Admin 4")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Stable Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()
        val membershipId = mapper.readTree(createResult.response.contentAsString).path("troupeMembershipId").asText()

        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(
                    "/v1/seasons/$seasonId/participants/$participantId",
                ).cookie(admin.cookie).with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Stable Guest"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(participantId))
            .andExpect(jsonPath("$.troupeMembershipId").value(membershipId))
    }

    @Test
    fun `re-adding removed externe event participant reuses stable ids`() {
        val admin = signInAdmin("ext-cascade-4b", "ext-cascade-4b@example.com", "Ext Cascade Admin 4b")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Stable Event Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(
                    "/v1/seasons/$seasonId/events/$eventId/participants/$participantId",
                ).cookie(admin.cookie).with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Stable Event Guest"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(participantId))
    }

    @Test
    fun `externe carnet email update propagates to linked season participant`() {
        val admin = signInAdmin("ext-cascade-8b", "ext-cascade-8b@example.com", "Ext Cascade Email")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Email Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(createResult.response.contentAsString).path("troupeMembershipId").asText()

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"email-guest@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.displayName == 'Email Guest')].email").value("email-guest@example.com"))
    }

    @Test
    fun `externe carnet rename propagates to linked season participant`() {
        val admin = signInAdmin("ext-cascade-8", "ext-cascade-8@example.com", "Ext Cascade Propagate")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Laetitia","email":"laetitia-prop@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(createResult.response.contentAsString).path("troupeMembershipId").asText()

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Laetitia Dupont"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.displayName == 'Laetitia Dupont')]").exists())
    }

    @Test
    fun `member event add does not upsert externe carnet`() {
        val admin = signInAdmin("ext-cascade-6", "ext-cascade-6@example.com", "Ext Cascade Admin 6")
        signIn("ext-cascade-member-6", "ext-cascade-member-6@example.com", "Cascade Member Six")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val beforeExterneCount =
            troupeMembershipRepository
                .findByTroupe_IdAndStatusIn(seedTroupeId, listOf(TroupeMembershipStatus.ACTIVE))
                .count { it.baselineRole == TroupeBaselineRole.EXTERNE }

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "displayName":"Cascade Member Six",
                          "email":"ext-cascade-member-6@example.com"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)

        val afterExterneCount =
            troupeMembershipRepository
                .findByTroupe_IdAndStatusIn(seedTroupeId, listOf(TroupeMembershipStatus.ACTIVE))
                .count { it.baselineRole == TroupeBaselineRole.EXTERNE }
        org.junit.jupiter.api.Assertions.assertEquals(beforeExterneCount, afterExterneCount)
    }

    @Test
    fun `season scoped externe supports event roster exclusion`() {
        val admin = signInAdmin("ext-cascade-7", "ext-cascade-7@example.com", "Ext Cascade Admin 7")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Laetitia MC","email":"laetitia-mc@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.kind").value("EXTERNE"))
                .andExpect(jsonPath("$.invitationScope").value("SEASON"))
                .andReturn()
        val seasonParticipantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.seasonParticipantId == '$seasonParticipantId')]").exists())

        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(
                    "/v1/seasons/$seasonId/events/$eventId/participants/roster/season/$seasonParticipantId",
                ).cookie(admin.cookie).with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.seasonParticipantId == '$seasonParticipantId')]").isEmpty)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$seasonParticipantId')].invitationScope").value("SEASON"))
    }

    @Test
    fun `re-adding season guest reactivates inactive externe carnet with stable membership id`() {
        val admin = signInAdmin("ext-cascade-inact", "ext-cascade-inact@example.com", "Ext Cascade Inact")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Inactive Carnet Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()
        val membershipId = mapper.readTree(createResult.response.contentAsString).path("troupeMembershipId").asText()

        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(
                    "/v1/seasons/$seasonId/participants/$participantId",
                ).cookie(admin.cookie).with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete(
                    "/v1/troupes/$seedTroupeId/members/$membershipId",
                ).cookie(admin.cookie).with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Inactive Carnet Guest"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.troupeMembershipId").value(membershipId))
            .andExpect(jsonPath("$.kind").value("EXTERNE"))
            .andExpect(jsonPath("$.invitationScope").value("SEASON"))

        val membership =
            troupeMembershipRepository.findById(UUID.fromString(membershipId)).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(TroupeMembershipStatus.ACTIVE, membership.status)
    }

    @Test
    fun `member typeahead add does not upsert externe carnet`() {
        val admin = signInAdmin("ext-cascade-5", "ext-cascade-5@example.com", "Ext Cascade Admin 5")
        val member = signIn("ext-cascade-member-5", "ext-cascade-member-5@example.com", "Cascade Member Five")
        val seasonId = createSeason(admin.cookie)

        val beforeExterneCount =
            troupeMembershipRepository
                .findByTroupe_IdAndStatusIn(seedTroupeId, listOf(TroupeMembershipStatus.ACTIVE))
                .count { it.baselineRole == TroupeBaselineRole.EXTERNE }

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "displayName":"Cascade Member Five",
                          "email":"ext-cascade-member-5@example.com"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.kind").value("LINKED"))
            .andExpect(jsonPath("$.invitationScope").isEmpty)

        val afterExterneCount =
            troupeMembershipRepository
                .findByTroupe_IdAndStatusIn(seedTroupeId, listOf(TroupeMembershipStatus.ACTIVE))
                .count { it.baselineRole == TroupeBaselineRole.EXTERNE }
        org.junit.jupiter.api.Assertions.assertEquals(beforeExterneCount, afterExterneCount)
    }
}
