package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompositionLifecycleIntegrationTest {
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
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun memberCookie(googleSub: String, admin: Boolean = false): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Lifecycle Test",
            )
        if (admin) {
            promoteToAdmin(googleSub)
        }
        return cookie
    }

    private fun promoteToAdmin(googleSub: String) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Lifecycle season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String,
    ): UUID {
        val future = Instant.parse("2031-03-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "$title",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        return eventId
    }

    private fun createSeasonParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val saved =
            seasonParticipantRepository.save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            )
        return saved.id
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
                    post("/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"idToken":"fake","rememberMe":true}"""),
                ).andExpect(status().isOk)
                .andReturn()
        return result.response.getCookie("HATCAST_SESSION")!!
    }

    private fun seedValidatedComposition(
        eventId: UUID,
        slots: List<EventCompositionSlotEntity>,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slots.forEach { slotRepository.save(it) }
    }

    private fun seedDraftComposition(eventId: UUID, participantId: UUID) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    @Test
    @Tag("FR28")
    fun `list events exposes preparing lifecycle and collecting badge by default`() {
        val cookie = memberCookie("sub-lifecycle-default", admin = true)
        val seasonId = createSeason(cookie)
        createEvent(cookie, seasonId, "Sans composition")

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].compositionLifecycle").value("preparing"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.key").value("collecting"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.label").value("Collecte des dispos"))
    }

    @Test
    fun `draft composition hidden from regular member`() {
        val adminCookie = memberCookie("sub-lifecycle-admin", admin = true)
        val memberCookie = memberCookie("sub-lifecycle-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Draft hidden")
        val participantId = createSeasonParticipant(seasonId, "Joueur test")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].compositionLifecycle").value("preparing"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.key").value("collecting"))
    }

    @Test
    fun `organizer sees draft composition with preparing team badge`() {
        val adminCookie = memberCookie("sub-lifecycle-org-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Draft visible org")
        seedDraftComposition(eventId, createSeasonParticipant(seasonId, "Joueur org"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].compositionLifecycle").value("draftComposition"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.key").value("preparing"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.label").value("Équipe en préparation"))
    }

    @Test
    fun `event organizer sees draft composition without troupe admin role`() {
        val adminCookie = memberCookie("sub-lifecycle-event-org-admin", admin = true)
        val eventOrgCookie = memberCookie("sub-lifecycle-event-org")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Draft event org")
        seedDraftComposition(eventId, createSeasonParticipant(seasonId, "Joueur event org"))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/organizers")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"email":"sub-lifecycle-event-org@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events").cookie(eventOrgCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[0].compositionLifecycle").value("draftComposition"))
            .andExpect(jsonPath("$.content[0].teamStatusBadge.key").value("preparing"))
    }

    @Test
    fun `awaiting confirmations lifecycle exposes preparing team badge`() {
        val cookie = memberCookie("sub-lifecycle-awaiting", admin = true)
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Awaiting")
        val p1 = createSeasonParticipant(seasonId, "Joueur confirmé")
        val p2 = createSeasonParticipant(seasonId, "Joueur pending")
        seedValidatedComposition(
            eventId,
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = p1,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 1,
                    seasonParticipantId = p2,
                    participationStatus = SlotParticipationStatus.PENDING,
                ),
            ),
        )

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("awaitingConfirmations"))
            .andExpect(jsonPath("$.teamStatusBadge.key").value("preparing"))
            .andExpect(jsonPath("$.teamStatusBadge.label").value("Équipe en préparation"))
    }

    @Test
    fun `gaps to fill lifecycle exposes preparing team badge`() {
        val cookie = memberCookie("sub-lifecycle-gaps", admin = true)
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Gaps")
        val p1 = createSeasonParticipant(seasonId, "Joueur seul")
        seedValidatedComposition(
            eventId,
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = p1,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            ),
        )

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("gapsToFill"))
            .andExpect(jsonPath("$.teamStatusBadge.key").value("preparing"))
    }

    @Test
    fun `declined slot with assignee yields gaps to fill`() {
        val cookie = memberCookie("sub-lifecycle-declined", admin = true)
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Declined gap")
        val p1 = createSeasonParticipant(seasonId, "Joueur confirmé")
        val p2 = createSeasonParticipant(seasonId, "Joueur décliné")
        seedValidatedComposition(
            eventId,
            listOf(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 0,
                    seasonParticipantId = p1,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = 1,
                    seasonParticipantId = p2,
                    participationStatus = SlotParticipationStatus.DECLINED,
                ),
            ),
        )

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("gapsToFill"))
    }

    @Test
    fun `complete validated composition exposes confirmed badge`() {
        val cookie = memberCookie("sub-lifecycle-complete", admin = true)
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId, "Complete")
        val now = Instant.now()
        val p1 = createSeasonParticipant(seasonId, "Joueur A")
        val p2 = createSeasonParticipant(seasonId, "Joueur B")
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
                createdAt = now,
                updatedAt = now,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = p1,
                participationStatus = SlotParticipationStatus.CONFIRMED,
            ),
        )
        slotRepository.save(
            EventCompositionSlotEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 1,
                seasonParticipantId = p2,
                participationStatus = SlotParticipationStatus.CONFIRMED,
            ),
        )

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("complete"))
            .andExpect(jsonPath("$.teamStatusBadge.key").value("confirmed"))
    }

    @Test
    fun `unauthenticated caller cannot list season events`() {
        val adminCookie = memberCookie("sub-lifecycle-outsider-admin", admin = true)
        val seasonId = createSeason(adminCookie)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `authenticated non member cannot list or read season events`() {
        val adminCookie = memberCookie("sub-lifecycle-forbidden-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Forbidden")
        val outsider = signInOnly("sub-lifecycle-forbidden-outsider")

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events").cookie(outsider))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(outsider))
            .andExpect(status().isNotFound)
    }
}
