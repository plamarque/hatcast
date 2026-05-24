package com.hatcast.api.composition

import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
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
class CompositionValidateUnlockIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationPort: CompositionNotificationPort

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
                name = "Validate Unlock Test",
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
                        .content("""{"title":"Validate season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        title: String,
        playerCount: Int = 2,
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
                              "roleSlots": { "player": $playerCount }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
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

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        status: String,
    ) {
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"$status","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
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
            ?: error("Missing season participant")
    }

    private fun seedDraftComposition(
        eventId: UUID,
        participantId: UUID,
        participationStatus: SlotParticipationStatus = SlotParticipationStatus.CONFIRMED,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                publishedAt = null,
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
                participationStatus = participationStatus,
            ),
        )
    }

    @Test
    @Tag("FR23")
    fun `POST validate sets validatedAt and member sees slots without publish`() {
        val adminCookie = memberCookie("sub-validate-admin-1", admin = true)
        val memberCookie = memberCookie("sub-validate-member-1")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Validate flow")
        val participantId = createSeasonParticipant(seasonId, "Alice")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("validated"))
            .andExpect(jsonPath("$.validatedAt").isNotEmpty)
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))

        verify(notificationPort, times(1)).requestCompositionConfirmation(
            eq(eventId),
            eq(seasonId),
            any(),
        )

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("validated"))
            .andExpect(jsonPath("$.slots[0].participantDisplayName").value("Alice"))
    }

    @Test
    @Tag("FR28")
    fun `validate with empty required slot yields gapsToFill lifecycle`() {
        val adminCookie = memberCookie("sub-validate-gaps-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Validate gaps", playerCount = 2)
        val participantId = createSeasonParticipant(seasonId, "Bob")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("gapsToFill"))
    }

    @Test
    fun `validate full composition yields awaitingConfirmations lifecycle`() {
        val adminCookie = memberCookie("sub-validate-await-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Validate awaiting", playerCount = 1)
        val p1 = createSeasonParticipant(seasonId, "Charlie")
        seedDraftComposition(eventId, p1)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(adminCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.compositionLifecycle").value("awaitingConfirmations"))
    }

    @Test
    fun `validate is idempotent and does not re-fire notification`() {
        val adminCookie = memberCookie("sub-validate-idem-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Idempotent validate")
        val participantId = createSeasonParticipant(seasonId, "Dana")
        seedDraftComposition(eventId, participantId)

        val first =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                        .cookie(adminCookie)
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val validatedAt = mapper.readTree(first.response.contentAsString).get("validatedAt").asText()

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.validatedAt").value(validatedAt))

        verify(notificationPort, times(1)).requestCompositionConfirmation(
            eq(eventId),
            eq(seasonId),
            any(),
        )
    }

    @Test
    fun `POST unlock clears validatedAt and resets participation to pending`() {
        val adminCookie = memberCookie("sub-unlock-admin-1", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unlock flow")
        val participantId = createSeasonParticipant(seasonId, "Eve")
        seedDraftComposition(eventId, participantId, SlotParticipationStatus.CONFIRMED)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.validatedAt").isEmpty)
            .andExpect(jsonPath("$.visibility").value("organizerDraft"))
            .andExpect(jsonPath("$.slots[0].participantDisplayName").value("Eve"))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("pending"))
    }

    @Test
    @Tag("FR23")
    fun `unlock on unpublished validated draft hides slots from member`() {
        val adminCookie = memberCookie("sub-unlock-member-vis-admin", admin = true)
        val memberCookie = memberCookie("sub-unlock-member-vis-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unlock member visibility")
        val participantId = createSeasonParticipant(seasonId, "MemberVis")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("validated"))
            .andExpect(jsonPath("$.slots.length()").value(1))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.validatedAt").isEmpty)
            .andExpect(jsonPath("$.publishedAt").isEmpty)
            .andExpect(jsonPath("$.visibility").value("organizerDraft"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("none"))
            .andExpect(jsonPath("$.slots").isEmpty)
    }

    @Test
    @Tag("FR23")
    fun `unlock keeps publishedAt and member still sees published draft`() {
        val adminCookie = memberCookie("sub-unlock-publish-admin", admin = true)
        val memberCookie = memberCookie("sub-unlock-publish-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unlock keeps publish")
        val participantId = createSeasonParticipant(seasonId, "PublishedKeep")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.publishedAt").isNotEmpty)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("validated"))

        val unlock =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                        .cookie(adminCookie)
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andExpect(jsonPath("$.validatedAt").isEmpty)
                .andExpect(jsonPath("$.publishedAt").isNotEmpty)
                .andExpect(jsonPath("$.visibility").value("publishedDraft"))
                .andReturn()
        val publishedAt = mapper.readTree(unlock.response.contentAsString).get("publishedAt").asText()

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId/composition").cookie(memberCookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.visibility").value("publishedDraft"))
            .andExpect(jsonPath("$.publishedAt").value(publishedAt))
            .andExpect(jsonPath("$.slots[0].participantDisplayName").value("PublishedKeep"))
    }

    @Test
    fun `assign works after unlock`() {
        val adminCookie = memberCookie("sub-unlock-assign-admin", admin = true)
        val member1 = memberCookie("sub-unlock-assign-member-1")
        val member2 = memberCookie("sub-unlock-assign-member-2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unlock assign", playerCount = 1)
        setAvailability(member1, seasonId, eventId, "available")
        setAvailability(member2, seasonId, eventId, "available")
        val p1 = participantIdForUser(seasonId, "sub-unlock-assign-member-1")
        val p2 = participantIdForUser(seasonId, "sub-unlock-assign-member-2")
        seedDraftComposition(eventId, p1)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(adminCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId":"$p2"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(p2.toString()))
    }

    @Test
    fun `validate without assignees returns 409`() {
        val adminCookie = memberCookie("sub-validate-empty-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Empty validate")
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = null,
                publishedAt = null,
                createdAt = now,
                updatedAt = now,
            ),
        )

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `unlock when not validated returns 409`() {
        val adminCookie = memberCookie("sub-unlock-not-valid-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Unlock not valid")
        val participantId = createSeasonParticipant(seasonId, "Helen")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    fun `non organizer cannot validate or unlock`() {
        val adminCookie = memberCookie("sub-validate-forbidden-admin", admin = true)
        val memberCookie = memberCookie("sub-validate-forbidden-member")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Forbidden validate")
        val participantId = createSeasonParticipant(seasonId, "Ivan")
        seedDraftComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(memberCookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(adminCookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(memberCookie)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `outsider cannot validate or unlock`() {
        val adminCookie = memberCookie("sub-validate-outsider-admin", admin = true)
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId, "Outsider validate")
        val participantId = createSeasonParticipant(seasonId, "Jane")
        seedDraftComposition(eventId, participantId)
        val outsider = signInOnly("sub-validate-outsider")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(outsider)
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }
}
