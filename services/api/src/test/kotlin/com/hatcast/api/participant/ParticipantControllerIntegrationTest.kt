package com.hatcast.api.participant

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserEntity
import com.hatcast.api.user.UserRepository
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
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
class ParticipantControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var troupeMembershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

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
                        .content("""{"title":"Participants integration"}""")
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
                              "title": "Event with participants",
                              "startsAt": "2030-06-15T18:00:00Z"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    @Test
    fun `admin can create name-only season participant list and soft remove`() {
        val admin = signInAdmin("part-admin-1", "part-admin-1@example.com", "Part Admin")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Guest Artist"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Guest Artist"))
            .andExpect(jsonPath("$.kind").value("NAME_ONLY"))
            .andExpect(jsonPath("$.removable").value(true))

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val items = mapper.readTree(listResult.response.contentAsString)
        org.junit.jupiter.api.Assertions.assertTrue(items.any { it.path("displayName").asText() == "Guest Artist" })
        val participantId =
            items.first { it.path("displayName").asText() == "Guest Artist" }.path("id").asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$[?(@.displayName == 'Guest Artist')]").isEmpty,
            )
    }

    @Test
    fun `admin can update name-only season participant with email link`() {
        val admin = signInAdmin("part-admin-edit", "part-admin-edit@example.com", "Part Admin Edit")
        val linked = signIn("part-linked-edit", "linked-edit@example.com", "Linked Edit")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Solo Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Solo Guest Renamed","email":"linked-edit@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Solo Guest Renamed"))
            .andExpect(jsonPath("$.userId").value(linked.userId))
            .andExpect(jsonPath("$.kind").value("LINKED"))
    }

    @Test
    fun `season participant links existing user by email`() {
        val admin = signInAdmin("part-admin-2", "part-admin-2@example.com", "Part Admin Two")
        val linked = signIn("part-linked-2", "linked-user@example.com", "Linked User")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Linked Person","email":" LINKED-USER@example.com "}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.userId").value(linked.userId))
            .andExpect(jsonPath("$.kind").value("LINKED"))
    }

    @Test
    fun `selector endpoint omits email for members`() {
        val admin = signInAdmin("part-admin-3", "part-admin-3@example.com", "Part Admin Three")
        val member = signIn("part-member-3", "part-member-3@example.com", "Member Three")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants/selectors").cookie(member.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].displayName").exists())
            .andExpect(jsonPath("$[0].email").doesNotExist())
    }

    @Test
    fun `non admin cannot list admin participants`() {
        val admin = signInAdmin("part-admin-4", "part-admin-4@example.com", "Part Admin Four")
        val member = signIn("part-member-4", "part-member-4@example.com", "Member Four")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(member.cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `event-only participant is scoped to event`() {
        val admin = signInAdmin("part-admin-5", "part-admin-5@example.com", "Part Admin Five")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"One-off Guest","email":"guest@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("One-off Guest"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.displayName == 'One-off Guest')]").isEmpty)
    }

    @Test
    fun `permissions endpoint exposes participant flags`() {
        val admin = signInAdmin("part-admin-6", "part-admin-6@example.com", "Part Admin Six")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/permissions/me").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.canManageSeasonParticipants").value(true))
            .andExpect(jsonPath("$.canManageEventParticipants").value(true))
    }

    @Test
    fun `list syncs active troupe members into season roster`() {
        val admin = signInAdmin("part-admin-7", "part-admin-7@example.com", "Part Admin Seven")
        val seasonId = createSeason(admin.cookie)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val items = mapper.readTree(listResult.response.contentAsString)
        org.junit.jupiter.api.Assertions.assertTrue(
            items.any { it.path("kind").asText() == "MEMBER" && it.path("troupeMembershipId").isNull.not() },
        )
        org.junit.jupiter.api.Assertions.assertTrue(
            items.any { it.path("userId").asText() == admin.userId },
        )
    }

    @Test
    fun `prelinked participant links on first sign in`() {
        val admin = signInAdmin("part-admin-8", "part-admin-8@example.com", "Part Admin Eight")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Pending Guest","email":"pending-link@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.kind").value("MANAGED"))
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()
        org.junit.jupiter.api.Assertions.assertTrue(
            mapper.readTree(createResult.response.contentAsString).path("userId").isNull ||
                mapper.readTree(createResult.response.contentAsString).path("userId").asText().isBlank(),
        )

        val linked = signIn("part-pending-8", "pending-link@example.com", "Pending Guest")

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val linkedRow =
            mapper.readTree(listResult.response.contentAsString).first {
                it.path("id").asText() == participantId
            }
        org.junit.jupiter.api.Assertions.assertEquals(linked.userId, linkedRow.path("userId").asText())
    }

    @Test
    fun `participant links migration stub with null activated_at on create`() {
        val admin = signInAdmin("part-admin-9", "part-admin-9@example.com", "Part Admin Nine")
        val seasonId = createSeason(admin.cookie)
        userRepository.save(
            UserEntity(
                email = "stub-prelink@example.com",
                displayName = "Stub User",
                activatedAt = null,
            ),
        )

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Stub Participant","email":"stub-prelink@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.kind").value("LINKED"))
            .andExpect(jsonPath("$.userId").exists())
    }

    @Test
    fun `event organizer can manage event-only participants without troupe admin`() {
        val manager = signInAdmin("part-admin-10", "part-admin-10@example.com", "Part Admin Ten")
        val organizer = signIn("part-event-org-10", "event-org-10@example.com", "Event Org Ten")
        val seasonId = createSeason(manager.cookie)
        val eventId = createEvent(manager.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"event-org-10@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(organizer.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Organizer Guest"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Organizer Guest"))
    }

    @Test
    fun `duplicate explicit season participant name returns conflict`() {
        val admin = signInAdmin("part-admin-11", "part-admin-11@example.com", "Part Admin Eleven")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Unique Name"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"unique name"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `admin can patch explicit season participant`() {
        val admin = signInAdmin("part-admin-12", "part-admin-12@example.com", "Part Admin Twelve")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Patch Me","email":"patch@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Patched Name","email":"patch@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.displayName").value("Patched Name"))
    }

    @Test
    fun `cannot patch or remove membership synced participant`() {
        val admin = signInAdmin("part-admin-13", "part-admin-13@example.com", "Part Admin Thirteen")
        val seasonId = createSeason(admin.cookie)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val memberNode =
            mapper.readTree(listResult.response.contentAsString).first {
                it.path("kind").asText() == "MEMBER"
            }
        val memberParticipantId = memberNode.path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/participants/$memberParticipantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Renamed Member"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$memberParticipantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `event roster lists season participants and supports exclusion`() {
        val admin = signInAdmin("part-admin-14", "part-admin-14@example.com", "Part Admin Fourteen")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val memberNode =
            mapper.readTree(listResult.response.contentAsString).first {
                it.path("kind").asText() == "MEMBER"
            }
        val seasonParticipantId = memberNode.path("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.seasonParticipantId == '$seasonParticipantId')]").exists())

        mockMvc
            .perform(
                delete(
                    "/v1/seasons/$seasonId/events/$eventId/participants/roster/season/$seasonParticipantId",
                ).cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.seasonParticipantId == '$seasonParticipantId')]").isEmpty)
    }
}
