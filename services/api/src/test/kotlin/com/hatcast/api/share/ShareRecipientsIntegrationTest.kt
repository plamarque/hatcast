package com.hatcast.api.share

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.CompositionNotificationPort
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.notification.NotificationChannel
import com.hatcast.api.notification.NotificationDeliveryLogEntity
import com.hatcast.api.notification.NotificationDeliveryLogRepository
import com.hatcast.api.notification.NotificationDeliveryStatus
import com.hatcast.api.notification.NotificationIntent
import com.hatcast.api.notification.UserPushSubscriptionEntity
import com.hatcast.api.notification.UserPushSubscriptionRepository
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Tag
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.eq
import org.mockito.kotlin.verify
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ShareRecipientsIntegrationTest {
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
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var deliveryLogRepository: NotificationDeliveryLogRepository

    @Autowired
    private lateinit var pushSubscriptionRepository: UserPushSubscriptionRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Share Recipients Test",
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
            name = "Share Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Share season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(cookie: jakarta.servlet.http.Cookie, seasonId: UUID): UUID {
        val future = Instant.parse("2031-06-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Share event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createParticipant(
        seasonId: UUID,
        name: String,
        email: String?,
    ): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val saved =
            seasonParticipantRepository.save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = name,
                    normalizedEmail = email,
                ),
            )
        return saved.id
    }

    private fun seedComposition(
        eventId: UUID,
        participantId: UUID,
        validatedAt: Instant? = null,
    ) {
        val now = Instant.now()
        compositionRepository.save(
            EventCompositionEntity(
                eventId = eventId,
                validatedAt = validatedAt,
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

    @Test
    @Tag("FR31")
    fun `GET share-recipients draw returns assignees with obfuscated email`() {
        val cookie = adminCookie("sub-share-admin-1")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Alice", "alice.secret@example.com")
        seedComposition(eventId, participantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "draw")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.total").value(1))
            .andExpect(jsonPath("$.notifiableCount").value(1))
            .andExpect(jsonPath("$.manualCount").value(0))
            .andExpect(jsonPath("$.recipients[0].displayName").value("Alice"))
            .andExpect(jsonPath("$.recipients[0].channels.email.eligible").value(true))
            .andExpect(jsonPath("$.recipients[0].channels.email.notified").value(false))
            .andExpect(jsonPath("$.recipients[0].channels.push.eligible").value(false))
            .andExpect(jsonPath("$.recipients[0].channels.push.notified").value(false))
            .andExpect(jsonPath("$.recipients[0].emailObfuscated").value("ali••@ex••.com"))
    }

    @Test
    @Tag("FR31")
    fun `GET share-recipients returns 403 for member without canManageComposition`() {
        val adminCookie = adminCookie("sub-share-admin-2")
        val memberCookie = memberCookie("sub-share-member-2")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createParticipant(seasonId, "Bob", null)
        seedComposition(eventId, participantId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "draw")
                    .cookie(memberCookie),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR31")
    fun `GET share-recipients composition returns 409 when no assignees`() {
        val cookie = adminCookie("sub-share-admin-3")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "composition")
                    .cookie(cookie),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `POST notify invokes manual announcement port`() {
        val cookie = adminCookie("sub-share-admin-4")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Carol", "carol@example.com")
        seedComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"intent":"draw","messageText":"🎲 TIRAGE test message"}""",
                    ).with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.accepted").value(true))
            .andExpect(jsonPath("$.notifiedCount").value(0))
            .andExpect(jsonPath("$.intent").value("draw"))

        verify(notificationPort).requestManualAnnouncement(
            eq(eventId),
            eq(seasonId),
            eq("draw"),
            eq("🎲 TIRAGE test message"),
            any(),
        )
    }

    @Test
    @Tag("FR31")
    fun `GET share-recipients event intent lists season participants`() {
        val cookie = adminCookie("sub-share-admin-5")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        createParticipant(seasonId, "Dave", "dave@example.com")
        createParticipant(seasonId, "Eve", null)

        val body =
            mockMvc
                .perform(
                    get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                        .param("intent", "event")
                        .cookie(cookie),
                ).andExpect(status().isOk)
                .andReturn()
                .response.contentAsString

        val tree = mapper.readTree(body)
        assertTrue(tree.get("total").asInt() >= 2)
        val emails =
            tree.get("recipients").map { node ->
                node.get("emailObfuscated")?.asText()
            }
        assertTrue(emails.any { it?.contains("••") == true })
        val manual = tree.get("manualCount").asInt()
        assertTrue(manual >= 1)
    }

    @Test
    @Tag("FR31")
    fun `GET share-recipients draw returns 409 when composition is validated`() {
        val cookie = adminCookie("sub-share-admin-6")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Frank", "frank@example.com")
        seedComposition(eventId, participantId, validatedAt = Instant.now())

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "draw")
                    .cookie(cookie),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `POST notify returns 403 for member without canManageComposition`() {
        val adminCookie = adminCookie("sub-share-admin-7")
        val memberCookie = memberCookie("sub-share-member-7")
        val seasonId = createSeason(adminCookie)
        val eventId = createEvent(adminCookie, seasonId)
        val participantId = createParticipant(seasonId, "Gina", null)
        seedComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(memberCookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"intent":"draw","messageText":"Test notify"}""",
                    ).with(csrf()),
            ).andExpect(status().isForbidden)
    }

    @Test
    @Tag("FR31")
    fun `POST notify draw returns 409 when composition is validated`() {
        val cookie = adminCookie("sub-share-admin-8")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Helen", "helen@example.com")
        seedComposition(eventId, participantId, validatedAt = Instant.now())

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        """{"intent":"draw","messageText":"Late draw"}""",
                    ).with(csrf()),
            ).andExpect(status().isConflict)
    }

    @Test
    @Tag("FR31")
    fun `GET draw returns guardDays and lastManualNotifyAt after POST`() {
        val cookie = adminCookie("sub-share-admin-guard-draw")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Ivy", "ivy@example.com")
        seedComposition(eventId, participantId)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"intent":"draw","messageText":"Draw share test"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.notifiedCount").value(0))
            .andExpect(jsonPath("$.manualCount").isNumber)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "draw")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.guardDays").value(3))
            .andExpect(jsonPath("$.lastManualNotifyAt").exists())
    }

    @Test
    @Tag("FR31")
    fun `GET composition guard is independent from draw`() {
        val cookie = adminCookie("sub-share-admin-guard-compo")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val participantId = createParticipant(seasonId, "Jack", "jack@example.com")
        seedComposition(eventId, participantId, validatedAt = Instant.now())

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"intent":"draw","messageText":"Should fail"}""")
                    .with(csrf()),
            ).andExpect(status().isConflict)

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "composition")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.lastManualNotifyAt").isEmpty)
    }

    @Test
    @Tag("FR31")
    fun `GET event intent reflects AVAILABILITY_OPENED delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-event-notified")
        memberCookie("sub-share-member-event-notified")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser = userRepository.findByGoogleSub("sub-share-member-event-notified") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")
        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.AVAILABILITY_OPENED,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "event")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.eligible",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET event intent reflects MANUAL_AVAILABILITY_ANNOUNCE delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-event-manual-announce")
        memberCookie("sub-share-member-event-manual-announce")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser =
            userRepository.findByGoogleSub("sub-share-member-event-manual-announce") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")
        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.MANUAL_AVAILABILITY_ANNOUNCE,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "event")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.eligible",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

    @Test
    @Tag("FR31")
    fun `POST event notify returns notifiedCount from preview and calls notification port`() {
        val cookie = adminCookie("sub-share-admin-event-post")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        createParticipant(seasonId, "Laura", "laura@example.com")
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/share-recipients/notify")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"intent":"event","messageText":"📢 Invite dispos test"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
            .andExpect(jsonPath("$.accepted").value(true))
            .andExpect(jsonPath("$.intent").value("event"))
            .andExpect(jsonPath("$.notifiedCount").value(org.hamcrest.Matchers.greaterThan(0)))

        verify(notificationPort).requestManualAnnouncement(
            eq(eventId),
            eq(seasonId),
            eq("event"),
            eq("📢 Invite dispos test"),
            any(),
        )
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge reflects AVAILABILITY_OPENED delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-nudge-opened")
        memberCookie("sub-share-member-nudge-opened")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser = userRepository.findByGoogleSub("sub-share-member-nudge-opened") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.AVAILABILITY_OPENED,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET event intent marks push eligible when subscription and prefs allow`() {
        val cookie = adminCookie("sub-share-admin-event-push")
        memberCookie("sub-share-member-event-push")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser = userRepository.findByGoogleSub("sub-share-member-event-push") ?: error("Missing user")
        memberUser.pushNotificationsEnabled = true
        userRepository.save(memberUser)
        pushSubscriptionRepository.save(
            UserPushSubscriptionEntity(
                user = memberUser,
                endpoint = "https://fcm.googleapis.com/fcm/send/event-push-${memberUser.id}",
                p256dhKey = "p256dh",
                authKey = "auth",
            ),
        )
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "event")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.push.eligible",
                ).value(true),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge reflects MANUAL_AVAILABILITY_NUDGE delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-nudge-notified")
        memberCookie("sub-share-member-nudge-notified")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser = userRepository.findByGoogleSub("sub-share-member-nudge-notified") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.MANUAL_AVAILABILITY_NUDGE,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.eligible",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET composition reflects CONFIRMATION_REQUEST delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-compo-notified")
        memberCookie("sub-share-member-compo-notified")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser =
            userRepository.findByGoogleSub("sub-share-member-compo-notified") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")
        seedComposition(eventId, participant.id, validatedAt = Instant.now())

        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.CONFIRMATION_REQUEST,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "composition")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET draw reflects COMPOSITION_SHARED delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-draw-notified")
        memberCookie("sub-share-member-draw-notified")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser =
            userRepository.findByGoogleSub("sub-share-member-draw-notified") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")
        seedComposition(eventId, participant.id)

        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.COMPOSITION_SHARED,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "draw")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

    @Test
    @Tag("FR31")
    fun `GET availability_nudge reflects AVAILABILITY_PENDING_REMINDER delivery logs as notified`() {
        val cookie = adminCookie("sub-share-admin-nudge-pending-reminder")
        memberCookie("sub-share-member-nudge-pending-reminder")
        val seasonId = createSeason(cookie)
        val eventId = createEvent(cookie, seasonId)
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
        val memberUser =
            userRepository.findByGoogleSub("sub-share-member-nudge-pending-reminder") ?: error("Missing user")
        val participant =
            seasonParticipantRepository
                .findBySeason_IdAndStatusOrderByDisplayNameAsc(seasonId, com.hatcast.api.participant.ParticipantStatus.ACTIVE)
                .firstOrNull { it.user?.id == memberUser.id }
                ?: error("Missing roster participant")

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)

        deliveryLogRepository.save(
            NotificationDeliveryLogEntity(
                intent = NotificationIntent.AVAILABILITY_PENDING_REMINDER,
                userId = memberUser.id,
                channel = NotificationChannel.EMAIL,
                status = NotificationDeliveryStatus.SENT,
                eventId = eventId,
            ),
        )

        mockMvc
            .perform(
                get("/v1/seasons/$seasonId/events/$eventId/share-recipients")
                    .param("intent", "availability_nudge")
                    .cookie(cookie),
            ).andExpect(status().isOk)
            .andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.notified",
                ).value(true),
            ).andExpect(
                jsonPath(
                    "$.recipients[?(@.participantId == '${participant.id}')].channels.email.lastNotifiedAt",
                ).exists(),
            )
    }

}
