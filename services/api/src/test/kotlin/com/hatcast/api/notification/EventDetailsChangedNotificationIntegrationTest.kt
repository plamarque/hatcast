package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import org.mockito.kotlin.never
import org.mockito.kotlin.reset
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventDetailsChangedNotificationIntegrationTest {
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
    private lateinit var seasonParticipantRepository: SeasonParticipantRepository

    @Autowired
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var seasonRepository: com.hatcast.api.season.SeasonRepository

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var declineRepository: EventCompositionDeclineRepository

    @Autowired
    private lateinit var recipientResolver: NotificationRecipientResolver

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
                name = "Event Details Admin",
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
            name = "Event Details Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Event details notifications"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        openAvailability: Boolean = true,
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
                              "title": "Event details changed",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        if (openAvailability) {
            EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
        }
        return eventId
    }

    private fun ensureRoster(seasonId: UUID) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantService.ensureMembershipParticipants(season)
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

    private fun assignSlot(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        participantId: UUID,
    ) {
        seedPendingSlot(eventId, participantId)
    }

    private fun seedPendingSlot(
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
                participationStatus = com.hatcast.api.composition.SlotParticipationStatus.PENDING,
            ),
        )
    }

    private fun seedDeclineRow(
        eventId: UUID,
        participantId: UUID,
        actorUserId: UUID,
    ) {
        val now = Instant.now()
        declineRepository.save(
            EventCompositionDeclineEntity(
                eventId = eventId,
                roleKey = "player",
                slotIndex = 0,
                seasonParticipantId = participantId,
                eventParticipantId = null,
                declinedByUserId = actorUserId,
                declinedAt = now,
                note = null,
                createdAt = now,
            ),
        )
    }

    private fun patchEventDate(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        startsAt: Instant,
    ) {
        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"startsAt":"$startsAt"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun patchEventDescription(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        description: String,
    ) {
        mockMvc
            .perform(
                patch("/v1/seasons/$seasonId/events/$eventId")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"description":"$description"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    @Test
    fun `description-only PATCH does not dispatch EVENT_DETAILS_CHANGED`() {
        val admin = adminCookie("sub-event-details-desc-admin")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)

        patchEventDescription(admin, seasonId, eventId, "Nouvelle description")

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.EVENT_DETAILS_CHANGED },
        )
    }

    @Test
    fun `draft event date change does not dispatch EVENT_DETAILS_CHANGED`() {
        val admin = adminCookie("sub-event-details-draft-admin")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId, openAvailability = false)

        patchEventDate(admin, seasonId, eventId, Instant.parse("2033-07-01T19:00:00Z"))

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.EVENT_DETAILS_CHANGED },
        )
    }

    @Test
    fun `date change dispatches EVENT_DETAILS_CHANGED for engaged available member`() {
        val admin = adminCookie("sub-event-details-avail-admin")
        val member = memberCookie("sub-event-details-avail-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        setAvailability(member, seasonId, eventId, "available")

        patchEventDate(admin, seasonId, eventId, Instant.parse("2033-07-01T19:00:00Z"))

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.EVENT_DETAILS_CHANGED &&
                    eventId == this.eventId &&
                    eventDetailsChangeSummary?.startsAtChange != null
            },
        )
    }

    @Test
    fun `unknown availability without composition yields zero engaged recipients`() {
        val admin = adminCookie("sub-event-details-unknown-admin")
        memberCookie("sub-event-details-unknown-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)

        val recipients = recipientResolver.resolveEngagedEventRosterRecipients(seasonId, eventId)

        org.junit.jupiter.api.Assertions.assertEquals(0, recipients.size)
    }

    @Test
    fun `pending slot without availability dispatches EVENT_DETAILS_CHANGED`() {
        val admin = adminCookie("sub-event-details-pending-admin")
        memberCookie("sub-event-details-pending-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-event-details-pending-member")
        assignSlot(admin, seasonId, eventId, memberId)

        patchEventDate(admin, seasonId, eventId, Instant.parse("2033-07-01T19:00:00Z"))

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.EVENT_DETAILS_CHANGED },
        )
    }

    @Test
    fun `decline row with unknown availability dispatches EVENT_DETAILS_CHANGED`() {
        val admin = adminCookie("sub-event-details-decline-admin")
        memberCookie("sub-event-details-decline-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-event-details-decline-member")
        val adminUser = userRepository.findByGoogleSub("sub-event-details-decline-admin")!!
        seedDeclineRow(eventId, memberId, adminUser.id)

        patchEventDate(admin, seasonId, eventId, Instant.parse("2033-07-01T19:00:00Z"))

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.EVENT_DETAILS_CHANGED },
        )
    }
}
