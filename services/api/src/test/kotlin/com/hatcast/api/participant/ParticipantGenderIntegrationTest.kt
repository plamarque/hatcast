package com.hatcast.api.participant

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.MemberGender
import com.hatcast.api.user.UserRepository
import org.hamcrest.Matchers.hasItem
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
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
class ParticipantGenderIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

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
                        .content("""{"title":"Participant gender integration"}""")
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
                              "title": "Participant gender event",
                              "startsAt": "2030-06-15T18:00:00Z"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    @Test
    fun `name-only create with female persists effective gender on list`() {
        val admin = signInAdmin("pg-admin-1", "pg-admin-1@example.com", "PG Admin")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Marie","gender":"female"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.gender").value("female"))
            .andExpect(jsonPath("$.participantGender").value("female"))
            .andExpect(jsonPath("$.genderManagedOnAccount").value(false))
    }

    @Test
    fun `linked user with account male rejects organizer gender override on patch`() {
        val admin = signInAdmin("pg-admin-2", "pg-admin-2@example.com", "PG Admin Two")
        val member = signIn("pg-member-male", "pg-member-male@example.com", "Male Member")
        userRepository.findByGoogleSub("pg-member-male")!!.apply {
            gender = MemberGender.MALE
            userRepository.save(this)
        }
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Male Member","email":"pg-member-male@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.gender").value("male"))
                .andExpect(jsonPath("$.genderManagedOnAccount").value(true))
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Male Member","email":"pg-member-male@example.com","gender":"female"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `linked user with account male rejects organizer gender override on create`() {
        val admin = signInAdmin("pg-admin-2b", "pg-admin-2b@example.com", "PG Admin Two B")
        signIn("pg-member-male-create", "pg-member-male-create@example.com", "Male Member Create")
        userRepository.findByGoogleSub("pg-member-male-create")!!.apply {
            gender = MemberGender.MALE
            userRepository.save(this)
        }
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "displayName":"Male Member Create",
                          "email":"pg-member-male-create@example.com",
                          "gender":"female"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `linked user without account gender allows organizer row gender`() {
        val admin = signInAdmin("pg-admin-3", "pg-admin-3@example.com", "PG Admin Three")
        signIn("pg-member-ns", "pg-member-ns@example.com", "NS Member")
        val seasonId = createSeason(admin.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"NS Member","email":"pg-member-ns@example.com","gender":"female"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.gender").value("female"))
            .andExpect(jsonPath("$.participantGender").value("female"))
            .andExpect(jsonPath("$.genderManagedOnAccount").value(false))
    }

    @Test
    fun `mon compte gender change cascades to linked participant rows`() {
        val admin = signInAdmin("pg-admin-4", "pg-admin-4@example.com", "PG Admin Four")
        val member = signIn("pg-cascade", "pg-cascade@example.com", "Cascade Member")
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Cascade Member","email":"pg-cascade@example.com","gender":"female"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = UUID.fromString(mapper.readTree(createResult.response.contentAsString).path("id").asText())

        mockMvc
            .perform(
                patch("/v1/me/preferences")
                    .cookie(member.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"gender":"male"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.gender").value("male"))

        val row = seasonParticipantRepository.findById(participantId).orElseThrow()
        assertEquals(MemberGender.MALE, row.gender)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$participantId')].gender").value("male"))
    }

    @Test
    fun `mon compte non_specified clears linked participant row gender`() {
        val admin = signInAdmin("pg-admin-5", "pg-admin-5@example.com", "PG Admin Five")
        val member = signIn("pg-clear", "pg-clear@example.com", "Clear Member")
        userRepository.findByGoogleSub("pg-clear")!!.apply {
            gender = MemberGender.FEMALE
            userRepository.save(this)
        }
        val seasonId = createSeason(admin.cookie)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"displayName":"Clear Member","email":"pg-clear@example.com"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val participantId = UUID.fromString(mapper.readTree(createResult.response.contentAsString).path("id").asText())

        mockMvc
            .perform(
                patch("/v1/me/preferences")
                    .cookie(member.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"gender":"non_specified"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        assertNull(seasonParticipantRepository.findById(participantId).orElseThrow().gender)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.id == '$participantId')].gender").value("non_specified"))
            .andExpect(jsonPath("$[?(@.id == '$participantId')].participantGender").value(hasItem(nullValue())))
    }

    @Test
    fun `event-only create with female persists effective gender on list`() {
        val admin = signInAdmin("pg-admin-event-1", "pg-admin-event-1@example.com", "PG Event Admin")
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Event Guest","gender":"female"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.gender").value("female"))
            .andExpect(jsonPath("$.participantGender").value("female"))
            .andExpect(jsonPath("$.genderManagedOnAccount").value(false))
    }

    @Test
    fun `linked user with account male rejects organizer gender override on event patch`() {
        val admin = signInAdmin("pg-admin-event-2", "pg-admin-event-2@example.com", "PG Event Admin Two")
        signIn("pg-event-member-male", "pg-event-member-male@example.com", "Event Male Member")
        userRepository.findByGoogleSub("pg-event-member-male")!!.apply {
            gender = MemberGender.MALE
            userRepository.save(this)
        }
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId)

        val createResult =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/participants")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "displayName":"Event Male Member",
                              "email":"pg-event-member-male@example.com"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.gender").value("male"))
                .andExpect(jsonPath("$.genderManagedOnAccount").value(true))
                .andReturn()
        val participantId = mapper.readTree(createResult.response.contentAsString).path("id").asText()

        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId/participants/$participantId")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """
                        {
                          "displayName":"Event Male Member",
                          "email":"pg-event-member-male@example.com",
                          "gender":"female"
                        }
                        """.trimIndent(),
                    ).with(csrf()),
            ).andExpect(status().isBadRequest)
    }
}
