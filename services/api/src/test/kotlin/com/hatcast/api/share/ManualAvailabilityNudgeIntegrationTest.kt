package com.hatcast.api.share

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.notification.NotificationDispatchContext
import com.hatcast.api.notification.NotificationDispatcher
import com.hatcast.api.notification.NotificationIntent
import com.hatcast.api.notification.NotificationRecipientResolver
import com.hatcast.api.organizer.SeasonOrganizerEntity
import com.hatcast.api.organizer.SeasonOrganizerRepository
import com.hatcast.api.participant.EventParticipantEntity
import com.hatcast.api.participant.EventParticipantRepository
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRemovalSource
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.event.EventRepository
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import org.mockito.kotlin.argThat
import org.mockito.kotlin.reset
import org.mockito.kotlin.verify
import org.mockito.kotlin.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.test.mock.mockito.SpyBean
import org.mockito.Mockito.doReturn
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

    @SpyBean
    private lateinit var recipientResolver: NotificationRecipientResolver

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
    private lateinit var eventParticipantRepository: EventParticipantRepository

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var seasonOrganizerRepository: SeasonOrganizerRepository

    @Autowired
    private lateinit var manualShareNotifyRepository: EventManualShareNotifyRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        reset(notificationDispatcher)
        whenever(notificationDispatcher.dispatch(any())).thenAnswer { invocation ->
            invocation.getArgument<NotificationDispatchContext>(0).recipientUserIds.toSet()
        }
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
            .andExpect(jsonPath("$.acceptedRecipients.length()").value(1))
            .andExpect(jsonPath("$.acceptedRecipients[0].participantId").value(selectedParticipantId))
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
    fun `final recheck returning no unknown accounts reports no accepted recipients`() {
        val admin = adminCookie("sub-nudge-race-admin")
        memberCookie("sub-nudge-race-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        doReturn(emptyMap<UUID, UUID>()).`when`(recipientResolver)
            .resolveUnknownAvailabilityParticipantAccounts(seasonId, eventId)
        reset(notificationDispatcher)
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}"}""")
            .with(csrf())).andExpect(status().isOk)
            .andExpect(jsonPath("$.acceptedCount").value(0))
            .andExpect(jsonPath("$.acceptedRecipients.length()").value(0))
        verifyNoInteractions(notificationDispatcher)
        val refreshed = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        org.junit.jupiter.api.Assertions.assertEquals(preview.get("lastManualNotifyAt"), refreshed.get("lastManualNotifyAt"))
    }

    @Test
    fun `final recheck excludes an account that answered after confirmation`() {
        val admin = adminCookie("sub-nudge-partial-admin")
        val keptSub = "sub-nudge-partial-kept"
        val answeredSub = "sub-nudge-partial-answered"
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc, googleIdTokenService, keptSub, email = "$keptSub@example.com", name = "Encore sans réponse",
        )
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc, googleIdTokenService, answeredSub, email = "$answeredSub@example.com", name = "A répondu",
        )
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val keptUser = userRepository.findByGoogleSub(keptSub) ?: error("Missing kept user")
        val answeredUser = userRepository.findByGoogleSub(answeredSub) ?: error("Missing answered user")
        fun participantFor(userId: UUID): SeasonParticipantEntity {
            val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, userId) ?: error("Missing membership")
            return seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id) ?: error("Missing participant")
        }
        val kept = participantFor(keptUser.id)
        val answered = participantFor(answeredUser.id)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        val selectedIds = setOf(kept.id.toString(), answered.id.toString())
        val selected = preview.get("recipients").filter { it.get("participantId").asText() in selectedIds }
        org.junit.jupiter.api.Assertions.assertEquals(2, selected.size)
        org.junit.jupiter.api.Assertions.assertEquals(setOf("Encore sans réponse", "A répondu"), selected.map { it.get("displayName").asText() }.toSet())
        org.junit.jupiter.api.Assertions.assertTrue(selected.all {
            it.get("channels").get("email").get("eligible").asBoolean() ||
                it.get("channels").get("push").get("eligible").asBoolean()
        }, "Both accounts must be eligible at confirmation")

        // Simulate the later resolver observing that one account has answered.
        doReturn(mapOf(kept.id to keptUser.id))
            .`when`(recipientResolver).resolveUnknownAvailabilityParticipantAccounts(seasonId, eventId)
        reset(notificationDispatcher)
        whenever(notificationDispatcher.dispatch(any())).thenReturn(setOf(keptUser.id))
        val ids = selected.joinToString(",") { "\"${it.get("participantId").asText()}\"" }
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}","recipientParticipantIds":[$ids]}""")
            .with(csrf())).andExpect(status().isOk)
            .andExpect(jsonPath("$.acceptedCount").value(1))
            .andExpect(jsonPath("$.acceptedRecipients.length()").value(1))
            .andExpect(jsonPath("$.acceptedRecipients[0].participantId").value(kept.id.toString()))
            .andExpect(jsonPath("$.acceptedRecipients[0].displayName").value("Encore sans réponse"))
            .andExpect(jsonPath("$.failedRecipients.length()").value(0))
        verify(notificationDispatcher).dispatch(argThat { ctx: NotificationDispatchContext ->
            ctx.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE &&
                ctx.recipientUserIds == listOf(keptUser.id) &&
                ctx.recipientChannels.keys == setOf(keptUser.id)
        })
    }

    @Test
    fun `response excludes a selected account not processed by dispatcher`() {
        val admin = adminCookie("sub-nudge-dispatch-admin")
        val keptSub = "sub-nudge-dispatch-kept"
        val answeredSub = "sub-nudge-dispatch-failed"
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc, googleIdTokenService, keptSub, email = "$keptSub@example.com", name = "Encore sans réponse",
        )
        TestAuthSupport.memberSessionCookieFromGoogleSignIn(
            mockMvc, googleIdTokenService, answeredSub, email = "$answeredSub@example.com", name = "A répondu",
        )
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val keptUser = userRepository.findByGoogleSub(keptSub) ?: error("Missing kept user")
        val answeredUser = userRepository.findByGoogleSub(answeredSub) ?: error("Missing answered user")
        fun participantFor(userId: UUID): SeasonParticipantEntity {
            val membership = membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, userId) ?: error("Missing membership")
            return seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(seasonId, membership.id) ?: error("Missing participant")
        }
        val kept = participantFor(keptUser.id)
        val answered = participantFor(answeredUser.id)
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        val selectedIds = setOf(kept.id.toString(), answered.id.toString())
        val selected = preview.get("recipients").filter { it.get("participantId").asText() in selectedIds }
        org.junit.jupiter.api.Assertions.assertEquals(2, selected.size)
        org.junit.jupiter.api.Assertions.assertEquals(setOf("Encore sans réponse", "A répondu"), selected.map { it.get("displayName").asText() }.toSet())
        org.junit.jupiter.api.Assertions.assertTrue(selected.all {
            it.get("channels").get("email").get("eligible").asBoolean() ||
                it.get("channels").get("push").get("eligible").asBoolean()
        }, "Both accounts must be eligible at confirmation")

        // Both are still unanswered, but only one notification was sent.
        doReturn(mapOf(kept.id to keptUser.id, answered.id to answeredUser.id))
            .`when`(recipientResolver).resolveUnknownAvailabilityParticipantAccounts(seasonId, eventId)
        reset(notificationDispatcher)
        whenever(notificationDispatcher.dispatch(any())).thenReturn(setOf(keptUser.id))
        val ids = selected.joinToString(",") { "\"${it.get("participantId").asText()}\"" }
        mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}","recipientParticipantIds":[$ids]}""")
            .with(csrf())).andExpect(status().isOk)
            .andExpect(jsonPath("$.acceptedCount").value(1))
            .andExpect(jsonPath("$.acceptedRecipients.length()").value(1))
            .andExpect(jsonPath("$.acceptedRecipients[0].participantId").value(kept.id.toString()))
            .andExpect(jsonPath("$.acceptedRecipients[0].displayName").value("Encore sans réponse"))
            .andExpect(jsonPath("$.failedRecipients.length()").value(1))
            .andExpect(jsonPath("$.failedRecipients[0].participantId").value(answered.id.toString()))
        verify(notificationDispatcher).dispatch(argThat { ctx: NotificationDispatchContext ->
            ctx.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE &&
                ctx.recipientUserIds.toSet() == setOf(keptUser.id, answeredUser.id) &&
                ctx.recipientChannels.keys == setOf(keptUser.id, answeredUser.id)
        })
    }

    @Test
    fun `duplicate participant rows for an account yield a single deterministic accepted name`() {
        val admin = adminCookie("sub-nudge-duplicate-admin")
        val sub = "sub-nudge-duplicate-member"
        memberCookie(sub)
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val user = userRepository.findByGoogleSub(sub) ?: error("Missing user")
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val duplicate = seasonParticipantRepository.save(SeasonParticipantEntity(season = season, displayName = "AAA Duplicate", user = user))
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        val original = seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
            seasonId, membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)!!.id,
        ) ?: error("Missing original participant")
        val idsForUser = setOf(duplicate.id.toString(), original.id.toString())
        val rows = preview.get("recipients").filter { it.get("participantId").asText() in idsForUser }
        org.junit.jupiter.api.Assertions.assertTrue(rows.size >= 2, "Fixture must contain two participant rows")
        val ids = rows.joinToString(",") { "\"${it.get("participantId").asText()}\"" }
        val response = mapper.readTree(mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}","recipientParticipantIds":[$ids]}""")
            .with(csrf())).andExpect(status().isOk).andReturn().response.contentAsString)
        org.junit.jupiter.api.Assertions.assertEquals(1, response.get("acceptedCount").asInt())
        org.junit.jupiter.api.Assertions.assertEquals("AAA Duplicate", response.get("acceptedRecipients")[0].get("displayName").asText())
        verify(notificationDispatcher).dispatch(argThat { ctx: NotificationDispatchContext -> ctx.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE && ctx.recipientUserIds == listOf(user.id) })
    }

    @Test
    fun `answered duplicate row cannot supply the accepted identity`() {
        val admin = adminCookie("sub-nudge-answered-duplicate-admin")
        val sub = "sub-nudge-answered-duplicate-member"
        memberCookie(sub)
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val user = userRepository.findByGoogleSub(sub) ?: error("Missing user")
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val duplicate = seasonParticipantRepository.save(SeasonParticipantEntity(season = season, displayName = "AAA Duplicate", user = user))
        val eventId = createEvent(admin, seasonId)
        openAvailability(admin, seasonId, eventId)
        val preview = mapper.readTree(mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
            .param("intent", "availability_nudge").cookie(admin)).andExpect(status().isOk).andReturn().response.contentAsString)
        val original = seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
            seasonId, membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, user.id)!!.id,
        ) ?: error("Missing original participant")
        val idsForUser = setOf(duplicate.id.toString(), original.id.toString())
        val rows = preview.get("recipients").filter { it.get("participantId").asText() in idsForUser }
        org.junit.jupiter.api.Assertions.assertTrue(rows.size >= 2, "Fixture must contain two participant rows")
        doReturn(mapOf(original.id to user.id)).`when`(recipientResolver)
            .resolveUnknownAvailabilityParticipantAccounts(seasonId, eventId)
        val ids = rows.joinToString(",") { "\"${it.get("participantId").asText()}\"" }
        val response = mapper.readTree(mockMvc.perform(post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify").cookie(admin)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""{"intent":"availability_nudge","messageText":"Rappel","confirmationFingerprint":"${preview.get("confirmationFingerprint").asText()}","recipientParticipantIds":[$ids]}""")
            .with(csrf())).andExpect(status().isOk).andReturn().response.contentAsString)
        org.junit.jupiter.api.Assertions.assertEquals(1, response.get("acceptedCount").asInt())
        org.junit.jupiter.api.Assertions.assertEquals(original.id.toString(), response.get("acceptedRecipients")[0].get("participantId").asText())
        org.junit.jupiter.api.Assertions.assertEquals("Nudge Member", response.get("acceptedRecipients")[0].get("displayName").asText())
        verify(notificationDispatcher).dispatch(argThat { ctx: NotificationDispatchContext -> ctx.intent == NotificationIntent.MANUAL_AVAILABILITY_NUDGE && ctx.recipientUserIds == listOf(user.id) })
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
        val organizerUser = userRepository.findByGoogleSub(organizerSub) ?: error("Missing organizer user")
        val organizerSeasonParticipant =
            seasonParticipantRepository.findBySeason_IdAndTroupeMembership_Id(
                seasonId,
                membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, organizerUser.id)?.id
                    ?: error("Missing organizer membership"),
            ) ?: error("Missing organizer season participant")
        eventParticipantRepository.save(
            EventParticipantEntity(
                event = eventRepository.findById(eventId).orElseThrow(),
                displayName = organizerSeasonParticipant.displayName,
                user = organizerUser,
                seasonParticipant = organizerSeasonParticipant,
                status = ParticipantStatus.ACTIVE,
            ),
        )
        openAvailability(admin, seasonId, eventId)

        val summary =
            mapper.readTree(
                mockMvc.perform(get("/v1/seasons/$seasonId/events/$eventId/availability/summary").cookie(organizer))
                    .andExpect(status().isOk).andReturn().response.contentAsString,
            )
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
