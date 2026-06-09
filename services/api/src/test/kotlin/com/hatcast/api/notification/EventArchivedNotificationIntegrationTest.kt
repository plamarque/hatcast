package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionDeclineEntity
import com.hatcast.api.composition.EventCompositionDeclineRepository
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.support.EventTestSupport
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventArchivedNotificationIntegrationTest {
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
                name = "Event Archived Admin",
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
            name = "Event Archived Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Event archived notifications"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2033-08-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Event archived test",
                              "startsAt": "$future",
                              "roleSlots": { "player": 1 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        EventTestSupport.openEventAvailability(mockMvc, cookie, seasonId, eventId)
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

    private fun archiveEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/archive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun unarchiveEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
    ) {
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/actions/unarchive")
                    .cookie(cookie)
                    .with(csrf()),
            ).andExpect(status().isOk)
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

    @Test
    fun `archive dispatches EVENT_ARCHIVED for engaged available member`() {
        val admin = adminCookie("sub-event-archived-avail-admin")
        val member = memberCookie("sub-event-archived-avail-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        setAvailability(member, seasonId, eventId, "available")

        archiveEvent(admin, seasonId, eventId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.EVENT_ARCHIVED &&
                    eventId == this.eventId
            },
        )
    }

    @Test
    fun `unknown availability without composition yields zero engaged archived recipients`() {
        val admin = adminCookie("sub-event-archived-unknown-admin")
        memberCookie("sub-event-archived-unknown-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)

        val recipients = recipientResolver.resolveEventArchivedRecipients(seasonId, eventId)

        org.junit.jupiter.api.Assertions.assertEquals(0, recipients.size)
    }

    @Test
    fun `unarchive does not dispatch EVENT_ARCHIVED`() {
        val admin = adminCookie("sub-event-archived-unarchive-admin")
        val member = memberCookie("sub-event-archived-unarchive-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        setAvailability(member, seasonId, eventId, "available")
        archiveEvent(admin, seasonId, eventId)
        reset(notificationDispatcher)

        unarchiveEvent(admin, seasonId, eventId)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.EVENT_ARCHIVED },
        )
    }

    @Test
    fun `decline row dispatches EVENT_ARCHIVED for engaged member`() {
        val admin = adminCookie("sub-event-archived-decline-admin")
        memberCookie("sub-event-archived-decline-member")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)
        val memberId = participantIdForUser(seasonId, "sub-event-archived-decline-member")
        val adminUser = userRepository.findByGoogleSub("sub-event-archived-decline-admin")!!
        seedDeclineRow(eventId, memberId, adminUser.id)

        archiveEvent(admin, seasonId, eventId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.EVENT_ARCHIVED },
        )
    }
}
