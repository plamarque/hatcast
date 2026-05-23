package com.hatcast.api.organizer

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.event.EventEntity
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonEntity
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.troupe.TroupeEntity
import com.hatcast.api.troupe.TroupeMembershipEntity
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.troupe.TroupeRepository
import com.hatcast.api.user.UserRepository
import com.hatcast.api.support.TestAuthSupport
import org.junit.jupiter.api.Assertions.assertFalse
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID
import jakarta.servlet.http.Cookie

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrganizerControllerIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @Autowired
    private lateinit var troupeRepository: TroupeRepository

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonOrganizerRepository: SeasonOrganizerRepository

    @Autowired
    private lateinit var eventOrganizerRepository: EventOrganizerRepository

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

    private fun createSeason(cookie: Cookie): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Organizers integration"}""")
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
                              "title": "Event with organizer",
                              "startsAt": "2030-06-15T18:00:00Z"
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
    }

    private fun createNonSeedSeason(): SeasonEntity {
        val troupeId = UUID.randomUUID()
        val troupe =
            troupeRepository.save(
                TroupeEntity(
                    id = troupeId,
                    name = "Non seed ${troupeId.toString().take(8)}",
                    slug = "non-seed-${troupeId.toString().take(8)}",
                ),
            )
        return seasonRepository.save(
            SeasonEntity(
                troupe = troupe,
                slug = "non-seed-season-${UUID.randomUUID().toString().take(8)}",
                title = "Non seed season",
            ),
        )
    }

    private fun addDirectMembership(
        fixture: SessionFixture,
        troupe: TroupeEntity,
    ) {
        val user = userRepository.findById(UUID.fromString(fixture.userId)).orElseThrow()
        troupeMembershipRepository.save(
            TroupeMembershipEntity(
                troupe = troupe,
                user = user,
                status = TroupeMembershipStatus.ACTIVE,
                displayName = user.displayName ?: "Test member",
            ),
        )
    }

    @Test
    fun `season organizer can be added listed idempotently and revoked`() {
        val manager = signIn("org-manager-1", "manager-1@example.com", "Manager One")
        val organizer = signIn("org-season-1", "season-organizer@example.com", "Season Organizer")
        val seasonId = createSeason(manager.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":" SEASON-ORGANIZER@example.com "}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.userId").value(organizer.userId))
            .andExpect(jsonPath("$.email").value("season-organizer@example.com"))
            .andExpect(jsonPath("$.displayName").value("Season Organizer"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"season-organizer@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/organizers").cookie(manager.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].userId").value(organizer.userId))

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/organizers/${organizer.userId}")
                    .cookie(manager.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/organizers").cookie(manager.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))
    }

    @Test
    fun `event organizer can be added listed idempotently and revoked`() {
        val manager = signIn("org-manager-2", "manager-2@example.com", "Manager Two")
        val organizer = signIn("org-event-1", "event-organizer@example.com", "Event Organizer")
        val seasonId = createSeason(manager.cookie)
        val eventId = createEvent(manager.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"event-organizer@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.userId").value(organizer.userId))
            .andExpect(jsonPath("$.email").value("event-organizer@example.com"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"event-organizer@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/organizers").cookie(manager.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].userId").value(organizer.userId))

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/events/$eventId/organizers/${organizer.userId}")
                    .cookie(manager.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
    }

    @Test
    fun `adding organizer rejects unknown email`() {
        val manager = signIn("org-manager-3", "manager-3@example.com", "Manager Three")
        val seasonId = createSeason(manager.cookie)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"unknown-organizer@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isNotFound)
    }

    @Test
    fun `organizer mutations reject seasons outside the provisional seed troupe`() {
        val user = signIn("org-manager-4", "manager-4@example.com", "Manager Four")
        val organizer = signIn("org-target-4", "target-4@example.com", "Target Four")
        val season = createNonSeedSeason()
        val event =
            eventRepository.save(
                EventEntity(
                    season = season,
                    title = "Non seed event",
                    startsAt = Instant.parse("2030-06-15T18:00:00Z"),
                ),
            )

        mockMvc
            .perform(
                post("/v1/seasons/${season.id}/organizers")
                    .cookie(user.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"target-4@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                get("/v1/seasons/${season.id}/organizers")
                    .cookie(user.cookie),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/seasons/${season.id}/events/${event.id}/organizers")
                    .cookie(user.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"target-4@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                delete("/v1/seasons/${season.id}/events/${event.id}/organizers/${organizer.userId}")
                    .cookie(user.cookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `permissions endpoint exposes organizer flags for non seed seasons without failing`() {
        val user = signIn("org-manager-5", "manager-5@example.com", "Manager Five")
        val season = createNonSeedSeason()
        addDirectMembership(user, season.troupe)

        mockMvc
            .perform(get("/v1/seasons/${season.id}/permissions/me").cookie(user.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.canManageSeasonOrganizers").value(false))
            .andExpect(jsonPath("$.canManageEventOrganizers").value(false))
            .andExpect(jsonPath("$.isSeasonOrganizer").value(false))
            .andExpect(jsonPath("$.eventOrganizerFor.length()").value(0))
    }

    @Test
    fun `deleting parent rows cascades organizer assignments`() {
        val manager = signIn("org-manager-6", "manager-6@example.com", "Manager Six")
        val seasonOrganizer = signIn("org-season-6", "season-6@example.com", "Season Six")
        val eventOrganizer = signIn("org-event-6", "event-6@example.com", "Event Six")
        val seasonId = createSeason(manager.cookie)
        val eventId = createEvent(manager.cookie, seasonId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"season-6@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(manager.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"event-6@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        eventRepository.deleteById(eventId)
        eventRepository.flush()
        seasonRepository.deleteById(seasonId)
        seasonRepository.flush()

        assertFalse(eventOrganizerRepository.existsByEvent_IdAndUser_Id(eventId, UUID.fromString(eventOrganizer.userId)))
        assertFalse(seasonOrganizerRepository.existsBySeason_IdAndUser_Id(seasonId, UUID.fromString(seasonOrganizer.userId)))
    }
}
