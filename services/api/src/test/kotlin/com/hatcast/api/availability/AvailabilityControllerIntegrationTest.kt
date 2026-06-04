package com.hatcast.api.availability

import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.event.EventRepository
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.hamcrest.Matchers.empty
import org.hamcrest.Matchers.greaterThanOrEqualTo
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.nullValue
import org.junit.jupiter.api.Tag
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

    @Autowired
    private lateinit var seasonRepository: SeasonRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var availabilityRepository: EventAvailabilityRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

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

    private fun createSeasonAndEvent(
        cookie: jakarta.servlet.http.Cookie,
        eventBody: String =
            """
            {
              "title": "Spectacle dispo",
              "startsAt": "2031-03-20T19:00:00Z"
            }
            """.trimIndent(),
    ): Pair<UUID, UUID> {
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

        val createEvent =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventBody)
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(createEvent.response.contentAsString).get("id").asText())
        openEventAvailability(seasonId, eventId, cookie)
        return seasonId to eventId
    }

    private fun openEventAvailability(
        seasonId: UUID,
        eventId: UUID,
        cookie: jakarta.servlet.http.Cookie,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun createSeasonAndDraftEvent(
        cookie: jakarta.servlet.http.Cookie,
        eventBody: String =
            """
            {
              "title": "Spectacle brouillon",
              "startsAt": "2031-04-20T19:00:00Z"
            }
            """.trimIndent(),
    ): Pair<UUID, UUID> {
        val createSeason =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Saison brouillon dispos"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonId = UUID.fromString(mapper.readTree(createSeason.response.contentAsString).get("id").asText())

        val createEvent =
            mockMvc
                .perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(eventBody)
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.availabilityOpenedAt").value(nullValue()))
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(createEvent.response.contentAsString).get("id").asText())
        return seasonId to eventId
    }

    private fun syncSeasonParticipants(seasonId: UUID) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
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
            .andExpect(jsonPath("$.roleKeys").isArray)

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.roleKeys").isArray)
            .andExpect(jsonPath("$.updatedAt").exists())

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.roleKeys").isArray)

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
            .andExpect(jsonPath("$.roleKeys").isArray)

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unknown"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))
            .andExpect(jsonPath("$.roleKeys").isArray)

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))
            .andExpect(jsonPath("$.roleKeys").isArray)

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

    @Test
    fun `available role keys are persisted and invalid keys are rejected`() {
        val cookie = memberCookie("sub-avail-roles")
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player","mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.roleKeys[0]").value("player"))
            .andExpect(jsonPath("$.roleKeys[1]").value("mc"))

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.roleKeys[0]").value("player"))
            .andExpect(jsonPath("$.roleKeys[1]").value("mc"))

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["referee"]}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    fun `unavailable clears roles and unknown deletes row`() {
        val cookie = memberCookie("sub-avail-clear-roles")
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player","mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unavailable"))
            .andExpect(jsonPath("$.roleKeys").isEmpty)

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unknown","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unknown"))
            .andExpect(jsonPath("$.roleKeys").isEmpty)
    }

    @Test
    fun `volunteer role is auto-added for match player unless explicitly omitted`() {
        val cookie = memberCookie("sub-avail-volunteer")
        val (seasonId, eventId) =
            createSeasonAndEvent(
                cookie,
                """
                {
                  "title": "Match bénévole",
                  "startsAt": "2031-03-20T19:00:00Z",
                  "templateType": "match"
                }
                """.trimIndent(),
            )
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.roleKeys[0]").value("player"))
            .andExpect(jsonPath("$.roleKeys[1]").value("volunteer"))

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"],"applyVolunteerRule":false}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.roleKeys.length()").value(1))
            .andExpect(jsonPath("$.roleKeys[0]").value("player"))
    }

    @Test
    fun `summary aggregates participants and role candidates with equal chances`() {
        val admin = memberCookie("sub-avail-summary-admin")
        val member = signInOnly("sub-avail-summary-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)

        val (seasonId, eventId) =
            createSeasonAndEvent(
                admin,
                """
                {
                  "title": "Summary roles",
                  "startsAt": "2031-04-01T19:00:00Z",
                  "roleSlots": { "player": 5, "mc": 1, "dj": 1 }
                }
                """.trimIndent(),
            )

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player","mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        syncSeasonParticipants(seasonId)

        val summaryPath = "/v1/seasons/$seasonId/events/$eventId/availability/summary"
        mockMvc
            .perform(get("$summaryPath?includeChances=true").cookie(member))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eventId").value(eventId.toString()))
            .andExpect(jsonPath("$.participants.length()").value(greaterThanOrEqualTo(2)))
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'mc')].candidates.length()").value(2))
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'mc')].candidates[0].chancePercent").value(50))
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'player')].candidates.length()").value(2))
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'dj')].candidates.length()").value(1))

        mockMvc
            .perform(get(summaryPath).cookie(signInOnly("sub-avail-summary-outsider")))
            .andExpect(status().isForbidden)
    }

    @Test
    @Tag("G-003")
    fun `summary GET does not sync membership participants`() {
        val admin = memberCookie("sub-avail-summary-readonly-admin")
        val (seasonId, eventId) = createSeasonAndEvent(admin)

        val newcomerSub = "sub-avail-summary-readonly-newcomer"
        val newcomer = signInOnly(newcomerSub)
        TestAuthSupport.joinSeedTroupe(mockMvc, newcomer, seedTroupeId)

        val newcomerUser = userRepository.findByGoogleSub(newcomerSub)!!
        val newcomerMembership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, newcomerUser.id)
                ?: error("Missing membership for newcomer")

        val unsyncedParticipant =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                seasonId,
                newcomerMembership.id,
            )
        assert(unsyncedParticipant == null) {
            "precondition: newcomer must not yet have a season participant row"
        }

        val countBefore =
            seasonParticipantRepository.countBySeason_IdAndStatus(seasonId, ParticipantStatus.ACTIVE)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(admin),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath("$.participants[?(@.userId == '${newcomerUser.id}')]").value(empty<Any>()),
            )

        val countAfter =
            seasonParticipantRepository.countBySeason_IdAndStatus(seasonId, ParticipantStatus.ACTIVE)
        assert(countBefore == countAfter) {
            "GET summary must not create season participant rows (was $countBefore, now $countAfter)"
        }

        val stillUnsynced =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                seasonId,
                newcomerMembership.id,
            )
        assert(stillUnsynced == null)
    }

    @Test
    fun `summary excludes unavailable participants from role candidates`() {
        val cookie = memberCookie("sub-avail-summary-unavail")
        val user = userRepository.findByGoogleSub("sub-avail-summary-unavail")!!
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        syncSeasonParticipants(seasonId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$.participants[?(@.userId == '${user.id}')].status").value("unavailable"),
            ).andExpect(jsonPath("$.roles[?(@.candidates.length() > 0)]").isEmpty)
    }

    @Test
    fun `seed season match event exposes template roles and mixed availability summary`() {
        val seedSeasonId = UUID.fromString("b0000001-0000-4000-8000-000000000001")
        val matchEventId = UUID.fromString("c0000002-0000-4000-8000-000000000002")
        val cookie =
            TestAuthSupport.sessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "seed-improbots-22",
                email = "patrice@seed.improbots.test",
                name = "Patrice",
            )

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events?scope=all&size=100").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.id == '$matchEventId')].templateType").value("match"))
            .andExpect(jsonPath("$.content[?(@.id == '$matchEventId')].roleSlots.player").value(5))
            .andExpect(jsonPath("$.content[?(@.id == '$matchEventId')].roleSlots.volunteer").value(5))
            .andExpect(jsonPath("$.content[?(@.id == '$matchEventId')].roleSlots.coach").value(1))

        mockMvc
            .perform(
                get("/v1/seasons/$seedSeasonId/events/$matchEventId/availability/summary")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.eventId").value(matchEventId.toString()))
            .andExpect(jsonPath("$.participants[?(@.displayName == 'Angie')]").exists())
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'player')].requiredCount").value(5))
            .andExpect(jsonPath("$.participants[?(@.status == 'available')]").value(not(empty<Any>())))
            .andExpect(jsonPath("$.participants[?(@.status == 'unavailable')]").value(not(empty<Any>())))
            .andExpect(jsonPath("$.participants[?(@.status == 'unknown')]").value(not(empty<Any>())))
    }

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun participantIdForUser(seasonId: UUID, googleSub: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        return seasonParticipantRepository
            .findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
            ?.id
            ?: error("Missing season participant for $googleSub")
    }

    @Test
    @Tag("FR17")
    fun `organizer proxy sets availability for linked member`() {
        val admin = memberCookie("sub-avail-proxy-admin")
        val member = signInOnly("sub-avail-proxy-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)
        val (seasonId, eventId) = createSeasonAndEvent(admin)
        val memberParticipantId = participantIdForUser(seasonId, "sub-avail-proxy-member")
        val adminUser = userRepository.findByGoogleSub("sub-avail-proxy-admin")!!
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player","mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("available"))
            .andExpect(jsonPath("$.roleKeys[0]").value("player"))

        val row = availabilityRepository.findByEvent_IdAndUser_Id(eventId, userRepository.findByGoogleSub("sub-avail-proxy-member")!!.id)
        assert(row != null)
        assert(row!!.recordedByUserId == adminUser.id)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(member))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$.participants[?(@.participantId == '$memberParticipantId')].status").value("available"),
            )
    }

    @Test
    @Tag("FR17")
    fun `organizer proxy sets availability for name-only participant`() {
        val admin = memberCookie("sub-avail-proxy-nameonly-admin")
        val (seasonId, eventId) = createSeasonAndEvent(admin)
        val nameOnlyId = createSeasonParticipant(seasonId, "Proxy Name Only")
        val adminUser = userRepository.findByGoogleSub("sub-avail-proxy-nameonly-admin")!!
        val proxyPath = "/v1/seasons/$seasonId/events/$eventId/availability/participants/$nameOnlyId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.status").value("unavailable"))

        val row = availabilityRepository.findByEvent_IdAndSeasonParticipant_Id(eventId, nameOnlyId)
        assert(row != null)
        assert(row!!.user == null)
        assert(row.recordedByUserId == adminUser.id)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(admin))
            .andExpect(status().isOk)
            .andExpect(
                jsonPath("$.participants[?(@.participantId == '$nameOnlyId')].status").value("unavailable"),
            )
    }

    @Test
    @Tag("FR17")
    fun `non organizer cannot proxy availability`() {
        val admin = memberCookie("sub-avail-proxy-forbidden-admin")
        val member = signInOnly("sub-avail-proxy-forbidden-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)
        val (seasonId, eventId) = createSeasonAndEvent(admin)
        val otherId = participantIdForUser(seasonId, "sub-avail-proxy-forbidden-admin")
        val proxyPath = "/v1/seasons/$seasonId/events/$eventId/availability/participants/$otherId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR17")
    fun `self me path unchanged when member sets own availability`() {
        val cookie = memberCookie("sub-avail-proxy-me-regression")
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        val user = userRepository.findByGoogleSub("sub-avail-proxy-me-regression")!!
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["mc"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        val row = availabilityRepository.findByEvent_IdAndUser_Id(eventId, user.id)
        assert(row != null)
        assert(row!!.recordedByUserId == null)
    }

    @Test
    @Tag("FR18")
    fun `comment is persisted and returned up to 500 characters`() {
        val cookie = memberCookie("sub-avail-comment")
        val (seasonId, eventId) = createSeasonAndEvent(cookie)
        val base = "/v1/seasons/$seasonId/events/$eventId/availability/me"
        val comment = "Dispo seulement en début de soirée."

        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["mc"],"comment":"$comment"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.comment").value(comment))

        mockMvc
            .perform(get(base).cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.comment").value(comment))

        syncSeasonParticipants(seasonId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.participants[?(@.comment == '$comment')]").isNotEmpty)

        val tooLong = "x".repeat(501)
        mockMvc
            .perform(
                put(base)
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","comment":"$tooLong"}""")
                    .with(csrf()),
            ).andExpect(status().isBadRequest)
    }

    @Test
    @Tag("FR18")
    fun `organizer proxy can set and update member comment`() {
        val admin = memberCookie("sub-avail-proxy-comment-admin")
        val member = signInOnly("sub-avail-proxy-comment-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)
        val (seasonId, eventId) = createSeasonAndEvent(admin)
        val memberParticipantId = participantIdForUser(seasonId, "sub-avail-proxy-comment-member")
        val memberUser = userRepository.findByGoogleSub("sub-avail-proxy-comment-member")!!
        val adminUser = userRepository.findByGoogleSub("sub-avail-proxy-comment-admin")!!
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"
        val proxyComment = "Saisi par l'orga : dispo dès 19h."

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"status":"available","roleKeys":["mc"],"comment":"$proxyComment"}""",
                    )
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.comment").value(proxyComment))

        val row = availabilityRepository.findByEvent_IdAndUser_Id(eventId, memberUser.id)
        assert(row != null)
        assert(row!!.comment == proxyComment)
        assert(row.recordedByUserId == adminUser.id)
    }

    @Test
    @Tag("FR17")
    fun `cannot set availability on archived event`() {
        val admin = memberCookie("sub-avail-archived-admin")
        val member = signInOnly("sub-avail-archived-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)
        val (seasonId, eventId) = createSeasonAndEvent(admin)
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/archive")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        val mePath = "/v1/seasons/$seasonId/events/$eventId/availability/me"
        mockMvc
            .perform(
                put(mePath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        val memberParticipantId = participantIdForUser(seasonId, "sub-avail-archived-member")
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"
        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR19")
    fun `future event summary with chances uses live source`() {
        val admin = memberCookie("sub-avail-chance-live-admin")
        val (seasonId, eventId) =
            createSeasonAndEvent(
                admin,
                """
                {
                  "title": "Future chances",
                  "startsAt": "2031-04-01T19:00:00Z",
                  "roleSlots": { "player": 1 }
                }
                """.trimIndent(),
            )
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true")
                    .cookie(admin),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.chanceSource").value("live"))
    }

    @Test
    @Tag("FR19")
    fun `past event without draw snapshot returns estimated chance source`() {
        val admin = memberCookie("sub-avail-chance-estimated-admin")
        val member = memberCookie("sub-avail-chance-estimated-member")
        val (seasonId, eventId) =
            createSeasonAndEvent(
                admin,
                """
                {
                  "title": "Past migrated",
                  "startsAt": "2020-03-01T19:00:00Z",
                  "roleSlots": { "player": 1 }
                }
                """.trimIndent(),
            )
        setAvailabilityForMember(seasonId, eventId, member, "available", listOf("player"))
        syncSeasonParticipants(seasonId)
        val assigneeId = participantIdForUser(seasonId, "sub-avail-chance-estimated-member")
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                publishedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = assigneeId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/availability/summary?includeChances=true")
                    .cookie(admin),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.chanceSource").value("estimated"))
            .andExpect(jsonPath("$.roles[?(@.roleKey == 'player')].candidates[0].chancePercent").exists())
    }

    @Test
    fun `draft event blocks member availability write until opened`() {
        val admin = memberCookie("sub-avail-draft-admin")
        val member =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                "sub-avail-draft-member",
                email = "sub-avail-draft-member@example.com",
                name = "Draft Member",
            )
        val (seasonId, eventId) = createSeasonAndDraftEvent(admin)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(member))
            .andExpect(status().isForbidden)

        openEventAvailability(seasonId, eventId, admin)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun setAvailabilityForMember(
        seasonId: UUID,
        eventId: UUID,
        member: jakarta.servlet.http.Cookie,
        status: String,
        roleKeys: List<String>,
    ) {
        val roleKeysJson = roleKeys.joinToString(prefix = "[", postfix = "]") { "\"$it\"" }
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"$status","roleKeys":$roleKeysJson}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }
}
