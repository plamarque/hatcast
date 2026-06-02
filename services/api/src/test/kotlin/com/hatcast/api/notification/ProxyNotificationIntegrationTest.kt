package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.ParticipantStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProxyNotificationIntegrationTest {
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
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        org.mockito.kotlin.reset(notificationDispatcher)
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie =
            TestAuthSupport.memberSessionCookieFromGoogleSignIn(
                mockMvc,
                googleIdTokenService,
                googleSub,
                email = "$googleSub@example.com",
                name = "Proxy Notif Admin",
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
            name = "Proxy Notif Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Proxy notification season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2032-08-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Proxy notification event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
        return eventId
    }

    private fun participantIdForUser(
        seasonId: UUID,
        googleSub: String,
    ): UUID {
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

    private fun subjectUserId(googleSub: String): UUID =
        userRepository.findByGoogleSub(googleSub)?.id ?: error("Missing user")

    private fun nameOnlyParticipant(seasonId: UUID, label: String): UUID {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        return seasonParticipantRepository
            .save(
                SeasonParticipantEntity(
                    season = season,
                    displayName = label,
                ),
            ).id
    }

    private fun seedValidatedComposition(
        eventId: UUID,
        assigneeId: UUID,
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
                seasonParticipantId = assigneeId,
                participationStatus = SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun participationPath(
        seasonId: UUID,
        eventId: UUID,
    ): String =
        "/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0/participation"

    @Test
    fun `proxy availability dispatches PROXY_AVAILABILITY_RECORDED to subject`() {
        val admin = adminCookie("sub-proxy-notif-avail-admin")
        memberCookie("sub-proxy-notif-avail-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberParticipantId = participantIdForUser(seasonId, "sub-proxy-notif-avail-member")
        val memberUserId = subjectUserId("sub-proxy-notif-avail-member")
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED &&
                    subjectUserId == memberUserId &&
                    proxyChangeSummary is ProxyChangeSummary.Availability &&
                    (proxyChangeSummary as ProxyChangeSummary.Availability).afterLabel == "Dispo"
            },
        )
    }

    @Test
    fun `self availability does not dispatch proxy intent`() {
        val admin = adminCookie("sub-proxy-notif-self-admin")
        val member = memberCookie("sub-proxy-notif-self-member")
        TestAuthSupport.joinSeedTroupe(mockMvc, member, seedTroupeId)
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(member)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED ||
                    intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED
            },
        )
    }

    @Test
    fun `name-only proxy availability does not dispatch`() {
        val admin = adminCookie("sub-proxy-notif-avail-nameonly")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val nameOnlyId = nameOnlyParticipant(seasonId, "Name Only Avail")
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$nameOnlyId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED },
        )
    }

    @Test
    fun `proxy comment-only edit dispatches PROXY_AVAILABILITY_RECORDED`() {
        val admin = adminCookie("sub-proxy-notif-comment-admin")
        memberCookie("sub-proxy-notif-comment-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberParticipantId = participantIdForUser(seasonId, "sub-proxy-notif-comment-member")
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"],"comment":"Note orga"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED &&
                    proxyChangeSummary is ProxyChangeSummary.Availability &&
                    (proxyChangeSummary as ProxyChangeSummary.Availability).commentSnippet == "Note orga"
            },
        )
    }

    @Test
    fun `proxy confirm dispatches PROXY_CONFIRMATION_RECORDED to subject`() {
        val admin = adminCookie("sub-proxy-notif-part-admin")
        memberCookie("sub-proxy-notif-part-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-proxy-notif-part-member")
        val memberUserId = subjectUserId("sub-proxy-notif-part-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED &&
                    subjectUserId == memberUserId &&
                    roleKey == "player" &&
                    proxyChangeSummary is ProxyChangeSummary.Participation &&
                    (proxyChangeSummary as ProxyChangeSummary.Participation).decisionLabel == "Confirmé"
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.CONFIRMATION_REQUEST },
        )
    }

    @Test
    fun `proxy decline dispatches PROXY_CONFIRMATION_RECORDED to subject`() {
        val admin = adminCookie("sub-proxy-notif-decline-admin")
        memberCookie("sub-proxy-notif-decline-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-proxy-notif-decline-member")
        val memberUserId = subjectUserId("sub-proxy-notif-decline-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"declined"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED &&
                    subjectUserId == memberUserId &&
                    proxyChangeSummary is ProxyChangeSummary.Participation &&
                    (proxyChangeSummary as ProxyChangeSummary.Participation).decisionLabel == "Décliné"
            },
        )
    }

    @Test
    fun `proxy reset dispatches PROXY_CONFIRMATION_RECORDED with pending decision`() {
        val admin = adminCookie("sub-proxy-notif-reset-admin")
        memberCookie("sub-proxy-notif-reset-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-proxy-notif-reset-member")
        val memberUserId = subjectUserId("sub-proxy-notif-reset-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"pending"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED &&
                    subjectUserId == memberUserId &&
                    proxyChangeSummary is ProxyChangeSummary.Participation &&
                    (proxyChangeSummary as ProxyChangeSummary.Participation).decisionLabel == "À confirmer"
            },
        )
    }

    @Test
    fun `repeat proxy availability with unchanged data does not dispatch`() {
        val admin = adminCookie("sub-proxy-notif-idem-avail-admin")
        memberCookie("sub-proxy-notif-idem-avail-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberParticipantId = participantIdForUser(seasonId, "sub-proxy-notif-idem-avail-member")
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$memberParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"available","roleKeys":["player"]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED },
        )
    }

    @Test
    fun `repeat proxy confirm with same status does not dispatch`() {
        val admin = adminCookie("sub-proxy-notif-idem-part-admin")
        memberCookie("sub-proxy-notif-idem-part-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-proxy-notif-idem-part-member")
        seedValidatedComposition(eventId, memberId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED },
        )
    }

    @Test
    fun `membership-linked proxy availability dispatches to linked user`() {
        val admin = adminCookie("sub-proxy-notif-memlink-admin")
        memberCookie("sub-proxy-notif-memlink-member")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val memberUser = userRepository.findByGoogleSub("sub-proxy-notif-memlink-member")!!
        val membership =
            membershipRepository.findByTroupe_IdAndUser_Id(seedTroupeId, memberUser.id)
                ?: error("Missing membership")
        val season = seasonRepository.findById(seasonId).orElseThrow()
        val membershipOnlyParticipantId =
            seasonParticipantRepository
                .save(
                    SeasonParticipantEntity(
                        season = season,
                        displayName = "Membership linked",
                        normalizedEmail = requireNotNull(memberUser.email).lowercase(),
                        user = null,
                        troupeMembership = membership,
                        status = ParticipantStatus.ACTIVE,
                    ),
                ).id
        val proxyPath =
            "/v1/seasons/$seasonId/events/$eventId/availability/participants/$membershipOnlyParticipantId"

        mockMvc
            .perform(
                put(proxyPath)
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"unavailable"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.PROXY_AVAILABILITY_RECORDED &&
                    subjectUserId == memberUser.id
            },
        )
    }

    @Test
    fun `organizer confirm on own slot does not dispatch proxy intent`() {
        val admin = adminCookie("sub-proxy-notif-own-admin")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val adminParticipantId = participantIdForUser(seasonId, "sub-proxy-notif-own-admin")
        seedValidatedComposition(eventId, adminParticipantId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED },
        )
    }

    @Test
    fun `name-only proxy participation does not dispatch`() {
        val admin = adminCookie("sub-proxy-notif-part-nameonly")
        val seasonId = createSeason(admin)
        val eventId = createEvent(admin, seasonId)
        val nameOnlyId = nameOnlyParticipant(seasonId, "Name Only Part")
        seedValidatedComposition(eventId, nameOnlyId)

        mockMvc
            .perform(
                post(participationPath(seasonId, eventId))
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status":"confirmed"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.PROXY_CONFIRMATION_RECORDED },
        )
    }
}
