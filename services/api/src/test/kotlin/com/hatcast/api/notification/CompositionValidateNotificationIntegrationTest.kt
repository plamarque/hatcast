package com.hatcast.api.notification

import com.fasterxml.jackson.databind.ObjectMapper
import com.hatcast.api.auth.GoogleIdTokenService
import com.hatcast.api.auth.IdpIdTokenVerifier
import com.hatcast.api.auth.SessionUserPrincipal
import com.hatcast.api.composition.CompositionService
import com.hatcast.api.composition.EventCompositionEntity
import com.hatcast.api.composition.EventCompositionRepository
import com.hatcast.api.composition.EventCompositionSlotEntity
import com.hatcast.api.composition.EventCompositionSlotRepository
import com.hatcast.api.composition.SlotParticipationStatus
import com.hatcast.api.participant.SeasonParticipantEntity
import com.hatcast.api.participant.SeasonParticipantRepository
import com.hatcast.api.participant.SeasonParticipantService
import com.hatcast.api.season.SeasonRepository
import com.hatcast.api.support.TestAuthSupport
import com.hatcast.api.troupe.TroupeBaselineRole
import com.hatcast.api.troupe.TroupeMembershipRepository
import com.hatcast.api.user.UserRepository
import org.junit.jupiter.api.Assertions.assertThrows
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
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.stereotype.Service
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(CompositionValidateNotificationIntegrationTest.RollbackTestConfig::class)
class CompositionValidateNotificationIntegrationTest {
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

    @Autowired
    private lateinit var rollbackProbe: ValidateCompositionRollbackProbe

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
                name = "Validate Notif Admin",
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
            name = "Validate Notif Member",
        )

    private fun adminPrincipal(googleSub: String): SessionUserPrincipal {
        val user = userRepository.findByGoogleSub(googleSub) ?: error("Missing user")
        return SessionUserPrincipal(
            userId = user.id,
            googleSub = googleSub,
            idpUid = user.idpUid,
            email = user.email,
        )
    }

    private fun createSeason(cookie: jakarta.servlet.http.Cookie): UUID {
        val res =
            mockMvc
                .perform(
                    post("/v1/troupes/$seedTroupeId/seasons")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""{"title":"Validate notification season"}""")
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
        val future = Instant.parse("2032-07-01T19:00:00Z")
        val res =
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events")
                        .cookie(cookie)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(
                            """
                            {
                              "title": "Validate notification event",
                              "startsAt": "$future",
                              "roleSlots": { "player": 2 }
                            }
                            """.trimIndent(),
                        ).with(csrf()),
                ).andExpect(status().isOk)
                .andReturn()
        val eventId = UUID.fromString(mapper.readTree(res.response.contentAsString).get("id").asText())
        if (openAvailability) {
            mockMvc
                .perform(
                    post("/v1/seasons/$seasonId/events/$eventId/actions/open-availability")
                        .cookie(cookie)
                        .with(csrf()),
                ).andExpect(status().isOk)
        }
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

    private fun addRosterWithoutUser(
        seasonId: UUID,
        label: String,
    ) {
        val season = seasonRepository.findById(seasonId).orElseThrow()
        seasonParticipantRepository.save(
            SeasonParticipantEntity(
                season = season,
                displayName = label,
            ),
        )
    }

    private fun seedDraftComposition(
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
    }

    @Test
    fun `validate dispatches CONFIRMATION_REQUEST to assignees only`() {
        val admin = adminCookie("sub-validate-notif-admin-1")
        memberCookie("sub-validate-notif-assignee-1")
        memberCookie("sub-validate-notif-assignee-2")
        repeat(8) { index ->
            memberCookie("sub-validate-notif-roster-$index")
        }
        val seasonId = createSeason(admin)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
        repeat(10) { index ->
            addRosterWithoutUser(seasonId, "Extra $index")
        }
        val eventId = createEvent(admin, seasonId)
        org.mockito.kotlin.reset(notificationDispatcher)
        val assignee1 = participantIdForUser(seasonId, "sub-validate-notif-assignee-1")
        val assignee2 = participantIdForUser(seasonId, "sub-validate-notif-assignee-2")
        seedDraftComposition(eventId, listOf(assignee1, assignee2))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/validate")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST &&
                    eventId == this.eventId &&
                    assigneeParticipantIds.isEmpty()
            },
        )
        verify(notificationDispatcher, times(1)).dispatch(
            argThat {
                intent == NotificationIntent.TEAM_VALIDATED_FYI &&
                    eventId == this.eventId
            },
        )
    }

    @Test
    fun `validate rollback does not dispatch CONFIRMATION_REQUEST`() {
        val googleSub = "sub-validate-notif-admin-rollback"
        val admin = adminCookie(googleSub)
        memberCookie("sub-validate-notif-rollback-assignee")
        val seasonId = createSeason(admin)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
        val eventId = createEvent(admin, seasonId)
        org.mockito.kotlin.reset(notificationDispatcher)
        val assignee = participantIdForUser(seasonId, "sub-validate-notif-rollback-assignee")
        seedDraftComposition(eventId, listOf(assignee))
        val principal = adminPrincipal(googleSub)

        assertThrows(IllegalStateException::class.java) {
            rollbackProbe.validateThenFail(seasonId, eventId, principal)
        }

        verify(notificationDispatcher, never()).dispatch(any())
    }

    @Test
    fun `publish draft composition does not dispatch member notifications`() {
        val admin = adminCookie("sub-validate-notif-admin-2")
        memberCookie("sub-validate-notif-publish-1")
        val seasonId = createSeason(admin)
        seasonParticipantService.ensureMembershipParticipants(seasonRepository.findById(seasonId).orElseThrow())
        val eventId = createEvent(admin, seasonId, openAvailability = false)
        org.mockito.kotlin.reset(notificationDispatcher)
        val participantId = participantIdForUser(seasonId, "sub-validate-notif-publish-1")
        seedDraftComposition(eventId, listOf(participantId))

        mockMvc
            .perform(
                post("/v1/seasons/$seasonId/events/$eventId/composition/publish")
                    .cookie(admin)
                    .with(csrf()),
            ).andExpect(status().isOk)

        verify(notificationDispatcher, never()).dispatch(
            argThat {
                intent == NotificationIntent.CONFIRMATION_REQUEST ||
                    intent == NotificationIntent.AVAILABILITY_OPENED
            },
        )
    }

    @TestConfiguration
    class RollbackTestConfig {
        @Bean
        fun validateCompositionRollbackProbe(compositionService: CompositionService): ValidateCompositionRollbackProbe =
            ValidateCompositionRollbackProbe(compositionService)
    }
}

@Service
class ValidateCompositionRollbackProbe(
    private val compositionService: CompositionService,
) {
    @Transactional
    fun validateThenFail(
        seasonId: UUID,
        eventId: UUID,
        principal: SessionUserPrincipal,
    ) {
        compositionService.validateComposition(seasonId, eventId, principal)
        throw IllegalStateException("forced rollback for test")
    }
}
