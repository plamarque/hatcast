package com.hatcast.api.share

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.notification.NotificationDispatchContext
import com.hatcast.api.notification.NotificationDispatcher
import com.hatcast.api.notification.NotificationIntent
import com.hatcast.api.organizer.SeasonOrganizerEntity
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argThat
import org.mockito.kotlin.reset
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
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
class ManualAvailabilityNudgeIntegrationTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var googleIdTokenService: GoogleIdTokenService

    @MockBean
    private lateinit var idpIdTokenVerifier: IdpIdTokenVerifier

    @MockBean
    private lateinit var notificationDispatcher: NotificationDispatcher

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
    private lateinit var seasonOrganizerRepository: SeasonOrganizerRepository

    @Autowired
    private lateinit var manualShareNotifyRepository: EventManualShareNotifyRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        reset(notificationDispatcher)
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Nudge Admin",
            )
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing membership")
        membership.baselineRole = TroupeBaselineRole.TROUPE_ADMIN
        membershipRepository.save(membership)
        return cookie
    }

    private fun memberCookie(googleSub: String): jakarta.servlet.http.Cookie =
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc,
            googleIdTokenService,
            googleSub,
            email = "$googleSub@example.com",
            name = "Nudge Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Nudge season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2033-06-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Nudge event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun openAvailability(
        cookie: jakarta.servlet.http.Cookie,
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

    private fun ensureRoster(seasonId: UUID) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
    }

    private fun addNameOnlyParticipant(seasonId: UUID): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = "Sans compte",
                ),
            ).id
    }

    private fun grantNonParticipantSeasonOrganizer(
        cookie: jakarta.servlet.http.Cookie,
        googleSub: String,
        seasonId: UUID,
    ) {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing organizer user")
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)
                ?: error("Missing organizer membership")
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonOrganizerRepository.save(
            SeasonOrganizerEntity(
                season = season,
                user = user,
                grantedAt = Instant.now(),
                grantedBy = null,
            ),
        )
        val participant =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id)
                ?: error("Missing organizer season participant")
        participant.status = com.hatcast.api.participant.ParticipantStatus.REMOVED
        participant.removedAt = Instant.now()
        participant.removalSource = SeasonParticipantRemovalSource.SEASON_ADMIN
        participant.updatedAt = Instant.now()
        seasonParticipantRepository.save(participant)
    }

    private fun setMyAvailability(
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
                    .content("""{"status":"$status","roleKeys":["player"],"comment":null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge returns unknown participants and guard metadata`() {
        val admin = adminCookie("sub-nudge-admin-1")
        val member = memberCookie("sub-nudge-member-1")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        addNameOnlyParticipant(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        setMyAvailability(member, seasonId, eventId, "available")

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(admin),
            )            .andExpect(status().isOk)
            .andExpect(jsonPath("$.total").isNumber)
            .andExpect(jsonPath("$.guardDays").value(3))
            .andExpect(jsonPath("$.lastManualNotifyAt").isEmpty)
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge returns 409 for draft event`() {
        val admin = adminCookie("sub-nudge-admin-2")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(admin),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge returns 409 when everyone responded`() {
        val admin = adminCookie("sub-nudge-admin-3")
        val member = memberCookie("sub-nudge-member-3")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)

        val summaryRes =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/events/$eventId/availability/summary")
                        .cookie(admin),
                ).andExpect(status().isOk)
                .andReturn()
        val participants = mapper.readTree(summaryRes.response.contentAsString).get("participants")
        for (node in participants) {
            val participantId = node.get("participantId").asText()
            mockMvc
                .perform(
                    put("/v1/seasons/$seasonId/events/$eventId/availability/participants/$participantId")
                        .cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"status":"available","roleKeys":["player"],"comment":null}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
        }
        setMyAvailability(member, seasonId, eventId, "unavailable")

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(admin),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `POST availability_nudge dispatches and records lastManualNudgeAt`() {
        val admin = adminCookie("sub-nudge-admin-4")
        memberCookie("sub-nudge-member-4")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        addNameOnlyParticipant(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)

        val preview =
            mapper.readTree(
                mockMvc
                    .perform(
                        get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                            .param("intent", "availability_nudge")
                            .cookie(admin),
                    ).andExpect(status().isOk)
                    .andReturn()
                    .response.contentAsString,
            )
        val fingerprint = preview.get("confirmationFingerprint").asText()
        val selectedParticipantId =
            preview
                .get("recipients")
                .first { recipient ->
                    recipient.get("channels").get("email").get("eligible").asBoolean() ||
                        recipient.get("channels").get("push").get("eligible").asBoolean()
                }
                .get("participantId")
                .asText()

        val message = "⏰ Rappel test dispos"

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"intent":"availability_nudge","messageText":"$message","confirmationFingerprint":"$fingerprint","recipientParticipantIds":["$selectedParticipantId"]}""",
                    ).with(csrf()),
            )            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accepted").value(true))
            .andExpect(jsonPath("$.notifiedCount").isNumber)
            .andExpect(jsonPath("$.acceptedCount").value(1))
            .andExpect(jsonPath("$.intent").value("availability_nudge"))

        verify(notificationDispatcher).dispatch(
            argThat { ctx: NotificationDispatchContext ->
                ctx.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE &&
                    ctx.eventId == eventId &&
                    ctx.seasonId == seasonId &&
                    ctx.customMessageBody == message &&
                    ctx.recipientUserIds.size == 1
            },
        )

        org.junit.jupiter.api.Assertions.assertNotNull(
            manualShareNotifyRepository
                .findById(EventManualShareNotifyId(eventId, "availability_nudge"))
                .orElse(null),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(admin),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.lastManualNotifyAt").exists())
    }

    @Test
    @Tag("FR31")
    fun `season organizer without admin or participant access can preview and notify selected unknown recipient`() {
        val admin = adminCookie("sub-nudge-organizer-admin")
        val organizerSub = "sub-nudge-organizer"
        val organizer = memberCookie(organizerSub)
        memberCookie("sub-nudge-organizer-recipient")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        grantNonParticipantSeasonOrganizer(organizer, organizerSub, seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)

        val summary =
            mapper.readTree(
                mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(organizer))
                    .andExpect(status().isOk).andReturn().response.contentAsString,
            )
        val organizerUser = userRepository.findByGoogleSub(organizerSub) ?: error("Missing organizer user")
        org.junit.jupiter.api.Assertions.assertTrue(
            summary.get("participants").none { participant -> participant.get("userId")?.asText() == organizerUser.id.toString() },
            "The dedicated organizer must not be an active season participant",
        )

        val preview =
            mapper.readTree(
                mockMvc.perform(
                    get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                        .param("intent", "availability_nudge")
                        .cookie(organizer),
                ).andExpect(status().isOk).andReturn().response.contentAsString,
            )
        val selectedParticipantId =
            preview.get("recipients").first { recipient ->
                recipient.get("channels").get("email").get("eligible").asBoolean() ||
                    recipient.get("channels").get("push").get("eligible").asBoolean()
            }.get("participantId").asText()

        mockMvc.perform(
            post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                .cookie(organizer)
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """{"intent":"availability_nudge","messageText":"Rappel organisateur","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}","recipientParticipantIds":["$selectedParticipantId"]}""",
                ).with(csrf()),
        ).andExpect(status().isOk)
            .andExpect(jsonPath("$.acceptedCount").value(1))

        verify(notificationDispatcher).dispatch(
            argThat { context: NotificationDispatchContext ->
                context.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE &&
                    context.eventId == eventId &&
                    context.actorUserId == organizerUser.id
            },
        )
    }

    @Test
    @Tag("FR31")
    fun `POST availability_nudge rejects an empty selection without side effects`() {
        val admin = adminCookie("sub-nudge-empty-selection")
        memberCookie("sub-nudge-empty-selection-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val fingerprint =
            mapper.readTree(
                mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients").param("intent", "availability_nudge").cookie(admin))
                    .andExpect(status().isOk).andReturn().response.contentAsString,
            ).get("confirmationFingerprint").asText()

        reset(notificationDispatcher)
        mockMvc.perform(
            post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"$fingerprint","recipientParticipantIds":[]}""")
                .with(csrf()),
        ).andExpect(status().isBadRequest)

        verifyNoInteractions(notificationDispatcher)
        org.junit.jupiter.api.Assertions.assertNull(manualShareNotifyRepository.findById(EventManualShareNotifyId(eventId, "availability_nudge")).orElse(null))
    }

    @Test
    @Tag("FR31")
    fun `POST availability_nudge rejects a stale preview without side effects`() {
        val admin = adminCookie("sub-nudge-stale-preview")
        val member = memberCookie("sub-nudge-stale-preview-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview =
            mapper.readTree(
                mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients").param("intent", "availability_nudge").cookie(admin))
                    .andExpect(status().isOk).andReturn().response.contentAsString,
            )
        val fingerprint = preview.get("confirmationFingerprint").asText()
        val participantId = preview.get("recipients").first().get("participantId").asText()
        setMyAvailability(member, seasonId, eventId, "available")

        reset(notificationDispatcher)
        mockMvc.perform(
            post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"$fingerprint","recipientParticipantIds":["$participantId"]}""")
                .with(csrf()),
        ).andExpect(status().isConflict)

        verifyNoInteractions(notificationDispatcher)
        org.junit.jupiter.api.Assertions.assertNull(manualShareNotifyRepository.findById(EventManualShareNotifyId(eventId, "availability_nudge")).orElse(null))
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge returns 409 for archived event`() {
        val admin = adminCookie("sub-nudge-admin-archived")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/archive")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(admin),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge returns 403 for member without canManageComposition`() {
        val admin = adminCookie("sub-nudge-admin-5")
        val member = memberCookie("sub-nudge-member-5")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(member),
            ).andExpect(status().isForbidden)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"intent":"availability_nudge","messageText":"Rappel","recipientParticipantIds":[]}""")
                    .with(csrf()),
            ).andExpect(status().isForbidden)
    }
}
