package com.hatcast.api.participant

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.troupe.TroupeMembershipStatus
import com.hatcast.api.user.UserRepository
import jakarta.servlet.http.Cookie
import org.hamcrest.Matchers.hasSize
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
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
import com.hatcast.api.notification.NotificationDispatcher
import com.hatcast.api.notification.NotificationIntent
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
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
class GuestInvitationAccessIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationDispatcher: NotificationDispatcher

    @Autowired
    private lateinit var troupeMembershipRepository: TroupeMembershipRepository

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private data class SessionFixture(
        val cookie: Cookie,
        val userId: String,
        val email: String,
    )

    @BeforeEach
    fun resetMocks() {
        org.mockito.kotlin.reset(notificationDispatcher)
    }

    private fun signIn(
        googleSub: String,
        email: String,
        displayName: String,
        joinSeed: Boolean = true,
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
        val cookie =
            result.response.getCookie("HATCAST_SESSION")!!.also { sessionCookie ->
                if (joinSeed) {
                    TestAuthSupport.joinSeedTroupe(mockMvc, sessionCookie, seedTroupeId)
                }
            }
        return SessionFixture(
            cookie = cookie,
            userId = root.path("user").path("id").asText(),
            email = email,
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

    private fun createSeason(cookie: Cookie, title: String = "Guest scope season"): UUID {
        val result =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"$title"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(result.response.contentAsString).path("id").asText())
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

    private fun addSeasonGuest(
        admin: SessionFixture,
        seasonId: UUID,
        displayName: String,
        email: String,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"$displayName","email":"$email"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun addEventGuest(
        admin: SessionFixture,
        seasonId: UUID,
        eventId: UUID,
        displayName: String,
        email: String,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"$displayName","email":"$email"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun addExterneCarnet(
        admin: SessionFixture,
        displayName: String,
        email: String,
    ) {
        mockMvc
            .perform(
                post("/v1/troupes/$seedTroupeId/externes")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"$displayName","email":"$email"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun seasonParticipantIdForGuestUser(
        seasonId: UUID,
        userId: UUID,
    ): UUID =
        seasonParticipantRepository
            .findActiveForSeasonLinkedToUser(seasonId, ParticipantStatus.ACTIVE, userId)
            .firstOrNull()
            ?.id
            ?: error("Missing season participant for user $userId")

    private fun seasonParticipantIdForEmail(
        admin: SessionFixture,
        seasonId: UUID,
        email: String,
        eventId: UUID? = null,
    ): UUID {
        val result =
            mockMvc
                .perform(get("/v1/seasons/$seasonId/participants").cookie(admin.cookie))
                .andExpect(status().isOk)
                .andReturn()
        val rows = mapper.readTree(result.response.contentAsString)
        for (row in rows) {
            if (row.path("email").asText().equals(email, ignoreCase = true)) {
                return UUID.fromString(row.path("id").asText())
            }
        }
        if (eventId != null) {
            val roster =
                mockMvc
                    .perform(get("/v1/seasons/$seasonId/events/$eventId/participants/roster").cookie(admin.cookie))
                    .andExpect(status().isOk)
                    .andReturn()
            for (row in mapper.readTree(roster.response.contentAsString)) {
                if (row.path("email").asText().equals(email, ignoreCase = true)) {
                    val id = row.path("seasonParticipantId").asText(null)
                    if (id != null) {
                        return UUID.fromString(id)
                    }
                }
            }
        }
        error("Missing season participant for $email")
    }

    private fun excludeSeasonParticipantFromEvent(
        admin: SessionFixture,
        seasonId: UUID,
        eventId: UUID,
        seasonParticipantId: UUID,
    ) {
        mockMvc
            .perform(
                delete(
                    "/v1/seasons/$seasonId/events/$eventId/participants/roster/season/$seasonParticipantId",
                ).cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)
    }

    private fun seedPendingComposition(
        eventId: UUID,
        participantId: UUID,
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
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun seedValidatedComposition(
        eventId: UUID,
        participantId: UUID,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = now,
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
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun participationPath(seasonId: UUID, eventId: UUID): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation"

    private fun deactivateExterneCarnet(email: String) {
        val user = userRepository.findFirstByEmailIgnoreCase(email) ?: return
        val membership =
            troupeMembershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: return
        if (membership.baselineRole == TroupeBaselineRole.EXTERNE) {
            membership.status = TroupeMembershipStatus.INACTIVE
            troupeMembershipRepository.save(membership)
        }
    }

    @Test
    fun `Laetitia SEASON guest sees published season events on agenda and partial workspace`() {
        val admin = signInAdmin("guest-laetitia-admin", "guest-laetitia-admin@example.com", "Admin")
        val laetitia = signIn("guest-laetitia", "laetitia-guest@example.com", "Laetitia", joinSeed = false)
        val seasonId = createSeason(admin.cookie, "Laetitia season")
        val seasonSlug =
            mapper
                .readTree(
                    mockMvc
                        .perform(get("/v1/seasons/$seasonId").cookie(admin.cookie))
                        .andExpect(status().isOk)
                        .andReturn()
                        .response.contentAsString,
                ).path("slug")
                .asText()
        val eventA = createEvent(admin.cookie, seasonId, "Show A", "2030-07-01T18:00:00Z")
        val eventB = createEvent(admin.cookie, seasonId, "Show B", "2030-08-01T18:00:00Z")
        addSeasonGuest(admin, seasonId, "Laetitia", laetitia.email)
        openAvailability(admin.cookie, seasonId, eventA)
        openAvailability(admin.cookie, seasonId, eventB)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(2)))

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("AGENDA_ONLY"))

        mockMvc
            .perform(
                get("/v1/troupes/by-slug/les-improbots/seasons/by-slug/$seasonSlug")
                    .cookie(laetitia.cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.season.guestSeasonWorkspaceMode").value("AGENDA_ONLY"))
            .andExpect(jsonPath("$.troupe.slug").value("les-improbots"))

        mockMvc
            .perform(get("/v1/troupes/by-slug/les-improbots/context").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.slug").value("les-improbots"))
            .andExpect(jsonPath("$.membership.baselineRole").value("EXTERNE"))

        mockMvc
            .perform(get("/v1/troupes").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].slug").value("les-improbots"))
            .andExpect(jsonPath("$[0].membership.baselineRole").value("EXTERNE"))

        mockMvc
            .perform(get("/v1/troupes/discover").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.slug == 'les-improbots')]").isEmpty)

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].guestSeasonWorkspaceMode").value("AGENDA_ONLY"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events?scope=upcoming").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(2)))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events?scope=past").cookie(laetitia.cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/statistics").cookie(laetitia.cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `Ruben EVENT guest sees single event and partial season workspace with history`() {
        val admin = signInAdmin("guest-ruben-admin", "guest-ruben-admin@example.com", "Admin")
        val ruben = signIn("guest-ruben", "ruben-guest@example.com", "Ruben", joinSeed = false)
        val seasonId = createSeason(admin.cookie, "Ruben season")
        val invitedEvent = createEvent(admin.cookie, seasonId, "Ruben show", "2030-07-01T18:00:00Z")
        createEvent(admin.cookie, seasonId, "Sibling show", "2030-08-01T18:00:00Z")
        addEventGuest(admin, seasonId, invitedEvent, "Ruben", ruben.email)
        openAvailability(admin.cookie, seasonId, invitedEvent)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(ruben.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].eventId").value(invitedEvent.toString()))

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(ruben.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("EVENTS_ONLY"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events?scope=upcoming").cookie(ruben.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].id").value(invitedEvent.toString()))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/statistics").cookie(ruben.cookie))
            .andExpect(status().isForbidden)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$invitedEvent/composition").cookie(ruben.cookie),
            ).andExpect(status().isOk)
    }

    @Test
    fun `active externe carnet without invitation gets empty agenda and forbidden troupe reads`() {
        val admin = signInAdmin("guest-carnet-active-admin", "guest-carnet-active-admin@example.com", "Admin")
        val externe =
            signIn("guest-carnet-active", "carnet-only-active@example.com", "Carnet Active", joinSeed = false)
        addExterneCarnet(admin, "Carnet Active", externe.email)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(externe.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isEmpty)
            .andExpect(jsonPath("$.noParticipation").value(true))

        mockMvc
            .perform(get("/v1/troupes").cookie(externe.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(0))

        mockMvc
            .perform(get("/v1/troupes/$seedTroupeId/seasons").cookie(externe.cookie))
            .andExpect(status().isForbidden)
    }

    @Test
    fun `carnet-only linked account with inactive externe membership gets empty agenda`() {
        val externe = signIn("guest-carnet-only", "carnet-only@example.com", "Carnet Only", joinSeed = false)
        deactivateExterneCarnet(externe.email)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(externe.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isEmpty)
            .andExpect(jsonPath("$.noParticipation").value(true))
    }

    @Test
    fun `guest availability write allowed in scope and forbidden out of scope`() {
        val admin = signInAdmin("guest-avail-admin", "guest-avail-admin@example.com", "Admin")
        val ruben = signIn("guest-avail-ruben", "ruben-avail@example.com", "Ruben Avail", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val invited = createEvent(admin.cookie, seasonId, "Invited show")
        val sibling = createEvent(admin.cookie, seasonId, "Other show")
        addEventGuest(admin, seasonId, invited, "Ruben Avail", ruben.email)
        openAvailability(admin.cookie, seasonId, invited)
        openAvailability(admin.cookie, seasonId, sibling)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$invited/availability/me")
                    .cookie(ruben.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$sibling/availability/me")
                    .cookie(ruben.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    fun `guest can read in-scope event detail`() {
        val admin = signInAdmin("guest-detail-admin", "guest-detail-admin@example.com", "Admin")
        val guest = signIn("guest-detail", "guest-detail@example.com", "Guest Detail", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId, "Detail show")
        addEventGuest(admin, seasonId, eventId, "Guest Detail", guest.email)
        openAvailability(admin.cookie, seasonId, eventId)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$eventId").cookie(guest.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(eventId.toString()))
    }

    @Test
    fun `open-availability notifies linked season-scoped externe`() {
        val admin = signInAdmin("guest-notif-admin", "guest-notif-admin@example.com", "Admin")
        val laetitia = signIn("guest-notif-laetitia", "laetitia-notif@example.com", "Laetitia Notif", joinSeed = false)
        val seasonId = createSeason(admin.cookie, "Notif season")
        val eventId = createEvent(admin.cookie, seasonId, "Notif show")
        addSeasonGuest(admin, seasonId, "Laetitia Notif", laetitia.email)

        openAvailability(admin.cookie, seasonId, eventId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.AVAILABILITY_OPENED &&
                    eventId == this.eventId &&
                    seasonId == this.seasonId
            },
        )
    }

    @Test
    fun `Laetitia SEASON agenda excludes unpublished events and roster exclusions`() {
        val admin = signInAdmin("guest-laetitia-excl-admin", "guest-laetitia-excl-admin@example.com", "Admin")
        val laetitia = signIn("guest-laetitia-excl", "laetitia-excl@example.com", "Laetitia Excl", joinSeed = false)
        val seasonId = createSeason(admin.cookie, "Laetitia exclusion season")
        val published = createEvent(admin.cookie, seasonId, "Published show", "2030-07-01T18:00:00Z")
        createEvent(admin.cookie, seasonId, "Draft show", "2030-07-02T18:00:00Z")
        val excluded = createEvent(admin.cookie, seasonId, "Excluded show", "2030-07-03T18:00:00Z")
        addSeasonGuest(admin, seasonId, "Laetitia Excl", laetitia.email)
        openAvailability(admin.cookie, seasonId, published)
        openAvailability(admin.cookie, seasonId, excluded)
        val participantId = seasonParticipantIdForEmail(admin, seasonId, laetitia.email)
        excludeSeasonParticipantFromEvent(admin, seasonId, excluded, participantId)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(laetitia.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))
            .andExpect(jsonPath("$.content[0].eventId").value(published.toString()))
    }

    @Test
    fun `Ruben EVENT guest gets not found for sibling event detail`() {
        val admin = signInAdmin("guest-ruben-detail-admin", "guest-ruben-detail-admin@example.com", "Admin")
        val ruben = signIn("guest-ruben-detail", "ruben-detail@example.com", "Ruben Detail", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val invited = createEvent(admin.cookie, seasonId, "Invited detail")
        val sibling = createEvent(admin.cookie, seasonId, "Sibling detail")
        addEventGuest(admin, seasonId, invited, "Ruben Detail", ruben.email)
        openAvailability(admin.cookie, seasonId, invited)
        openAvailability(admin.cookie, seasonId, sibling)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$invited").cookie(ruben.cookie))
            .andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events/$sibling").cookie(ruben.cookie))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `removed season invitation drops event from guest agenda`() {
        val admin = signInAdmin("guest-removed-admin", "guest-removed-admin@example.com", "Admin")
        val guest = signIn("guest-removed", "guest-removed@example.com", "Removed Guest", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId, "Removed show")
        addSeasonGuest(admin, seasonId, "Removed Guest", guest.email)
        openAvailability(admin.cookie, seasonId, eventId)
        val participantId = seasonParticipantIdForEmail(admin, seasonId, guest.email)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(guest.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(1)))

        mockMvc
            .perform(
                delete("/v1/seasons/$seasonId/participants/$participantId")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isNoContent)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(guest.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isEmpty)
            .andExpect(jsonPath("$.noParticipation").value(true))
    }

    @Test
    fun `validate composition dispatches confirmation request to linked season guest`() {
        val admin = signInAdmin("guest-confirm-admin", "guest-confirm-admin@example.com", "Admin")
        val laetitia = signIn("guest-confirm-laetitia", "laetitia-confirm@example.com", "Laetitia Confirm", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId, "Confirm show")
        addSeasonGuest(admin, seasonId, "Laetitia Confirm", laetitia.email)
        openAvailability(admin.cookie, seasonId, eventId)
        org.mockito.kotlin.reset(notificationDispatcher)
        val participantId = seasonParticipantIdForGuestUser(seasonId, UUID.fromString(laetitia.userId))
        seedPendingComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin.cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST && eventId == this.eventId
            },
        )
    }

    @Test
    fun `season guest can confirm validated composition participation`() {
        val admin = signInAdmin("guest-part-admin", "guest-part-admin@example.com", "Admin")
        val laetitia = signIn("guest-part-laetitia", "laetitia-part@example.com", "Laetitia Part", joinSeed = false)
        val seasonId = createSeason(admin.cookie)
        val eventId = createEvent(admin.cookie, seasonId, "Participation show")
        addSeasonGuest(admin, seasonId, "Laetitia Part", laetitia.email)
        openAvailability(admin.cookie, seasonId, eventId)
        val participantId = seasonParticipantIdForGuestUser(seasonId, UUID.fromString(laetitia.userId))
        seedValidatedComposition(eventId, participantId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(laetitia.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.slots[0].participantId").value(participantId.toString()))
            .andExpect(jsonPath("$.slots[0].participationStatus").value("confirmed"))
    }

    @Test
    fun `multi troupe guest invitations aggregate on agenda with filter bar`() {
        val admin = signInAdmin("guest-multi-admin", "guest-multi-admin@example.com", "Admin")
        val guest = signIn("guest-multi", "guest-multi@example.com", "Multi Guest", joinSeed = false)
        val seedSeasonId = createSeason(admin.cookie, "Seed troupe season")
        val seedEvent = createEvent(admin.cookie, seedSeasonId, "Seed troupe show")
        addSeasonGuest(admin, seedSeasonId, "Multi Guest", guest.email)
        openAvailability(admin.cookie, seedSeasonId, seedEvent)

        val troupeResult =
            mockMvc
                .perform(
                    post("/v1/troupes")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"name":"Guest multi troupe B"}""")
                        .with(csrf()),
                ).andExpect(status().isCreated)
                .andReturn()
        val troupeBId = UUID.fromString(mapper.readTree(troupeResult.response.contentAsString).path("id").asText())
        val seasonBResult =
            mockMvc
                .perform(
                    post("/v1/troupes/$troupeBId/seasons")
                        .cookie(admin.cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Troupe B season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val seasonBId = UUID.fromString(mapper.readTree(seasonBResult.response.contentAsString).path("id").asText())
        val eventB = createEvent(admin.cookie, seasonBId, "Troupe B show")
        mockMvc
            .perform(
                post("/v1/seasons/$seasonBId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Multi Guest","email":"${guest.email}"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        openAvailability(admin.cookie, seasonBId, eventB)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(guest.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content", hasSize<Any>(2)))
            .andExpect(jsonPath("$.filterBarVisible").value(true))
    }

    @Test
    fun `troupe member season workspace regression unchanged`() {
        val admin = signInAdmin("guest-member-reg", "guest-member-reg@example.com", "Member Reg")
        val seasonId = createSeason(admin.cookie, "Member regression")
        val eventId = createEvent(admin.cookie, seasonId, "Member show")
        openAvailability(admin.cookie, seasonId, eventId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/participants")
                    .cookie(admin.cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"displayName":"Member Reg","email":"guest-member-reg@example.com"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/me/agenda").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content[?(@.eventId == '$eventId')]").exists())

        mockMvc
            .perform(get("/v1/seasons/$seasonId").cookie(admin.cookie))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.guestSeasonWorkspaceMode").value("FULL"))

        mockMvc
            .perform(get("/v1/seasons/$seasonId/events?scope=past").cookie(admin.cookie))
            .andExpect(status().isOk)

        mockMvc
            .perform(get("/v1/seasons/$seasonId/statistics").cookie(admin.cookie))
            .andExpect(status().isOk)
    }
}
