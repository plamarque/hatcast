package com.hatcast.api.participant

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
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
            .andExpect(jsonPath("$.kind").value("EXTERNE"))
            .andExpect(jsonPath("$.invitationScope").value("SEASON"))
            .andExpect(jsonPath("$.troupeMembershipId").isNotEmpty)

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
    fun `externe-linked season participant rejects name email patch`() {
        val admin = signInAdmin("part-admin-edit", "part-admin-edit@example.com", "Part Admin Edit")
        signIn("part-linked-edit", "linked-edit@example.com", "Linked Edit")
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
                .andExpect(jsonPath("$.kind").value("EXTERNE"))
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Solo Guest Renamed","email":"linked-edit@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
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
                .andExpect(jsonPath("$.kind").value("EXTERNE"))
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
            .andExpect(jsonPath("$.kind").value("EXTERNE"))
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
                    .content("""{"displayName":"Patch Me","email":"patch@example.com","gender":"female"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.gender").value("female"))
    }

    @Test
    fun `cannot patch membership synced participant but can season remove`() {
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
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$memberParticipantId')]").isEmpty)
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

    @Test
    fun `deactivating troupe member removes synced season participant and list does not restore it`() {
        val admin = signInAdmin("part-admin-15", "part-admin-15@example.com", "Part Admin Fifteen")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-15", "part-target-15@example.com", "Part Target Fifteen")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-15@example.com","displayName":"Part Target Fifteen"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-15@example.com')]").exists())

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-15@example.com')]").isEmpty)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-15@example.com')]").isEmpty)
    }

    @Test
    fun `season remove for troupe member keeps membership active and sync does not restore`() {
        val admin = signInAdmin("part-admin-16", "part-admin-16@example.com", "Part Admin Sixteen")
        val seasonA = createSeason(admin.cookie)
        val seasonB =
            UUID.fromString(
                mapper
                    .readTree(
                        mockMvc
                            .perform(
                                post("/v1/troupes/$seedTroupeId/seasons")
                                    .cookie(admin.cookie)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content("""{"title":"Season B participants"}""")
                                    .with(csrf()),
                            ).andExpect(status().isOk)
                            .andReturn()
                            .response.contentAsString,
                    ).path("id")
                    .asText(),
            )
        signIn("part-target-16", "part-target-16@example.com", "Part Target Sixteen")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-16@example.com","displayName":"Part Target Sixteen"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonA/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-16@example.com')]").exists())
        mockMvc
            .perform(get("/v1/seasons/$seasonB/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-16@example.com')]").exists())

        val listA =
            mockMvc
                .perform(get("/v1/seasons/$seasonA/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listA.response.contentAsString)
                .first { it.path("email").asText() == "part-target-16@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonA/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        val membership =
            troupeMembershipRepository.findById(UUID.fromString(membershipId)).orElseThrow()
        org.junit.jupiter.api.Assertions.assertEquals(TroupeMembershipStatus.ACTIVE, membership.status)

        mockMvc
            .perform(get("/v1/seasons/$seasonA/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-16@example.com')]").isEmpty)

        mockMvc
            .perform(get("/v1/seasons/$seasonA/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-16@example.com')]").isEmpty)

        mockMvc
            .perform(get("/v1/seasons/$seasonB/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-16@example.com')]").exists())
    }

    @Test
    fun `reinclude season participant restores roster and keeps event exclusion`() {
        val admin = signInAdmin("part-admin-17", "part-admin-17@example.com", "Part Admin Seventeen")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)
        signIn("part-target-17", "part-target-17@example.com", "Part Target Seventeen")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"part-target-17@example.com","displayName":"Part Target Seventeen"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listResult.response.contentAsString)
                .first { it.path("email").asText() == "part-target-17@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/events/$eventId/participants/roster/season/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$participantId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$participantId')]").exists())

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.seasonParticipantId == '$participantId')]").isEmpty)
    }

    @Test
    fun `reinclude is rejected while troupe membership is inactive`() {
        val admin = signInAdmin("part-admin-18", "part-admin-18@example.com", "Part Admin Eighteen")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-18", "part-target-18@example.com", "Part Target Eighteen")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-18@example.com","displayName":"Part Target Eighteen"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listResult.response.contentAsString)
                .first { it.path("email").asText() == "part-target-18@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$participantId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `reactivating troupe member restores cascade-removed season participant`() {
        val admin = signInAdmin("part-admin-19", "part-admin-19@example.com", "Part Admin Nineteen")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-19", "part-target-19@example.com", "Part Target Nineteen")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-19@example.com","displayName":"Part Target Nineteen"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-19@example.com')]").exists())

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-19@example.com')]").isEmpty)

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"part-target-19@example.com","displayName":"Part Target Nineteen"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-19@example.com')]").exists())
    }

    @Test
    fun `event roster hides member removed at season level via linked event row`() {
        val admin = signInAdmin("part-admin-20", "part-admin-20@example.com", "Part Admin Twenty")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)
        signIn("part-target-20", "part-target-20@example.com", "Part Target Twenty")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"part-target-20@example.com","displayName":"Part Target Twenty"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Target Event Row","email":"part-target-20@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listResult.response.contentAsString)
                .first { it.path("email").asText() == "part-target-20@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-20@example.com')]").exists())

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.email == 'part-target-20@example.com')]").isEmpty)
    }

    @Test
    fun `reinclude resyncs member display name from troupe membership`() {
        val admin = signInAdmin("part-admin-21", "part-admin-21@example.com", "Part Admin TwentyOne")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-21", "part-target-21@example.com", "Part Target TwentyOne")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-21@example.com","displayName":"Original Name"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listResult.response.contentAsString)
                .first { it.path("email").asText() == "part-target-21@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Renamed In Troupe"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$participantId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$participantId' && @.displayName == 'Renamed In Troupe')]").exists())
    }

    @Test
    fun `reinclude of explicit participant conflicts with active duplicate name`() {
        val admin = signInAdmin("part-admin-22", "part-admin-22@example.com", "Part Admin TwentyTwo")
        val seasonId = createSeason(admin.cookie)

        val firstResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Alpha Solo"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val firstId = mapper.readTree(firstResult.response.contentAsString).path("id").asText()

        // A second, distinct active participant we will later rename onto the conflicting name.
        val secondResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Beta Solo"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val secondId = mapper.readTree(secondResult.response.contentAsString).path("id").asText()
        val secondMembershipId =
            mapper.readTree(secondResult.response.contentAsString).path("troupeMembershipId").asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$firstId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                patch("/v1/troupes/$seedTroupeId/members/$secondMembershipId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Alpha Solo"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        // Re-including the first row would now duplicate the active "Alpha Solo".
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$firstId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `removing an already removed participant is a no-op`() {
        val admin = signInAdmin("part-admin-23", "part-admin-23@example.com", "Part Admin TwentyThree")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"NoOp Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
    }

    @Test
    fun `reincluding an already active participant is a no-op`() {
        val admin = signInAdmin("part-admin-24", "part-admin-24@example.com", "Part Admin TwentyFour")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Active NoOp"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$participantId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
    }

    @Test
    fun `participant count tracks remove and reinclude`() {
        val admin = signInAdmin("part-admin-25", "part-admin-25@example.com", "Part Admin TwentyFive")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Count Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        val afterCreate = seasonRepository.findById(seasonId).orElseThrow().participantCount

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
        val afterRemove = seasonRepository.findById(seasonId).orElseThrow().participantCount
        org.junit.jupiter.api.Assertions.assertEquals(afterCreate - 1, afterRemove)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants/$participantId/reinclude")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
        val afterReinclude = seasonRepository.findById(seasonId).orElseThrow().participantCount
        org.junit.jupiter.api.Assertions.assertEquals(afterCreate, afterReinclude)
    }

    @Test
    fun `re-adding a season-removed member by email reactivates the same row`() {
        val admin = signInAdmin("part-admin-26", "part-admin-26@example.com", "Part Admin TwentySix")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-26", "part-target-26@example.com", "Part Target TwentySix")

        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/members")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"part-target-26@example.com","displayName":"Part Target TwentySix"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val listResult =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val participantId =
            mapper
                .readTree(listResult.response.contentAsString)
                .first { it.path("email").asText() == "part-target-26@example.com" }
                .path("id")
                .asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        // Re-add via "Ajouter" with the same email: reuses the same row, re-syncs as a member.
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Ignored New Name","email":"part-target-26@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(participantId))
            .andExpect(jsonPath("$.kind").value("MEMBER"))
            .andExpect(jsonPath("$.displayName").value("Part Target TwentySix"))
            .andExpect(jsonPath("$.removable").value(false))

        val afterList =
            mapper.readTree(
                mockMvc
                    .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                    .andExpect(status().isOk)
                    .andReturn()
                    .response.contentAsString,
            )
        val matching = afterList.filter { it.path("email").asText() == "part-target-26@example.com" }
        org.junit.jupiter.api.Assertions.assertEquals(1, matching.size)
        org.junit.jupiter.api.Assertions.assertEquals(participantId, matching.first().path("id").asText())
    }

    @Test
    fun `re-adding a removed name-only participant reuses the same row`() {
        val admin = signInAdmin("part-admin-27", "part-admin-27@example.com", "Part Admin TwentySeven")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Returning Guest"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Returning Guest"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(participantId))
            .andExpect(jsonPath("$.status").value("ACTIVE"))

        val afterList =
            mapper.readTree(
                mockMvc
                    .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                    .andExpect(status().isOk)
                    .andReturn()
                    .response.contentAsString,
            )
        val matching = afterList.filter { it.path("displayName").asText() == "Returning Guest" }
        org.junit.jupiter.api.Assertions.assertEquals(1, matching.size)
        org.junit.jupiter.api.Assertions.assertEquals(participantId, matching.first().path("id").asText())
    }

    @Test
    fun `re-adding a member by email is rejected while troupe membership is inactive`() {
        val admin = signInAdmin("part-admin-28", "part-admin-28@example.com", "Part Admin TwentyEight")
        val seasonId = createSeason(admin.cookie)
        signIn("part-target-28", "part-target-28@example.com", "Part Target TwentyEight")

        val addResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/members")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"email":"part-target-28@example.com","displayName":"Part Target TwentyEight"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val membershipId = mapper.readTree(addResult.response.contentAsString).path("id").asText()

        // Force the synced season row to exist before deactivating the membership.
        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)

        mockMvc
            .perform(
                delete("/v1/troupes/$seedTroupeId/members/$membershipId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Part Target TwentyEight","email":"part-target-28@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }
}
