package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
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
class CompositionRemovalNotificationIntegrationTest {
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
    private lateinit var seasonParticipantService: SeasonParticipantService

    @Autowired
    private lateinit var compositionRepository: EventCompositionRepository

    @Autowired
    private lateinit var slotRepository: EventCompositionSlotRepository

    @Autowired
    private lateinit var seasonParticipantRepository: com.hatcast.api.participant.SeasonParticipantRepository

    private val seedTroupeId: UUID = UUID.fromString("a0000001-0000-4000-8000-000000000001")
    private val mapper = ObjectMapper()

    @BeforeEach
    fun resetMocks() {
        org.mockito.kotlin.reset(notificationDispatcher)
    }

    @Test
    fun `unlock clear slot does not notify former assignee until revalidation`() {
        val admin = adminCookie("sub-removal-admin")
        memberCookie("sub-removal-former")
        memberCookie("sub-removal-kept")
        val seasonId = createSeason(admin)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
        val eventId = createEvent(admin, seasonId)
        val formerId = participantIdForUser(seasonId, "sub-removal-former")
        val keptId = participantIdForUser(seasonId, "sub-removal-kept")
        seedAndValidate(admin, seasonId, eventId, listOf(formerId, keptId))
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId": null}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.REMOVED_FROM_COMPOSITION },
        )
    }

    @Test
    fun `unlock replace slot does not notify until composition is validated again`() {
        val admin = adminCookie("sub-replace-admin")
        memberCookie("sub-replace-former")
        val newMember = memberCookie("sub-replace-new")
        val seasonId = createSeason(admin)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
        val eventId = createEvent(admin, seasonId)
        val formerId = participantIdForUser(seasonId, "sub-replace-former")
        val newId = participantIdForUser(seasonId, "sub-replace-new")
        seedAndValidate(admin, seasonId, eventId, listOf(formerId))
        org.mockito.kotlin.reset(notificationDispatcher)

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/unlock")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        setAvailability(newMember, seasonId, eventId, listOf("player"))

        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/composition/slots/player/0")
                    .cookie(admin)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"participantId": "$newId"}""")
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.REMOVED_FROM_COMPOSITION ||
                    intent == NotificationIntent.RECONFIRMATION_REQUEST
            },
        )
        verify(notificationDispatcher, never()).dispatch(
            argThat { intent == NotificationIntent.TEAM_VALIDATED_FYI },
        )
    }

    private fun seedAndValidate(
        admin: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        assigneeIds: List<UUID>,
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
        assigneeIds.forEachIndexed { index, participantId ->
            slotRepository.save(
                EventCompositionSlotEntity(
                    eventId = eventId,
                    roleKey = "player",
                    slotIndex = index,
                    seasonParticipantId = participantId,
                    participationStatus = SlotParticipationStatus.CONFIRMED,
                ),
            )
        }
        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)
    }

    private fun adminCookie(googleSub: String): jakarta.servlet.http.Cookie {
        val cookie = memberCookie(googleSub)
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
            name = "Removal Test",
        )

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Removal season"}""")
                        .with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        return UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
    }

    private fun createEvent(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
    ): UUID {
        val future = Instant.parse("2032-09-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Removal event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
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

    private fun setAvailability(
        cookie: jakarta.servlet.http.Cookie,
        seasonId: UUID,
        eventId: UUID,
        roles: List<String>,
    ) {
        val rolesJson = roles.joinToString(",") { "\"$it\"" }
        mockMvc
            .perform(
                put("/v1/seasons/$seasonId/events/$eventId/availability/me")
                    .cookie(cookie)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"status": "available", "roleKeys": [$rolesJson]}""")
                    .with(csrf()),
            ).andExpect(status().isOk)
    }
}
