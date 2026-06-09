package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventOpenAvailabilityNotificationIntegrationTest {
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
                name = "Open Avail Admin",
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
            name = "Open Avail Member",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Open availability notifications"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2032-06-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Open availability event",
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

    private fun addNameOnlyParticipant(seasonId: UUID) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantRepository.save(
            SeasonParticipantEntity(
                season = season,
                displayName = "Name Only",
            ),
        )
    }

    @Test
    fun `open availability dispatches AVAILABILITY_OPENED after commit`() {
        val admin = adminCookie("sub-open-avail-admin-1")
        memberCookie("sub-open-avail-member-1")
        memberCookie("sub-open-avail-member-2")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        addNameOnlyParticipant(seasonId)
        val eventId = createEvent(admin, seasonId)

        openAvailability(admin, seasonId, eventId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.AVAILABILITY_OPENED &&
                    eventId == this.eventId &&
                    seasonId == this.seasonId
            },
        )
    }

    @Test
    fun `draft event create dispatches EVENT_DRAFT_CREATED not AVAILABILITY_OPENED`() {
        val admin = adminCookie("sub-open-avail-admin-2")
        memberCookie("sub-open-avail-member-3")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        createEvent(admin, seasonId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.EVENT_DRAFT_CREATED },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.AVAILABILITY_OPENED },
        )
    }

    @Test
    fun `idempotent re-open dispatches only once`() {
        val admin = adminCookie("sub-open-avail-admin-3")
        memberCookie("sub-open-avail-member-4")
        val seasonId = createSeason(admin)
        ensureRoster(seasonId)
        val eventId = createEvent(admin, seasonId)

        openAvailability(admin, seasonId, eventId)
        openAvailability(admin, seasonId, eventId)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat { intent == NotificationIntent.AVAILABILITY_OPENED },
        )
    }
}
